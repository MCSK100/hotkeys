'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import { useRoom } from '@/hooks/useWebSocketSync';
import { CARS, loadHistory, makeRoomCode, saveResult, sharedQuote, sharedTimedText } from '@/components/race/quotes';
import { countBeep, engineRev, goBeep } from '@/components/race/sound';
import Car3D from '@/components/race/Car3D';
import { WEATHERS, RaceLane, WeatherPicker, isWeather, type WeatherId } from '@/components/race/Track';
import WeatherCanvas from '@/components/race/WeatherCanvas';

type Mode = 'practice' | 'multiplayer';

type Racer = {
  id: string; name: string; carId: string; color: string;
  progress: number; wpm: number; you: boolean; finished: boolean;
};

const DURATIONS = [0, 3, 5, 10];

function fmt(s: number) {
  const v = Math.max(0, Math.round(s));
  return `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`;
}

function carOf(id: string) {
  return CARS.find((c) => c.id === id) ?? CARS[0];
}

function durLabel(mins: number) {
  return mins === 0 ? 'SPRINT' : `${mins} MIN`;
}

export default function RacePage() {
  const engine = useTypingEngine();
  const [mode, setMode] = useState<Mode>('practice');
  const [duration, setDuration] = useState(3);
  const [mpDuration, setMpDuration] = useState(0);
  const [weather, setWeather] = useState<WeatherId>('rain');
  const [mpWeather, setMpWeather] = useState<WeatherId>('rain');
  const [name, setName] = useState('HK_RACER');
  const [carId, setCarId] = useState('volt');
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ wpm: number; acc: number }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const goFired = useRef('');
  const savedRef = useRef(false);
  const durationPushed = useRef('');

  // Stable refs so global listeners don't resubscribe every keystroke.
  const typeCharRef = useRef(engine.typeChar);
  typeCharRef.current = engine.typeChar;
  const newRaceRef = useRef(engine.newRace);
  newRaceRef.current = engine.newRace;
  const startTimedRef = useRef(engine.startTimed);
  startTimedRef.current = engine.startTimed;

  const car = carOf(carId);
  const inRoom = mode === 'multiplayer' && joined && !!roomCode;
  const { players, connected, lobbySecs, go, myId, hostId, roomStatus, send, startRace, setGo, roomDuration, setDuration: pushDuration, roomWeather, setWeather: pushWeather } = useRoom(roomCode, name, carId, inRoom);
  const raceLive = roomStatus === 'countdown' || roomStatus === 'racing';
  // Server is the source of truth for who owns the room; fall back to local flag before sync.
  const host = hostId ? myId === hostId : isHost;
  const activeWeather = WEATHERS[mode === 'practice' ? weather : isWeather(roomWeather) ? (roomWeather as WeatherId) : 'rain'];

  const racing = engine.phase === 'racing';
  const finished = engine.phase === 'finished';
  const [soundOn, setSoundOn] = useState(true);
  const soundRef = useRef(true);
  soundRef.current = soundOn;
  const prevPhase = useRef(engine.phase);
  // Practice goal: 40 WPM pace — the car moves ONLY with clean keystrokes.
  const practiceGoal = engine.durationSec > 0 ? Math.max(1, (engine.durationSec / 60) * 200) : 1;
  const practiceProgress = Math.min(1, engine.correctChars / practiceGoal);
  // Every lane on every mode is typing-driven. Nothing moves while idle.
  const laneProgress = mode === 'practice' ? practiceProgress : engine.isTimed ? engine.typed : engine.progress;

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const m = q.get('mode');
    const d = Number(q.get('duration') ?? 0);
    const r = q.get('room');
    const w = q.get('weather') ?? '';
    const validDur = [3, 5, 10].includes(d) ? d : 0;
    const validWeather = isWeather(w) ? (w as WeatherId) : 'rain';
    if (r) {
      setMode('multiplayer');
      setInviteCode(r.toUpperCase());
      setRoomCode(r.toUpperCase());
      setMpDuration(validDur);
      setMpWeather(validWeather);
    } else if (m === 'multiplayer') {
      setMode('multiplayer');
      setMpDuration(validDur);
      setMpWeather(validWeather);
    } else {
      setMode('practice');
      if ([3, 5, 10].includes(d)) setDuration(d);
      setWeather(validWeather);
    }
    setHistory(loadHistory().slice(0, 5));
  }, []);

  // Host pushes the chosen race length + weather once the socket is live.
  useEffect(() => {
    if (connected && isHost && roomCode && durationPushed.current !== roomCode) {
      durationPushed.current = roomCode;
      pushDuration(mpDuration);
      pushWeather(mpWeather);
    }
  }, [connected, isHost, roomCode, mpDuration, mpWeather, pushDuration, pushWeather]);

  // Multiplayer start fires exactly once per lobby round.
  useEffect(() => {
    if (go && roomCode) {
      if (goFired.current === roomCode) return;
      goFired.current = roomCode;
      savedRef.current = false;
      const d = roomDuration;
      if (d > 0) startTimedRef.current(d, sharedTimedText(roomCode, d), false);
      else newRaceRef.current(sharedQuote(roomCode));
      setTimeout(() => inputRef.current?.focus(), 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [go, roomCode, roomDuration]);

  // 3-2-1 count beeps + GO chime.
  const phase = engine.phase;
  const wpm = engine.wpm;
  useEffect(() => {
    if (phase === 'countdown' && engine.countdown >= 1 && soundRef.current) countBeep(engine.countdown);
  }, [phase, engine.countdown]);
  useEffect(() => {
    if (phase === 'racing' && prevPhase.current === 'countdown' && soundRef.current) {
      goBeep();
      engineRev();
    }
    prevPhase.current = phase;
  }, [phase]);
  useEffect(() => {
    if (lobbySecs !== null && lobbySecs <= 3 && lobbySecs >= 1 && soundRef.current) countBeep(lobbySecs);
  }, [lobbySecs]);
  useEffect(() => {
    if (inRoom) send(laneProgress, wpm, phase === 'finished');
  }, [laneProgress, wpm, phase, inRoom, send]);

  // Save one result per race and refresh stats.
  useEffect(() => {
    if (phase === 'finished' && !savedRef.current && (mode === 'practice' || inRoom)) {
      savedRef.current = true;
      saveResult(wpm, engine.acc);
      setHistory(loadHistory().slice(0, 5));
    }
    if (phase !== 'finished') savedRef.current = false;
  }, [phase, mode, inRoom, wpm, engine.acc]);

  const focus = useCallback(() => inputRef.current?.focus(), []);
  const smartFocus = useCallback((e: React.MouseEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest('input,button,a,select,textarea')) return;
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.key === 'Tab') return;
      const ae = document.activeElement as HTMLElement | null;
      if (ae && (ae.dataset.room === '1' || ae.dataset.name === '1')) return;
      if (e.key.length === 1 || e.key === 'Backspace') {
        e.preventDefault();
        typeCharRef.current(e.key);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Keep the caret visible in long timed passages.
  const charIndex = engine.charIndex;
  useEffect(() => {
    if (!racing) return;
    document.getElementById(`tc-${charIndex}`)?.scrollIntoView({ block: 'nearest' });
  }, [charIndex, racing]);

  const racers: Racer[] = useMemo(() => {
    if (mode === 'practice') {
      return [{ id: 'you', name: `${name} (YOU)`, carId, color: car.color, progress: laneProgress, wpm: Math.round(wpm), you: true, finished }];
    }
    const me: Racer = { id: myId, name: `${name} (YOU)`, carId, color: car.color, progress: laneProgress, wpm: Math.round(wpm), you: true, finished };
    if (!inRoom || players.length === 0) return [me];
    const map = new Map<string, Racer>();
    map.set(myId, me);
    for (const p of players) {
      if (p.id === myId) continue;
      const c = carOf(p.car);
      map.set(p.id, { id: p.id, name: p.name, carId: p.car, color: c.color, progress: p.progress, wpm: p.wpm, you: false, finished: p.finished });
    }
    return [...map.values()].sort((a, b) => b.progress - a.progress || b.wpm - a.wpm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, name, carId, inRoom, players, myId, laneProgress, wpm, finished, car.color]);

  const myPos = racers.findIndex((r) => r.you) + 1;
  const linkDur = (inRoom ? roomDuration : mpDuration) || 0;
  const linkWeather = inRoom ? (isWeather(roomWeather) ? roomWeather : 'rain') : mpWeather;
  const inviteLink = roomCode && typeof window !== 'undefined'
    ? `${window.location.origin}/race?room=${roomCode}${linkDur > 0 ? `&duration=${linkDur}` : ''}&weather=${linkWeather}`
    : '';
  const avg = history.length ? Math.round(history.reduce((s, h) => s + h.wpm, 0) / history.length) : 0;
  const best = history.length ? Math.max(...history.map((h) => h.wpm)) : 0;

  const resetRound = () => {
    setGo(false);
    goFired.current = '';
    savedRef.current = false;
  };
  const createRoom = () => {
    if (!name.trim()) return;
    const code = makeRoomCode();
    setRoomCode(code);
    setInviteCode(null);
    setJoined(true);
    setIsHost(true);
    durationPushed.current = '';
    resetRound();
    window.history.replaceState(null, '', `/race?room=${code}${mpDuration > 0 ? `&duration=${mpDuration}` : ''}&weather=${mpWeather}`);
  };
  const joinAs = (code: string) => {
    const c = code.trim().toUpperCase();
    if (!c || !name.trim()) return;
    setRoomCode(c);
    setJoined(true);
    setIsHost(false);
    resetRound();
    window.history.replaceState(null, '', `/race?room=${c}`);
    setTimeout(focus, 400);
  };
  const rematch = () => {
    resetRound();
    startRace();
  };

  const showSetup = mode === 'multiplayer' && !joined;
  const showLobby = mode === 'multiplayer' && joined && engine.phase === 'lobby' && !go;
  const showTrack = mode === 'practice' || (mode === 'multiplayer' && joined && !showLobby);
  const mpTimed = mode === 'multiplayer' && roomDuration > 0;

  return (
    <main className="min-h-screen bg-void text-bone" onClick={smartFocus}>
      <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-carbon/90 backdrop-blur">
        <div className="mx-auto flex h-[60px] max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/hotkeyslogo.png" alt="HotKeys" className="h-9 w-auto object-contain" />
            <span className="font-tech text-sm font-bold tracking-[0.2em]">HOTKEYS</span>
          </Link>
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em]">
            <button onClick={() => setSoundOn((s) => !s)} aria-label="Toggle sound"
              className={`border px-2 py-1 ${soundOn ? 'border-acid/50 bg-acid/10 text-acid' : 'border-white/15 text-white/50'}`}>
              {soundOn ? 'SOUND ON' : 'MUTED'}
            </button>
            {roomCode && mode === 'multiplayer' && <span className="border border-acid/50 bg-acid/10 px-2 py-1 text-acid">ROOM {roomCode}</span>}
            <span className={`px-2 py-1 ${mode === 'practice' ? 'bg-white/10 text-white/70' : connected ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
              {mode === 'practice' ? 'SOLO' : connected ? `LIVE · ${players.length}` : 'CONNECTING'}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* mode switch */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setMode('practice'); setJoined(false); window.history.replaceState(null, '', '/race?mode=practice'); }}
            className={`clip-tag px-5 py-2.5 font-tech text-[13px] font-bold tracking-[0.18em] ${mode === 'practice' ? 'bg-acid text-black' : 'bg-white/[0.06] text-white/70 hover:bg-white/10'}`}
          >
            SOLO PRACTICE
          </button>
          <button
            onClick={() => { setMode('multiplayer'); window.history.replaceState(null, '', '/race?mode=multiplayer'); }}
            className={`clip-tag px-5 py-2.5 font-tech text-[13px] font-bold tracking-[0.18em] ${mode === 'multiplayer' ? 'bg-acid text-black' : 'bg-white/[0.06] text-white/70 hover:bg-white/10'}`}
          >
            MULTIPLAYER
          </button>
          {mode === 'practice' && (
            <span className="ml-auto flex flex-wrap items-center gap-1.5">
              {[3, 5, 10].map((mins) => (
                <button key={mins} onClick={() => setDuration(mins)}
                  className={`border px-3 py-2 font-mono text-xs ${duration === mins ? 'border-acid bg-acid/10 text-acid' : 'border-white/15 text-white/60 hover:border-white/40'}`}>
                  {mins} MIN
                </button>
              ))}
              <WeatherPicker small value={weather} onChange={setWeather} />
            </span>
          )}
        </div>

        {/* driver + garage (practice) */}
        {mode === 'practice' && (
          <section className="mt-4 border border-white/10 bg-white/[0.02] p-4">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2">
                <span className="font-mono text-[10px] tracking-[0.3em] text-smoke">DRIVER</span>
                <input value={name} data-name="1" maxLength={14} onChange={(e) => setName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                  placeholder="HK_RACER" aria-label="Racer name"
                  className="w-36 border border-white/15 bg-black/40 px-3 py-2 font-mono text-xs tracking-[0.15em] outline-none focus:border-acid" />
              </label>
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] tracking-[0.3em] text-smoke">GARAGE</span>
                {CARS.map((c) => (
                  <button key={c.id} onClick={() => setCarId(c.id)} title={c.name} aria-label={c.name}
                    className={`border px-2 py-1.5 transition ${carId === c.id ? 'border-acid bg-acid/[0.08]' : 'border-white/10 hover:border-white/35'}`}>
                    <Car3D color={c.color} size="sm" />
                    <span className={`mt-1 block text-center font-tech text-[10px] font-bold tracking-[0.08em] ${carId === c.id ? 'text-acid' : 'text-white/55'}`}>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* multiplayer setup */}
        {showSetup && (
          <section className="mt-4 border border-white/10 bg-white/[0.02] p-5">
            {inviteCode && (
              <p className="mb-4 border border-acid/40 bg-acid/[0.06] px-4 py-3 font-mono text-xs tracking-[0.15em] text-acid">
                {'INVITED TO ROOM '}{inviteCode}{mpDuration > 0 ? ` · ${mpDuration} MIN TIMED` : ' · SPRINT'} — SET YOUR NAME, PICK A CAR, HIT JOIN GRID.
              </p>
            )}
            <p className="font-mono text-[10px] tracking-[0.3em] text-smoke">1 · SET DRIVER NAME</p>
            <input value={name} data-name="1" maxLength={14} onChange={(e) => setName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
              placeholder="YOUR NAME" aria-label="Racer name"
              className="mt-2 w-52 border border-white/15 bg-black/40 px-3 py-2.5 font-mono text-sm tracking-[0.15em] outline-none focus:border-acid" />
            <p className="mt-5 font-mono text-[10px] tracking-[0.3em] text-smoke">2 · CHOOSE YOUR CAR</p>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {CARS.map((c) => (
                <button key={c.id} onClick={() => setCarId(c.id)}
                  className={`border p-2 text-left transition ${carId === c.id ? 'border-acid bg-acid/[0.07]' : 'border-white/10 hover:border-white/30'}`}>
                  <Car3D color={c.color} size="sm" />
                  <span className={`mt-1.5 block font-tech text-[11px] font-bold tracking-[0.1em] ${carId === c.id ? 'text-acid' : 'text-white/70'}`}>{c.name}</span>
                </button>
              ))}
            </div>
            {inviteCode ? (
              <div className="mt-5 border border-white/10 bg-black/40 px-4 py-3">
                <p className="font-mono text-[10px] tracking-[0.3em] text-smoke">HOST SETTINGS — LOCKED</p>
                <p className="mt-2 font-mono text-xs tracking-[0.15em] text-white/80">
                  MODE · {durLabel(mpDuration)} · {(WEATHERS[mpWeather]).name}
                </p>
                <p className="mt-1 font-mono text-[10px] text-white/40">ONLY THE ROOM OWNER CAN CHANGE TIME + WEATHER</p>
              </div>
            ) : (
              <>
                <p className="mt-5 font-mono text-[10px] tracking-[0.3em] text-smoke">3 · RACE LENGTH</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {DURATIONS.map((mins) => (
                    <button key={mins} onClick={() => setMpDuration(mins)}
                      className={`border px-4 py-2 font-mono text-xs tracking-[0.15em] ${mpDuration === mins ? 'border-acid bg-acid/10 text-acid' : 'border-white/15 text-white/60 hover:border-white/40'}`}>
                      {durLabel(mins)}
                    </button>
                  ))}
                  <span className="self-center font-mono text-[10px] text-white/40">SPRINT = SHORT PASSAGE · TIMED = MOST TYPED WINS</span>
                </div>
                <p className="mt-5 font-mono text-[10px] tracking-[0.3em] text-smoke">4 · TRACK WEATHER</p>
                <div className="mt-2">
                  <WeatherPicker value={mpWeather} onChange={setMpWeather} />
                </div>
              </>
            )}
            <p className="mt-5 font-mono text-[10px] tracking-[0.3em] text-smoke">{inviteCode ? '3 · ENTER THE GRID' : '5 · ENTER THE GRID'}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {inviteCode ? (
                <button onClick={() => joinAs(inviteCode)} disabled={!name.trim()} className="btn-race btn-primary !py-2.5 disabled:opacity-40">
                  JOIN GRID {inviteCode} →
                </button>
              ) : (
                <>
                  <button onClick={createRoom} disabled={!name.trim()} className="btn-race btn-primary !py-2.5 disabled:opacity-40">CREATE ROOM →</button>
                  <span className="font-mono text-[10px] text-white/40">OR</span>
                  <input value={joinCode} data-room="1" onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="CODE" aria-label="Room code"
                    className="w-28 border border-white/15 bg-black/40 px-3 py-2 font-mono text-sm tracking-[0.2em] outline-none focus:border-acid" />
                  <button onClick={() => joinAs(joinCode)} disabled={!name.trim() || !joinCode.trim()} className="btn-race btn-ghost !py-2.5 disabled:opacity-40">JOIN →</button>
                </>
              )}
            </div>
          </section>
        )}

        {/* lobby */}
        {showLobby && (
          <section className="mt-4 border border-acid/30 bg-carbon p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] tracking-[0.35em] text-acid">LOBBY — ROOM {roomCode} · {durLabel(roomDuration)}</p>
                <p className="mt-1 font-display text-4xl">WAITING FOR RACERS<span className="text-acid">.</span></p>
              </div>
              <button onClick={() => { navigator.clipboard?.writeText(inviteLink).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                className="btn-race btn-ghost !py-2.5">{copied ? 'LINK COPIED ✓' : 'COPY INVITE LINK'}</button>
            </div>
            <p className="mt-2 break-all font-mono text-[11px] text-acid">{inviteLink}</p>
            {host && lobbySecs === null && (
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="flex items-center gap-1.5">
                  <span className="mr-1 font-mono text-[10px] tracking-[0.3em] text-smoke">RACE LENGTH</span>
                  {DURATIONS.map((mins) => (
                    <button key={mins} onClick={() => pushDuration(mins)}
                      className={`border px-3 py-1.5 font-mono text-[11px] ${roomDuration === mins ? 'border-acid bg-acid/10 text-acid' : 'border-white/15 text-white/60 hover:border-white/40'}`}>
                      {durLabel(mins)}
                    </button>
                  ))}
                </span>
                <WeatherPicker small value={isWeather(roomWeather) ? (roomWeather as WeatherId) : 'rain'} onChange={pushWeather} />
              </div>
            )}
            {!host && (
              <div className="mt-4 border border-white/10 bg-black/40 px-4 py-3">
                <p className="font-mono text-[10px] tracking-[0.3em] text-smoke">HOST SETTINGS — LOCKED</p>
                <p className="mt-2 font-mono text-xs tracking-[0.15em] text-white/80">
                  MODE · {durLabel(roomDuration)} · {(WEATHERS[isWeather(roomWeather) ? (roomWeather as WeatherId) : 'rain']).name}
                </p>
                <p className="mt-1 font-mono text-[10px] text-white/40">ONLY THE ROOM OWNER CAN CHANGE TIME + WEATHER</p>
              </div>
            )}
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {players.length === 0 && (
                <p className="font-mono text-xs text-white/50">
                  {connected ? 'Connecting… drivers appear here.' : 'SERVER OFFLINE — START IT WITH `npm run server`, THEN REJOIN.'}
                </p>
              )}
              {players.map((p) => (
                <div key={p.id} className="flex items-center gap-3 border border-white/10 bg-black/40 px-3 py-2">
                  <Car3D color={carOf(p.id === myId ? carId : p.car).color} size="sm" />
                  <span className="font-tech text-sm font-bold tracking-[0.1em]">{p.id === myId ? `${name} (YOU)` : p.name}</span>
                  {(hostId ? p.id === hostId : (p.id === myId && isHost)) && (
                    <span className="bg-acid px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.15em] text-black">HOST</span>
                  )}
                  <span className="ml-auto font-mono text-[10px] text-emerald-300">READY</span>
                </div>
              ))}
            </div>
            {lobbySecs !== null ? (
              <div className="mt-5 border border-acid/40 bg-acid/[0.05] px-4 py-4 text-center">
                <p className="font-display text-7xl text-acid">{lobbySecs}</p>
                <p className="font-mono text-[10px] tracking-[0.35em] text-white/60">RACE STARTS — GET READY TO TYPE</p>
              </div>
            ) : (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {raceLive ? (
                  <span className="border border-acid/40 bg-acid/[0.06] px-4 py-3 font-mono text-[11px] tracking-[0.25em] text-acid">RACE IN PROGRESS — YOU JOIN THE NEXT ROUND</span>
                ) : host ? (
                  <button onClick={startRace} className="btn-race btn-primary !py-3">START RACE · 15S COUNTDOWN →</button>
                ) : (
                  <span className="border border-white/15 bg-white/[0.04] px-4 py-3 font-mono text-[11px] tracking-[0.25em] text-white/60">WAITING FOR HOST TO START…</span>
                )}
                <button onClick={() => { setJoined(false); setGo(false); }} className="btn-race btn-ghost !py-3">LEAVE</button>
                <span className="font-mono text-[10px] tracking-[0.25em] text-white/45">HOST PRESSES START — EVERYONE GETS 15 SECONDS</span>
              </div>
            )}
          </section>
        )}

        {showTrack && (
          <>
            {/* track */}
            <section className="relative mt-4 border border-white/10 bg-carbon">
              <WeatherCanvas weather={activeWeather.id} />
              <div className="relative z-[6] flex items-center justify-between gap-2 border-b border-white/10 px-4 py-2.5 font-mono text-[10px] tracking-[0.25em] text-white/55">
                <span className="truncate">
                  {finished ? 'RACE COMPLETE'
                    : mode === 'practice' ? `SOLO · ${duration} MIN · ${car.name}` : mpTimed ? `TIMED · ${roomDuration} MIN · MOST TYPED WINS` : `SPRINT · POSITION P0${myPos} / 0${racers.length}`}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="border border-white/15 bg-black/40 px-2 py-0.5 text-acid">{activeWeather.name}</span>
                  <span>{engine.isTimed ? `${fmt(engine.timeLeft)} LEFT · ` : ''}WPM {Math.round(wpm)} · ACC {Math.round(engine.acc)}%</span>
                </span>
              </div>
              {finished && lobbySecs !== null && (
                <div className="relative z-[6] border-b border-acid/30 bg-acid/[0.06] px-4 py-3 text-center">
                  <p className="font-display text-5xl text-acid">{lobbySecs}</p>
                  <p className="font-mono text-[10px] tracking-[0.35em] text-white/60">NEXT RACE STARTS</p>
                </div>
              )}
              <div className="relative z-[6] space-y-2 p-3 md:p-4">
                {racers.map((r, i) => (
                  <RaceLane key={r.id} racer={r} pos={i + 1} racing={racing} weather={activeWeather} />
                ))}
              </div>
              <div className="relative z-[6] h-1 bg-white/10">
                <div className="h-full bg-acid transition-[width]" style={{ width: `${Math.round(laneProgress * 100)}%` }} />
              </div>
            </section>

            {/* typing */}
            <section className="relative mt-4 border border-white/10 bg-black/50 p-5 md:p-7" onClick={smartFocus}>
              {engine.phase === 'countdown' && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 backdrop-blur-[2px]">
                  <p className="font-display text-8xl text-acid">{engine.countdown > 0 ? engine.countdown : 'GO'}</p>
                  <p className="font-mono text-[10px] tracking-[0.35em] text-white/60">GET READY — TYPE WHEN GREEN</p>
                </div>
              )}
              {engine.phase === 'lobby' && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/70 p-4 text-center">
                  {mode === 'practice' ? (
                    <button onClick={() => { savedRef.current = false; engine.startTimed(duration); setTimeout(focus, 350); }} className="btn-race btn-primary">
                      {`START ${duration} MIN SPRINT →`}
                    </button>
                  ) : (
                    <p className="font-mono text-xs tracking-[0.3em] text-white/60">WAITING FOR HOST TO START…</p>
                  )}
                  <p className="font-mono text-[10px] tracking-[0.3em] text-white/50">CLICK TO FOCUS · THEN TYPE</p>
                </div>
              )}
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="font-mono text-[10px] tracking-[0.3em] text-smoke">
                  {mode === 'practice' ? `TYPE FOR ${duration} MINUTES — CAR MOVES ONLY WITH CLEAN KEYS` : mpTimed ? `TYPE FOR ${roomDuration} MINUTES — MOST TYPED WINS` : 'TYPE THIS PASSAGE — SAME FOR ALL RACERS'}
                </p>
                {engine.isTimed && <p className="shrink-0 font-mono text-sm font-bold text-acid">{fmt(engine.timeLeft)}</p>}
              </div>
              <p className="max-h-[220px] overflow-y-auto font-mono text-lg leading-9 tracking-wide md:text-xl" aria-live="polite">
                {engine.text.split('').map((ch, i) => {
                  const done = i < charIndex;
                  const cur = i === charIndex && racing;
                  const wrong = done && engine.errors[i];
                  return (
                    <span
                      key={i} id={`tc-${i}`}
                      className={wrong ? 'rounded-[2px] bg-danger/25 text-danger underline' : done ? 'text-acid' : cur ? 'rounded-[2px] bg-acid text-black' : 'text-white/45'}
                    >
                      {ch}
                    </span>
                  );
                })}
              </p>
              <input
                ref={inputRef} aria-label="Typing input" autoCapitalize="off" autoComplete="off" autoCorrect="off" spellCheck={false}
                className="pointer-events-none absolute h-0 w-0 opacity-0"
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v) return;
                  e.target.value = '';
                  for (const ch of v) typeCharRef.current(ch);
                }}
              />
              <div className="mt-5 grid grid-cols-4 gap-px bg-white/10">
                {[['WPM', String(Math.round(wpm))], ['ACC', `${Math.round(engine.acc)}%`], [mode === 'practice' ? 'TIME' : 'POS', mode === 'practice' ? fmt(engine.timeLeft) : `P0${myPos}`], [mode === 'practice' ? 'GOAL' : 'DONE', `${Math.round(laneProgress * 100)}%`]].map(([k, v]) => (
                  <div key={k} className="bg-void px-3 py-2.5 text-center">
                    <p className="font-mono text-[9px] tracking-[0.3em] text-smoke">{k}</p>
                    <p className="font-mono text-lg font-bold">{v}</p>
                  </div>
                ))}
              </div>
            </section>

            {finished && (
              <section className="mt-4 border border-acid/40 bg-acid/[0.04] p-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.35em] text-acid">
                      {mode === 'practice' ? `${duration} MIN SPRINT — COMPLETE` : mpTimed ? `${roomDuration} MIN TIMED — COMPLETE · P0${myPos}` : `RESULTS — P0${myPos} FINISH`}
                    </p>
                    <p className="mt-1 font-display text-5xl">WPM {Math.round(wpm)} <span className="text-2xl text-white/50">· {Math.round(engine.acc)}% ACC</span></p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mode === 'practice' ? (
                      <button onClick={() => { savedRef.current = false; engine.startTimed(duration); setTimeout(focus, 350); }} className="btn-race btn-primary !py-2.5">RACE AGAIN →</button>
                    ) : (
                      <button onClick={rematch} className="btn-race btn-primary !py-2.5">REMATCH · 15S →</button>
                    )}
                    <Link href="/" className="btn-race btn-ghost !py-2.5">HOME</Link>
                  </div>
                </div>
                {mode === 'multiplayer' && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full font-mono text-xs">
                      <thead><tr className="text-left text-white/45"><th className="py-2 pr-4 font-normal tracking-[0.2em]">POS</th><th className="py-2 pr-4 font-normal tracking-[0.2em]">RACER</th><th className="py-2 pr-4 font-normal tracking-[0.2em]">WPM</th><th className="py-2 font-normal tracking-[0.2em]">PROGRESS</th></tr></thead>
                      <tbody>
                        {racers.map((r, i) => (
                          <tr key={r.id} className="border-t border-white/10">
                            <td className="py-2 pr-4">0{i + 1}</td>
                            <td className="py-2 pr-4">{r.name}</td>
                            <td className="py-2 pr-4">{r.wpm}</td>
                            <td className="py-2">{Math.round(r.progress * 100)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {mode === 'practice' && (
              <section className="mt-4 grid gap-3 pb-10 sm:grid-cols-3">
                {[['AVG WPM', String(avg)], ['BEST WPM', String(best)], ['RACES', String(history.length)]].map(([k, v]) => (
                  <div key={k} className="border border-white/10 bg-white/[0.02] px-4 py-3">
                    <p className="font-mono text-[9px] tracking-[0.3em] text-smoke">{k}</p>
                    <p className="font-display text-3xl">{v}</p>
                  </div>
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
