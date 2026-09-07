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
import RoomChat from '@/components/race/RoomChat';

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
  return mins === 0 ? 'Sprint' : `${mins} min`;
}

const primaryBtn = 'rounded-xl bg-white px-5 py-2.5 text-[13px] font-semibold text-black transition hover:bg-gray-200 disabled:opacity-40';
const ghostBtn = 'rounded-xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-[13px] font-semibold text-white/80 transition hover:border-white/40 hover:text-white disabled:opacity-40';

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
  const [chatOpen, setChatOpen] = useState(false);
  const [history, setHistory] = useState<{ wpm: number; acc: number }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const goFired = useRef('');
  const savedRef = useRef(false);
  const durationPushed = useRef('');

  const typeCharRef = useRef(engine.typeChar);
  typeCharRef.current = engine.typeChar;
  const newRaceRef = useRef(engine.newRace);
  newRaceRef.current = engine.newRace;
  const startTimedRef = useRef(engine.startTimed);
  startTimedRef.current = engine.startTimed;

  const car = carOf(carId);
  const inRoom = mode === 'multiplayer' && joined && !!roomCode;
  const { players, chat, sendChat, connected, lobbySecs, go, myId, hostId, roomStatus, send, startRace, setGo, roomDuration, setDuration: pushDuration, roomWeather, setWeather: pushWeather } = useRoom(roomCode, name, carId, inRoom);
  const raceLive = roomStatus === 'countdown' || roomStatus === 'racing';
  const host = hostId ? myId === hostId : isHost;
  const activeWeather = WEATHERS[mode === 'practice' ? weather : isWeather(roomWeather) ? (roomWeather as WeatherId) : 'rain'];

  const racing = engine.phase === 'racing';
  const finished = engine.phase === 'finished';
  const [soundOn, setSoundOn] = useState(true);
  const soundRef = useRef(true);
  soundRef.current = soundOn;
  const prevPhase = useRef(engine.phase);
  const practiceGoal = engine.durationSec > 0 ? Math.max(1, (engine.durationSec / 60) * 200) : 1;
  const practiceProgress = Math.min(1, engine.correctChars / practiceGoal);
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

  useEffect(() => {
    if (connected && isHost && roomCode && durationPushed.current !== roomCode) {
      durationPushed.current = roomCode;
      pushDuration(mpDuration);
      pushWeather(mpWeather);
    }
  }, [connected, isHost, roomCode, mpDuration, mpWeather, pushDuration, pushWeather]);

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
      if (ae && (ae.dataset.room === '1' || ae.dataset.name === '1' || ae.dataset.chat === '1')) return;
      if (e.key.length === 1 || e.key === 'Backspace') {
        e.preventDefault();
        typeCharRef.current(e.key);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
    <main className="min-h-screen bg-[#08090c] font-body text-[#eceef1]" onClick={smartFocus}>
      <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#0b0e14]/90 backdrop-blur">
        <div className="mx-auto flex h-[60px] max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/hotkeyslogo.png" alt="HotKeys" className="h-9 w-auto object-contain" />
            <span className="text-sm font-semibold tracking-wide">HOTKEYS</span>
          </Link>
          <div className="flex items-center gap-2 text-[12px] font-medium">
            {inRoom && (
              <button onClick={(e) => { e.stopPropagation(); setChatOpen((o) => !o); }}
                className={`rounded-full border px-3 py-1.5 transition ${chatOpen ? 'border-white bg-white text-black' : 'border-white/15 text-white/70 hover:border-white/40 hover:text-white'}`}>
                Chat{chat.length > 0 ? ` · ${chat.length}` : ''}
              </button>
            )}
            <button onClick={() => setSoundOn((s) => !s)} aria-label="Toggle sound"
              className={`rounded-full border px-3 py-1.5 ${soundOn ? 'border-white/30 text-white' : 'border-white/15 text-white/50'}`}>
              {soundOn ? 'Sound on' : 'Muted'}
            </button>
            {roomCode && mode === 'multiplayer' && <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-white/80">Room {roomCode}</span>}
            <span className={`rounded-full px-3 py-1.5 ${mode === 'practice' ? 'bg-white/10 text-white/70' : connected ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
              {mode === 'practice' ? 'Solo' : connected ? `Live · ${players.length}` : 'Connecting'}
            </span>
          </div>
        </div>
      </header>

      <div className={`mx-auto max-w-6xl px-4 py-6 ${chatOpen ? 'pr-4 lg:pr-[360px]' : ''}`}>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setMode('practice'); setJoined(false); window.history.replaceState(null, '', '/race?mode=practice'); }}
            className={`rounded-full px-5 py-2.5 text-[13px] font-semibold transition ${mode === 'practice' ? 'bg-white text-black' : 'bg-white/[0.06] text-white/70 hover:bg-white/10 hover:text-white'}`}
          >
            Solo practice
          </button>
          <button
            onClick={() => { setMode('multiplayer'); window.history.replaceState(null, '', '/race?mode=multiplayer'); }}
            className={`rounded-full px-5 py-2.5 text-[13px] font-semibold transition ${mode === 'multiplayer' ? 'bg-white text-black' : 'bg-white/[0.06] text-white/70 hover:bg-white/10 hover:text-white'}`}
          >
            Multiplayer
          </button>
          {mode === 'practice' && (
            <span className="ml-auto flex flex-wrap items-center gap-1.5">
              {[3, 5, 10].map((mins) => (
                <button key={mins} onClick={() => setDuration(mins)}
                  className={`rounded-full border px-3.5 py-2 text-[12px] font-medium transition ${duration === mins ? 'border-white bg-white text-black' : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white'}`}>
                  {mins} min
                </button>
              ))}
              <WeatherPicker small value={weather} onChange={setWeather} />
            </span>
          )}
        </div>

        {mode === 'practice' && (
          <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-white/50">Driver</span>
                <input value={name} data-name="1" maxLength={14} onChange={(e) => setName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                  placeholder="HK_RACER" aria-label="Racer name"
                  className="w-36 rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-[12px] font-medium outline-none focus:border-white/60" />
              </label>
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <span className="text-[11px] font-medium text-white/50">Garage</span>
                {CARS.map((c) => (
                  <button key={c.id} onClick={() => setCarId(c.id)} title={c.name} aria-label={c.name}
                    className={`rounded-xl border px-2 py-1.5 transition ${carId === c.id ? 'border-white bg-white/[0.08]' : 'border-white/10 hover:border-white/35'}`}>
                    <Car3D color={c.color} size="sm" />
                    <span className={`mt-1 block text-center text-[10px] font-semibold ${carId === c.id ? 'text-white' : 'text-white/55'}`}>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {showSetup && (
          <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            {inviteCode && (
              <p className="mb-4 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-3 text-[12px] text-white/80">
                Invited to room {inviteCode}{mpDuration > 0 ? ` · ${mpDuration} min timed` : ' · Sprint'} — set your name, pick a car, hit Join.
              </p>
            )}
            <p className="text-[11px] font-medium text-white/50">1 · Driver name</p>
            <input value={name} data-name="1" maxLength={14} onChange={(e) => setName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
              placeholder="YOUR NAME" aria-label="Racer name"
              className="mt-2 w-52 rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-sm outline-none focus:border-white/60" />
            <p className="mt-5 text-[11px] font-medium text-white/50">2 · Choose your car</p>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {CARS.map((c) => (
                <button key={c.id} onClick={() => setCarId(c.id)}
                  className={`rounded-xl border p-2 text-left transition ${carId === c.id ? 'border-white bg-white/[0.07]' : 'border-white/10 hover:border-white/30'}`}>
                  <Car3D color={c.color} size="sm" />
                  <span className={`mt-1.5 block text-[11px] font-semibold ${carId === c.id ? 'text-white' : 'text-white/70'}`}>{c.name}</span>
                </button>
              ))}
            </div>
            {inviteCode ? (
              <div className="mt-5 rounded-xl border border-white/10 bg-black/40 px-4 py-3">
                <p className="text-[11px] font-medium text-white/50">Host settings · locked</p>
                <p className="mt-2 text-[12px] text-white/80">Mode · {durLabel(mpDuration)} · {(WEATHERS[mpWeather]).name}</p>
              </div>
            ) : (
              <>
                <p className="mt-5 text-[11px] font-medium text-white/50">3 · Race length</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {DURATIONS.map((mins) => (
                    <button key={mins} onClick={() => setMpDuration(mins)}
                      className={`rounded-full border px-4 py-2 text-[12px] font-medium transition ${mpDuration === mins ? 'border-white bg-white text-black' : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white'}`}>
                      {durLabel(mins)}
                    </button>
                  ))}
                </div>
                <p className="mt-5 text-[11px] font-medium text-white/50">4 · Track weather</p>
                <div className="mt-2">
                  <WeatherPicker value={mpWeather} onChange={setMpWeather} />
                </div>
              </>
            )}
            <p className="mt-5 text-[11px] font-medium text-white/50">{inviteCode ? '3 · Enter the grid' : '5 · Enter the grid'}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {inviteCode ? (
                <button onClick={() => joinAs(inviteCode)} disabled={!name.trim()} className={primaryBtn}>
                  Join grid {inviteCode} →
                </button>
              ) : (
                <>
                  <button onClick={createRoom} disabled={!name.trim()} className={primaryBtn}>Create room →</button>
                  <span className="text-[11px] text-white/40">or</span>
                  <input value={joinCode} data-room="1" onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="CODE" aria-label="Room code"
                    className="w-28 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-white/60" />
                  <button onClick={() => joinAs(joinCode)} disabled={!name.trim() || !joinCode.trim()} className={ghostBtn}>Join →</button>
                </>
              )}
            </div>
          </section>
        )}

        {showLobby && (
          <section className="mt-4 rounded-2xl border border-white/10 bg-[#0b0e14] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium text-white/50">Lobby · Room {roomCode} · {durLabel(roomDuration)}</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight">Waiting for racers</p>
              </div>
              <div className="flex gap-2">
                {inRoom && (
                  <button onClick={() => setChatOpen((o) => !o)} className={ghostBtn}>Chat{chat.length > 0 ? ` (${chat.length})` : ''}</button>
                )}
                <button onClick={() => { navigator.clipboard?.writeText(inviteLink).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                  className={ghostBtn}>{copied ? 'Link copied ✓' : 'Copy invite link'}</button>
              </div>
            </div>
            <p className="mt-2 break-all text-[11px] text-white/50">{inviteLink}</p>
            {host && lobbySecs === null && (
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="flex items-center gap-1.5">
                  <span className="mr-1 text-[11px] text-white/50">Race length</span>
                  {DURATIONS.map((mins) => (
                    <button key={mins} onClick={() => pushDuration(mins)}
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${roomDuration === mins ? 'border-white bg-white text-black' : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white'}`}>
                      {durLabel(mins)}
                    </button>
                  ))}
                </span>
                <WeatherPicker small value={isWeather(roomWeather) ? (roomWeather as WeatherId) : 'rain'} onChange={pushWeather} />
              </div>
            )}
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {players.length === 0 && (
                <p className="text-[12px] text-white/50">
                  {connected ? 'Connecting… drivers appear here.' : 'Server offline — start it with `npm run server`, then rejoin.'}
                </p>
              )}
              {players.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-3 py-2">
                  <Car3D color={carOf(p.id === myId ? carId : p.car).color} size="sm" />
                  <span className="text-sm font-semibold">{p.id === myId ? `${name} (YOU)` : p.name}</span>
                  {(hostId ? p.id === hostId : (p.id === myId && isHost)) && (
                    <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-bold text-black">HOST</span>
                  )}
                  <span className="ml-auto text-[10px] font-medium text-emerald-300">Ready</span>
                </div>
              ))}
            </div>
            {lobbySecs !== null ? (
              <div className="mt-5 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-4 text-center">
                <p className="text-6xl font-semibold tabular-nums">{lobbySecs}</p>
                <p className="text-[11px] text-white/60">Race starts — get ready to type</p>
              </div>
            ) : (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {raceLive ? (
                  <span className="rounded-xl border border-white/15 bg-white/[0.05] px-4 py-3 text-[12px] text-white/70">Race in progress — you join the next round</span>
                ) : host ? (
                  <button onClick={startRace} className={primaryBtn}>Start race · 15s countdown →</button>
                ) : (
                  <span className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-[12px] text-white/60">Waiting for host to start…</span>
                )}
                <button onClick={() => { setJoined(false); setGo(false); }} className={ghostBtn}>Leave</button>
              </div>
            )}
          </section>
        )}

        {showTrack && (
          <>
            <section className="relative mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e14]">
              <WeatherCanvas weather={activeWeather.id} />
              <div className="relative z-[6] flex items-center justify-between gap-2 border-b border-white/10 px-4 py-2.5 text-[11px] text-white/55">
                <span className="truncate font-medium">
                  {finished ? 'Race complete'
                    : mode === 'practice' ? `Solo · ${duration} min · ${car.name}` : mpTimed ? `Timed · ${roomDuration} min · Most typed wins` : `Sprint · Position P0${myPos} / 0${racers.length}`}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-white/70">{activeWeather.name} · {activeWeather.sub}</span>
                  <span className="tabular-nums">{engine.isTimed ? `${fmt(engine.timeLeft)} · ` : ''}WPM {Math.round(wpm)} · {Math.round(engine.acc)}%</span>
                </span>
              </div>
              {finished && lobbySecs !== null && (
                <div className="relative z-[6] border-b border-white/10 bg-white/[0.04] px-4 py-3 text-center">
                  <p className="text-4xl font-semibold tabular-nums">{lobbySecs}</p>
                  <p className="text-[11px] text-white/60">Next race starts</p>
                </div>
              )}
              <div className="relative z-[6] space-y-2 p-3 md:p-4">
                {racers.map((r, i) => (
                  <RaceLane key={r.id} racer={r} pos={i + 1} racing={racing} weather={activeWeather} />
                ))}
              </div>
              <div className="relative z-[6] h-1 bg-white/10">
                <div className="h-full bg-white transition-[width]" style={{ width: `${Math.round(laneProgress * 100)}%` }} />
              </div>
            </section>

            <section className="relative mt-4 rounded-2xl border border-white/10 bg-black/50 p-5 md:p-7" onClick={smartFocus}>
              {engine.phase === 'countdown' && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-black/70 backdrop-blur-[2px]">
                  <p className="text-7xl font-semibold tabular-nums">{engine.countdown > 0 ? engine.countdown : 'GO'}</p>
                  <p className="text-[11px] text-white/60">Get ready</p>
                </div>
              )}
              {engine.phase === 'lobby' && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-black/70 p-4 text-center">
                  {mode === 'practice' ? (
                    <button onClick={() => { savedRef.current = false; engine.startTimed(duration); setTimeout(focus, 350); }} className={primaryBtn}>
                      {`Start ${duration} min sprint →`}
                    </button>
                  ) : (
                    <p className="text-[12px] text-white/60">Waiting for host to start…</p>
                  )}
                  <p className="text-[11px] text-white/50">Click to focus · then type</p>
                </div>
              )}
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[11px] text-white/45">
                  {mode === 'practice' ? `Type for ${duration} minutes — car moves only with clean keys` : mpTimed ? `Type for ${roomDuration} minutes — most typed wins` : 'Type this passage — same for all racers'}
                </p>
                {engine.isTimed && <p className="shrink-0 text-sm font-semibold tabular-nums">{fmt(engine.timeLeft)}</p>}
              </div>
              <p className="max-h-[220px] overflow-y-auto text-lg leading-9 tracking-wide md:text-xl" aria-live="polite" style={{ fontFamily: "'Inter','Space Grotesk',system-ui,sans-serif" }}>
                {engine.text.split('').map((ch, i) => {
                  const done = i < charIndex;
                  const cur = i === charIndex && racing;
                  const wrong = done && engine.errors[i];
                  return (
                    <span
                      key={i} id={`tc-${i}`}
                      className={wrong ? 'rounded bg-red-500/25 text-red-400 underline' : done ? 'text-white' : cur ? 'rounded bg-white text-black' : 'text-white/35'}
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
              <div className="mt-5 grid grid-cols-4 gap-2">
                {[['WPM', String(Math.round(wpm))], ['ACC', `${Math.round(engine.acc)}%`], [mode === 'practice' ? 'TIME' : 'POS', mode === 'practice' ? fmt(engine.timeLeft) : `P0${myPos}`], [mode === 'practice' ? 'GOAL' : 'DONE', `${Math.round(laneProgress * 100)}%`]].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-white/[0.04] px-3 py-2.5 text-center">
                    <p className="text-[10px] font-medium text-white/45">{k}</p>
                    <p className="text-lg font-semibold tabular-nums">{v}</p>
                  </div>
                ))}
              </div>
            </section>

            {finished && (
              <section className="mt-4 rounded-2xl border border-white/15 bg-white/[0.03] p-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium text-white/50">
                      {mode === 'practice' ? `${duration} min sprint — complete` : mpTimed ? `${roomDuration} min timed — complete · P0${myPos}` : `Results — P0${myPos} finish`}
                    </p>
                    <p className="mt-1 text-4xl font-semibold tracking-tight">WPM {Math.round(wpm)} <span className="text-xl font-normal text-white/50">· {Math.round(engine.acc)}% acc</span></p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mode === 'practice' ? (
                      <button onClick={() => { savedRef.current = false; engine.startTimed(duration); setTimeout(focus, 350); }} className={primaryBtn}>Race again →</button>
                    ) : (
                      <button onClick={rematch} className={primaryBtn}>Rematch · 15s →</button>
                    )}
                    <Link href="/" className={ghostBtn}>Home</Link>
                  </div>
                </div>
                {mode === 'multiplayer' && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-[12px]">
                      <thead><tr className="text-left text-white/45"><th className="py-2 pr-4 font-medium">POS</th><th className="py-2 pr-4 font-medium">RACER</th><th className="py-2 pr-4 font-medium">WPM</th><th className="py-2 font-medium">PROGRESS</th></tr></thead>
                      <tbody>
                        {racers.map((r, i) => (
                          <tr key={r.id} className="border-t border-white/10">
                            <td className="py-2 pr-4 tabular-nums">0{i + 1}</td>
                            <td className="py-2 pr-4">{r.name}</td>
                            <td className="py-2 pr-4 tabular-nums">{r.wpm}</td>
                            <td className="py-2 tabular-nums">{Math.round(r.progress * 100)}%</td>
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
                {[['Avg wpm', String(avg)], ['Best wpm', String(best)], ['Races', String(history.length)]].map(([k, v]) => (
                  <div key={k} className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
                    <p className="text-[10px] font-medium text-white/45">{k}</p>
                    <p className="text-3xl font-semibold tracking-tight">{v}</p>
                  </div>
                ))}
              </section>
            )}
          </>
        )}
      </div>

      {inRoom && (
        <RoomChat open={chatOpen} onClose={() => setChatOpen(false)} messages={chat} myName={name} onSend={sendChat} />
      )}
      {inRoom && !chatOpen && chat.length > 0 && (
        <button onClick={() => setChatOpen(true)}
          className="fixed bottom-5 right-5 z-30 rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold text-black shadow-xl hover:bg-gray-200">
          Chat · {chat.length}
        </button>
      )}
    </main>
  );
}
