/* End-to-end test of the host -> invite -> join -> start flow against the race server.
 * Spawns the server on a throwaway port, simulates a host + invited guest,
 * and asserts every step. Run: node scripts/test-room-flow.cjs */
const { spawn } = require('child_process');
const path = require('path');

const PORT = 3999;
const root = path.join(__dirname, '..');

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const WebSocket = require('ws');
  const server = spawn('npx', ['tsx', 'server/server.ts'], {
    cwd: root,
    env: { ...process.env, PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });
  let out = '';
  server.stdout.on('data', (d) => { out += d.toString(); });
  server.stderr.on('data', (d) => { out += d.toString(); });

  const results = [];
  const check = (label, ok, extra = '') => {
    results.push([ok ? 'PASS' : 'FAIL', label, extra]);
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${extra ? `  (${extra})` : ''}`);
  };

  try {
    // wait for server boot
    for (let i = 0; i < 100 && !out.includes('HotKeys race server'); i++) await sleep(100);
    check('server boots', out.includes('HotKeys race server'), out.trim().split('\n')[0] ?? '');

    const connect = () => new Promise((res, rej) => {
      const ws = new WebSocket(`ws://localhost:${PORT}`);
      ws.on('open', () => res(ws));
      ws.on('error', rej);
    });

    const host = await connect();
    const hostStates = [];
    host.on('message', (raw) => {
      const m = JSON.parse(raw.toString());
      if (m.type === 'ROOM_STATE') hostStates.push(m.room);
    });
    host.send(JSON.stringify({ type: 'JOIN_ROOM', payload: { roomCode: 'TEST9', profile: { id: 'host-1', name: 'HOST', car: 'volt' } } }));
    await sleep(400);
    const hs = hostStates[hostStates.length - 1];
    check('host creates room, sees self', hs && hs.players.length === 1 && hs.code === 'TEST9', JSON.stringify(hs?.players?.map((p) => p.id)));
    check('host is hostId', hs && hs.hostId === 'host-1', `hostId=${hs?.hostId}`);

    // host sets duration + weather
    host.send(JSON.stringify({ type: 'SET_DURATION', payload: { minutes: 5 } }));
    host.send(JSON.stringify({ type: 'SET_WEATHER', payload: { weather: 'desert' } }));
    await sleep(400);
    const hs2 = hostStates[hostStates.length - 1];
    check('host settings applied', hs2 && hs2.duration === 5 && hs2.weather === 'desert', `duration=${hs2?.duration} weather=${hs2?.weather}`);

    // guest joins via invite
    const guest = await connect();
    const guestStates = [];
    let guestSawHost = false;
    guest.on('message', (raw) => {
      const m = JSON.parse(raw.toString());
      if (m.type === 'ROOM_STATE') {
        guestStates.push(m.room);
        if (m.room.players.length === 2) guestSawHost = true;
      }
    });
    guest.send(JSON.stringify({ type: 'JOIN_ROOM', payload: { roomCode: 'TEST9', profile: { id: 'guest-1', name: 'GUEST', car: 'ember' } } }));
    await sleep(400);
    const gs = guestStates[guestStates.length - 1];
    check('guest joins, sees both players', !!gs && gs.players.length === 2 && guestSawHost, JSON.stringify(gs?.players?.map((p) => p.profile?.name)));
    check('guest sees host settings', !!gs && gs.duration === 5 && gs.weather === 'desert', `duration=${gs?.duration} weather=${gs?.weather}`);
    check('host stays host after guest join', !!gs && gs.hostId === 'host-1', `hostId=${gs?.hostId}`);
    check('host sees guest join', hostStates[hostStates.length - 1]?.players.length === 2);

    // guest tries to hijack settings + start -> must be ignored
    guest.send(JSON.stringify({ type: 'SET_DURATION', payload: { minutes: 10 } }));
    guest.send(JSON.stringify({ type: 'SET_WEATHER', payload: { weather: 'mountain' } }));
    let guestCountdown = false;
    const guestSpy = (raw) => {
      const m = JSON.parse(raw.toString());
      if (m.type === 'LOBBY_COUNTDOWN') guestCountdown = true;
    };
    guest.on('message', guestSpy);
    guest.send(JSON.stringify({ type: 'HOST_START', payload: {} }));
    await sleep(1200);
    const gs2 = guestStates[guestStates.length - 1];
    check('guest cannot change duration', !!gs2 && gs2.duration === 5, `duration=${gs2?.duration}`);
    check('guest cannot change weather', !!gs2 && gs2.weather === 'desert', `weather=${gs2?.weather}`);
    check('guest cannot start race', !guestCountdown);

    // progress sync
    let batchSeen = false;
    host.on('message', (raw) => {
      try {
        if (JSON.parse(raw.toString()).type === 'PROGRESS_BATCH') batchSeen = true;
      } catch { /* ignore */ }
    });
    guest.send(JSON.stringify({ type: 'PROGRESS', payload: { playerId: 'guest-1', progressPercent: 0.5, currentWpm: 80, finished: false } }));
    await sleep(400);
    check('guest progress broadcasts to host', batchSeen);

    // host starts -> countdown -> RACE_START
    let lobbyTicks = [];
    let raceStart = null;
    const startSpy = (raw) => {
      const m = JSON.parse(raw.toString());
      if (m.type === 'LOBBY_COUNTDOWN') lobbyTicks.push(m.value);
      if (m.type === 'RACE_START') raceStart = m;
    };
    host.on('message', startSpy);
    guest.on('message', startSpy);
    host.send(JSON.stringify({ type: 'HOST_START', payload: {} }));
    await sleep(17500);
    check('15s lobby countdown fires', lobbyTicks.length >= 14 && lobbyTicks[0] === 15, `ticks=${lobbyTicks.length} first=${lobbyTicks[0]}`);
    check('RACE_START reaches both', !!raceStart && raceStart.duration === 5 && raceStart.weather === 'desert', JSON.stringify(raceStart));

    // late joiner during/after race sees racing status
    const late = await connect();
    let lateStatus = null;
    late.on('message', (raw) => {
      const m = JSON.parse(raw.toString());
      if (m.type === 'ROOM_STATE') lateStatus = m.room.status;
    });
    late.send(JSON.stringify({ type: 'JOIN_ROOM', payload: { roomCode: 'TEST9', profile: { id: 'late-1', name: 'LATE', car: 'ghost' } } }));
    await sleep(400);
    check('late joiner sees race status', lateStatus === 'racing' || lateStatus === 'finished', `status=${lateStatus}`);
    late.close();

    host.close();
    guest.close();
  } finally {
    server.kill();
  }

  const failed = results.filter(([s]) => s === 'FAIL').length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error('TEST CRASH:', e);
  process.exit(1);
});
