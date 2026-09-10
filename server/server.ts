import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const PORT = Number(process.env.PORT ?? 3001);
const LOBBY_WAIT = 15;
const REMATCH_WAIT = 3;

type Prog = { progressPercent: number; currentWpm: number; accuracy: number; finished?: boolean };
type Player = { id: string; name: string; car: string; avatar: string; progress: Prog; socket: WebSocket };
const WEATHERS = ['rain', 'desert', 'forest', 'mountain'];

type ChatMsg = { id: string; name: string; text: string; ts: number };
type Room = { code: string; players: Map<string, Player>; status: string; timer: NodeJS.Timeout | null; lobbyN: number | null; durationMin: number; weather: string; hostId: string | null; chat: ChatMsg[]; round: number };

const rooms = new Map<string, Room>();

function getRoom(code: string): Room {
  let r = rooms.get(code);
  if (!r) {
    r = { code, players: new Map(), status: 'lobby', timer: null, lobbyN: null, durationMin: 0, weather: 'rain', hostId: null, chat: [], round: 0 };
    rooms.set(code, r);
  }
  return r;
}

function snapshot(room: Room) {
  return {
    code: room.code,
    status: room.status,
    duration: room.durationMin,
    weather: room.weather,
    hostId: room.hostId,
    players: [...room.players.values()].map((p) => ({
      id: p.id,
      profile: { id: p.id, name: p.name, car: p.car, avatar: p.avatar },
      progress: p.progress,
    })),
    countdown: 0,
    raceStartTime: null,
  };
}

function broadcast(room: Room, payload: unknown) {
  const msg = JSON.stringify(payload);
  for (const p of room.players.values()) {
    if (p.socket.readyState === WebSocket.OPEN) p.socket.send(msg);
  }
}

function startLobbyCountdown(room: Room) {
  if (room.timer || room.status === 'racing') return;
  room.status = 'countdown';
  room.lobbyN = LOBBY_WAIT;
  broadcast(room, { type: 'LOBBY_COUNTDOWN', value: room.lobbyN });
  room.timer = setInterval(() => {
    if (room.lobbyN === null) return;
    room.lobbyN -= 1;
    if (room.lobbyN <= 0) {
      if (room.timer) clearInterval(room.timer);
      room.timer = null;
      room.lobbyN = null;
      room.status = 'racing';
      for (const p of room.players.values()) {
        p.progress = { progressPercent: 0, currentWpm: 0, accuracy: 100 };
      }
      room.round += 1;
      broadcast(room, { type: 'RACE_START', startTime: Date.now(), duration: room.durationMin, weather: room.weather, round: room.round });
      broadcast(room, { type: 'ROOM_STATE', room: snapshot(room) });
    } else {
      broadcast(room, { type: 'LOBBY_COUNTDOWN', value: room.lobbyN });
    }
  }, 1000);
}

// Quick 3s rematch: same grid, fresh round (new text), short countdown.
function startRematchCountdown(room: Room) {
  if (room.timer || room.status === 'racing' || room.status === 'countdown') return;
  room.status = 'countdown';
  room.lobbyN = REMATCH_WAIT;
  broadcast(room, { type: 'LOBBY_COUNTDOWN', value: room.lobbyN });
  room.timer = setInterval(() => {
    if (room.lobbyN === null) return;
    room.lobbyN -= 1;
    if (room.lobbyN <= 0) {
      if (room.timer) clearInterval(room.timer);
      room.timer = null;
      room.lobbyN = null;
      room.status = 'racing';
      for (const p of room.players.values()) {
        p.progress = { progressPercent: 0, currentWpm: 0, accuracy: 100 };
      }
      room.round += 1;
      broadcast(room, { type: 'RACE_START', startTime: Date.now(), duration: room.durationMin, weather: room.weather, round: room.round });
      broadcast(room, { type: 'ROOM_STATE', room: snapshot(room) });
    } else {
      broadcast(room, { type: 'LOBBY_COUNTDOWN', value: room.lobbyN });
    }
  }, 1000);
}

const httpServer = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, rooms: rooms.size, service: 'hotkeys-race-server' }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const server = new WebSocketServer({ server: httpServer });

// Live site-wide presence: every open socket counts as one racer online.
const allSockets = new Set<WebSocket>();

function broadcastCount() {
  const msg = JSON.stringify({ type: 'ONLINE_COUNT', count: allSockets.size });
  for (const s of allSockets) {
    if (s.readyState === WebSocket.OPEN) s.send(msg);
  }
}

server.on('connection', (socket) => {
  allSockets.add(socket);
  socket.send(JSON.stringify({ type: 'ONLINE_COUNT', count: allSockets.size }));
  broadcastCount();

  let roomCode: string | null = null;
  let playerId: string | null = null;

  socket.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === 'JOIN_ROOM') {
        const code = String(msg.payload?.roomCode ?? 'PUBLIC').toUpperCase().slice(0, 12);
        const profile = msg.payload?.profile ?? {};
        playerId = String(profile.id ?? `guest-${Math.random().toString(36).slice(2)}`);
        const name = String(profile.name ?? 'RACER').slice(0, 16);
        const car = String(profile.car ?? 'volt').slice(0, 16);
        const avatar = String(profile.avatar ?? '').slice(0, 80);
        const room = getRoom(code);
        roomCode = code;
        const existing = room.players.get(playerId);
        room.players.set(playerId, { id: playerId, name, car, avatar, progress: existing?.progress ?? { progressPercent: 0, currentWpm: 0, accuracy: 100 }, socket });
        // First driver in the room becomes the host (room owner).
        if (!room.hostId || !room.players.has(room.hostId)) room.hostId = playerId;
        socket.send(JSON.stringify({ type: 'ROOM_STATE', room: snapshot(room) }));
        socket.send(JSON.stringify({ type: 'CHAT_HISTORY', messages: room.chat.slice(-50) }));
        broadcast(room, { type: 'ROOM_STATE', room: snapshot(room) });
      }
      if (msg.type === 'HOST_START') {
        if (!roomCode || !playerId) return;
        const room = rooms.get(roomCode);
        if (!room || room.players.size === 0) return;
        if (playerId !== room.hostId) return;
        startLobbyCountdown(room);
      }
      if (msg.type === 'HOST_REMATCH') {
        if (!roomCode || !playerId) return;
        const room = rooms.get(roomCode);
        if (!room || room.players.size === 0) return;
        if (playerId !== room.hostId) return;
        startRematchCountdown(room);
      }
      if (msg.type === 'SET_DURATION') {
        if (!roomCode || !playerId) return;
        const room = rooms.get(roomCode);
        if (!room || room.status === 'racing') return;
        if (playerId !== room.hostId) return;
        const mins = Number(msg.payload?.minutes ?? 0);
        room.durationMin = [0, 3, 5, 10].includes(mins) ? mins : 0;
        broadcast(room, { type: 'ROOM_STATE', room: snapshot(room) });
      }
      if (msg.type === 'SET_WEATHER') {
        if (!roomCode || !playerId) return;
        const room = rooms.get(roomCode);
        if (!room || room.status === 'racing') return;
        if (playerId !== room.hostId) return;
        const w = String(msg.payload?.weather ?? 'rain');
        room.weather = WEATHERS.includes(w) ? w : 'rain';
        broadcast(room, { type: 'ROOM_STATE', room: snapshot(room) });
      }
      if (msg.type === 'PROGRESS') {
        if (!roomCode || !playerId) return;
        const room = rooms.get(roomCode);
        if (!room) return;
        const pl = room.players.get(playerId);
        if (!pl) return;
        pl.progress = {
          progressPercent: Number(msg.payload?.progressPercent ?? 0),
          currentWpm: Number(msg.payload?.currentWpm ?? 0),
          accuracy: Number(msg.payload?.accuracy ?? 100),
          finished: Boolean(msg.payload?.finished),
        };
        broadcast(room, {
          type: 'PROGRESS_BATCH',
          payloads: [...room.players.values()].map((p) => ({
            pid: p.id, c: 0, w: p.progress.currentWpm, p: p.progress.progressPercent, a: p.progress.accuracy ?? 100, f: p.progress.finished ? 1 : 0, av: p.avatar, e: false,
          })),
        });
      }
      if (msg.type === 'CHAT') {
        if (!roomCode || !playerId) return;
        const room = rooms.get(roomCode);
        if (!room) return;
        const pl = room.players.get(playerId);
        const text = String(msg.payload?.text ?? '').slice(0, 300).trim();
        if (!text) return;
        const chatMsg = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: String(pl?.name ?? msg.payload?.name ?? 'RACER').slice(0, 16),
          text,
          ts: Date.now(),
        };
        room.chat.push(chatMsg);
        if (room.chat.length > 100) room.chat = room.chat.slice(-100);
        broadcast(room, { type: 'CHAT_NEW', message: chatMsg });
        return;
      }
      if (msg.type === 'FINISH') {
        if (!roomCode) return;
        const room = rooms.get(roomCode);
        if (!room) return;
        const list = [...room.players.values()];
        const allDone = list.length > 0 &&
          list.every((p) => p.progress.finished || (p.progress.progressPercent ?? 0) >= 1);
        if (allDone) {
          room.status = 'finished';
          broadcast(room, { type: 'RACE_END' });
          broadcast(room, { type: 'ROOM_STATE', room: snapshot(room) });
        }
      }
    } catch {
      socket.send(JSON.stringify({ type: 'ERROR', message: 'Invalid payload' }));
    }
  });

  socket.on('close', () => {
    allSockets.delete(socket);
    broadcastCount();
    if (!roomCode || !playerId) return;
    const room = rooms.get(roomCode);
    if (!room) return;
    room.players.delete(playerId);
    if (room.players.size === 0) {
      if (room.timer) clearInterval(room.timer);
      rooms.delete(roomCode);
    } else {
      // Promote the next driver if the host left.
      if (room.hostId === playerId) room.hostId = [...room.players.keys()][0] ?? null;
      broadcast(room, { type: 'ROOM_STATE', room: snapshot(room) });
    }
  });
});

console.log(`HotKeys race server on ws://localhost:${PORT}`);

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`listening on 0.0.0.0:${PORT}`);
});
