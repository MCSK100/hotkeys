'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import { useRoom } from '@/hooks/useWebSocketSync';
import { CARS, loadHistory, makeRoomCode, saveResult, sharedQuote, sharedTimedText } from '@/components/race/quotes';
import { countBeep, engineRev, goBeep, chatPop } from '@/components/race/sound';
import Car3D from '@/components/race/Car3D';
import WinnerModal from '@/components/race/WinnerModal';
import AvatarImage from '@/components/race/AvatarImage';
import AvatarPicker from '@/components/race/AvatarPicker';
import { preloadAvatars } from '@/components/race/avatars';
import { WEATHERS, RaceLane, WeatherPicker, isWeather, type WeatherId } from '@/components/race/Track';
import WeatherCanvas from '@/components/race/WeatherCanvas';
import RoomChat from '@/components/race/RoomChat';

type Mode = 'practice' | 'multiplayer';

type Racer = {
  id: string; name: string; carId: string; color: string; avatar: string;
  progress: number; wpm: number; acc: number; you: boolean; finished: boolean;
};

function RaceLights({ remaining, large }: { remaining: number; large?: boolean }) {
  const red = remaining <= 3;
  const amber = remaining <= 2;
  const green = remaining <= 1;
  const go = remaining <= 0;
  const s = large ? 'h-9 w-9' : 'h-5 w-5';
  const lamp = (color: string, active: boolean, glow: string) => (
    <span className={`${s} rounded-full transition-all duration-200`} style={{
      background: active ? color : 'rgba(255,255,255,.14)',
      boxShadow: active ? `0 0 12px 3px ${glow}, 0 0 28px 6px ${glow}55` : 'inset 0 1px 3px rgba(0,0,0,.6)',
      transform: active ? 'scale(1.12)' : 'scale(1)',
      opacity: active ? 1 : 0.6,
    }} />
  );
  return (
    <span className={`flex items-center gap-2.5 rounded-2xl border border-white/10 bg-black/80 ${large ? 'px-5 py-3' : 'px-3 py-2'}`}>
      <style>{`@keyframes goPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }`}</style>
      {lamp('#ef4444', red, '#ef4444')}
      {lamp('#f59e0b', amber, '#f59e0b')}
      <span style={go ? { animation: 'goPulse .5s ease-in-out infinite' } : undefined}>
        {lamp('#22c55e', green || go, '#22c55e')}
      </span>
    </span>
  );
}

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

export default function RacePage() {
  const engine = useTypingEngine();
  const [mode, setMode] = useState<Mode>('practice');
  const [duration, setDuration] = useState(3);
  const [mpDuration, setMpDuration] = useState(0);
  const [weather, setWeather] = useState<WeatherId>('rain');
  const [mpWeather, setMpWeather] = useState<WeatherId>('rain');
  const [name, setName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [carId, setCarId] = useState('volt');
  const [avatar, setAvatar] = useState('');
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPing, setChatPing] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const winnerDismissed = useRef(false);
  const prevChatLen = useRef(0);
  const [light, setLight] = useState(false);
  const [history, setHistory] = useState<{ wpm: number; acc: number }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastRound = useRef(0);
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
  const { players, chat, sendChat, round, connected, lobbySecs, go, myId, hostId, roomStatus, send, startRace, setGo, roomDuration, setDuration: pushDuration, roomWeather, setWeather: pushWeather } = useRoom(roomCode, name, carId, avatar, inRoom);
  const raceLive = roomStatus === 'countdown' || roomStatus === 'racing';
  const host = hostId ? myId === hostId : isHost;
  const activeWeather = WEATHERS[mode === 'practice' ? weather : isWeather(roomWeather) ? (roomWeather as WeatherId) : 'rain'];
  const displayName = name.trim() || 'GUEST';
  const nameValid = name.trim().length > 0;

  const racing = engine.phase === 'racing';
  const finished = engine.phase === 'finished';
  const [soundOn, setSoundOn] = useState(true);
  const soundRef = useRef(true);
  soundRef.current = soundOn;
  const prevPhase = useRef(engine.phase);
  const practiceGoal = engine.durationSec > 0 ? Math.max(1, (engine.durationSec / 60) * 200) : 1;
  const practiceProgress = Math.min(1, engine.correctChars / practiceGoal);
  const laneProgress = mode === 'practice' ? practiceProgress : engine.isTimed ? engine.typed : engine.progress;

  // Theme helpers — light / dark surfaces for the whole race page.
  const primaryBtn = light
    ? 'rounded-xl bg-black px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-black/80 disabled:opacity-40'
    : 'rounded-xl bg-white px-5 py-2.5 text-[13px] font-semibold text-black transition hover:bg-gray-200 disabled:opacity-40';
  const ghostBtn = light
    ? 'rounded-xl border border-black/15 bg-black/[0.03] px-5 py-2.5 text-[13px] font-semibold text-black/70 transition hover:border-black/40 hover:text-black disabled:opacity-40'
    : 'rounded-xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-[13px] font-semibold text-white/80 transition hover:border-white/40 hover:text-white disabled:opacity-40';
  const card = light ? 'border-black/10 bg-white' : 'border-white/10 bg-white/[0.02]';
  const muted = light ? 'text-black/50' : 'text-white/50';
  const faint = light ? 'text-black/40' : 'text-white/40';
  const faint2 = light ? 'text-black/60' : 'text-white/60';
  const inputCls = light
    ? 'border-black/15 bg-black/[0.03] text-black placeholder:text-black/30 focus:border-black/50'
    : 'border-white/15 bg-black/40 text-white placeholder:text-white/30 focus:border-white/60';
  const pickActive = light ? 'border-black bg-black text-white' : 'border-white bg-white text-black';
  const pickIdle = light ? 'border-black/15 text-black/60 hover:border-black/40 hover:text-black' : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white';
  const carBtn = (sel: boolean) => light
    ? (sel ? 'border-black bg-black/[0.04]' : 'border-black/10 hover:border-black/35')
    : (sel ? 'border-white bg-white/[0.08]' : 'border-white/10 hover:border-white/35');
  const carName = (sel: boolean) => light
    ? (sel ? 'text-black' : 'text-black/55')
    : (sel ? 'text-white' : 'text-white/55');

  useEffect(() => {
    try {
      if (localStorage.getItem('hk-race-theme') === 'light') setLight(true);
      const av = localStorage.getItem('hk-race-avatar-v2');
      if (av) setAvatar(av);
      else setAvatar('');
    } catch { /* ignore */ }
    preloadAvatars();
  }, []);

  const pickAvatar = (wiki: string) => {
    setAvatar(wiki);
    try { localStorage.setItem('hk-race-avatar-v2', wiki); } catch { /* ignore */ }
  };

  const toggleTheme = () => {
    setLight((v) => {
      try {
        localStorage.setItem('hk-race-theme', v ? 'dark' : 'light');
      } catch { /* ignore */ }
      return !v;
    });
  };

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

  // Every race round (first + every host rematch) starts exactly once per joined player.
  // Text is seeded by room + round so every rematch types a different paragraph.
  useEffect(() => {
    if (go && roomCode && round !== lastRound.current && round > 0) {
      lastRound.current = round;
      savedRef.current = false;
      const d = roomDuration;
      if (d > 0) startTimedRef.current(d, sharedTimedText(roomCode, d, round), false);
      else newRaceRef.current(sharedQuote(roomCode, round));
      setTimeout(() => inputRef.current?.focus(), 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [go, roomCode, roomDuration, round]);

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
    if (inRoom) send(laneProgress, wpm, phase === 'finished', engine.acc);
  }, [laneProgress, wpm, phase, inRoom, send, engine.acc]);

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

  // Typing starts → focus lands straight in the typing box (never steals chat/name inputs).
  useEffect(() => {
    if (phase !== 'countdown' && phase !== 'racing') return;
    const ae = document.activeElement as HTMLElement | null;
    if (ae && (ae.dataset.chat === '1' || ae.dataset.name === '1' || ae.dataset.room === '1')) return;
    inputRef.current?.focus();
  }, [phase]);

  const racers: Racer[] = useMemo(() => {
    if (mode === 'practice') {
      return [{ id: 'you', name: `${displayName} (YOU)`, carId, color: car.color, avatar, progress: laneProgress, wpm: Math.round(wpm), acc: Math.round(engine.acc * 10) / 10, you: true, finished }];
    }
    const me: Racer = { id: myId, name: `${displayName} (YOU)`, carId, color: car.color, avatar, progress: laneProgress, wpm: Math.round(wpm), acc: Math.round(engine.acc * 10) / 10, you: true, finished };
    if (!inRoom || players.length === 0) return [me];
    const map = new Map<string, Racer>();
    map.set(myId, me);
    for (const p of players) {
      if (p.id === myId) {
        map.set(myId, { ...me, acc: me.acc });
        continue;
      }
      const c = carOf(p.car);
      map.set(p.id, { id: p.id, name: p.name, carId: p.car, color: c.color, avatar: p.avatar, progress: p.progress, wpm: p.wpm, acc: p.acc ?? 100, you: false, finished: p.finished });
    }
    return [...map.values()].sort((a, b) => b.progress - a.progress || b.wpm - a.wpm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, displayName, carId, avatar, inRoom, players, myId, laneProgress, wpm, finished, car.color, engine.acc]);

  const words = useMemo(() => {
    const out: { word: string; start: number }[] = [];
    const re = /\S+\s*/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(engine.text)) !== null) out.push({ word: m[0], start: m.index });
    return out;
  }, [engine.text]);

  const myPos = racers.findIndex((r) => r.you) + 1;
  const allFinished = inRoom && racers.length >= 1 && racers.every((r) => r.finished);

  useEffect(() => {
    if (chat.length > prevChatLen.current) {
      if (!chatOpen && prevChatLen.current > 0) {
        if (soundRef.current) chatPop();
        setChatPing(true);
        setTimeout(() => setChatPing(false), 1600);
      }
    }
    prevChatLen.current = chat.length;
  }, [chat.length, chatOpen]);

  useEffect(() => {
    winnerDismissed.current = false;
    setShowWinner(false);
  }, [round]);

  useEffect(() => {
    if (mode === 'multiplayer' && inRoom && allFinished && !winnerDismissed.current) {
      const t = setTimeout(() => setShowWinner(true), 700);
      return () => clearTimeout(t);
    }
    if (!allFinished) setShowWinner(false);
  }, [mode, inRoom, allFinished]);
  const linkDur = (inRoom ? roomDuration : mpDuration) || 0;
  const linkWeather = inRoom ? (isWeather(roomWeather) ? roomWeather : 'rain') : mpWeather;
  const inviteLink = roomCode && typeof window !== 'undefined'
    ? `${window.location.origin}/race?room=${roomCode}${linkDur > 0 ? `&duration=${linkDur}` : ''}&weather=${linkWeather}`
    : '';
  const avg = history.length ? Math.round(history.reduce((s, h) => s + h.wpm, 0) / history.length) : 0;
  const best = history.length ? Math.max(...history.map((h) => h.wpm)) : 0;

  const resetRound = () => {
    setGo(false);
    setShowWinner(false);
    winnerDismissed.current = false;
    savedRef.current = false;
  };
  const createRoom = () => {
    if (!nameValid) { setNameTouched(true); return; }
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
    if (!c || !nameValid) { setNameTouched(true); return; }
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
    <main className={`min-h-screen font-body ${light ? 'bg-[#eef0f3] text-[#14171c]' : 'bg-[#08090c] text-[#eceef1]'}`} onClick={smartFocus}>
      <header className={`sticky top-0 z-20 border-b backdrop-blur ${light ? 'border-black/10 bg-white/90' : 'border-white/[0.07] bg-[#0b0e14]/90'}`}>
        <div className="mx-auto flex h-[60px] max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/hotkeyslogo.png" alt="HotKeys" className="h-9 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-2 text-[12px] font-medium">
            <button onClick={toggleTheme} aria-label={light ? 'Switch to dark mode' : 'Switch to light mode'} title={light ? 'Switch to dark mode' : 'Switch to light mode'}
              className={`relative h-7 w-[54px] rounded-full border transition-colors duration-300 ${light ? 'border-black/15 bg-black/10' : 'border-white/15 bg-white/10'}`}>
              <span className={`absolute top-[2px] flex h-[22px] w-[22px] items-center justify-center rounded-full shadow transition-all duration-300 ${light ? 'left-[28px] bg-black' : 'left-[2px] bg-white'}`}>
                <span className="relative block h-3.5 w-3.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className={`absolute inset-0 h-full w-full text-amber-400 transition-all duration-300 ${light ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}`}>
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                  </svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" className={`absolute inset-0 h-full w-full text-slate-500 transition-all duration-300 ${light ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}>
                    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
                  </svg>
                </span>
              </span>
            </button>
            {inRoom && (
              <button onClick={(e) => { e.stopPropagation(); setChatOpen((o) => !o); }}
                className={`rounded-full border px-3 py-1.5 transition ${chatOpen ? (light ? 'border-black bg-black text-white' : 'border-white bg-white text-black') : (light ? 'border-black/15 text-black/70 hover:border-black/40 hover:text-black' : 'border-white/15 text-white/70 hover:border-white/40 hover:text-white')}`}>
                Chat{chat.length > 0 ? ` · ${chat.length}` : ''}
              </button>
            )}
            <button onClick={() => setSoundOn((s) => !s)} aria-label="Toggle sound"
              className={`rounded-full border px-3 py-1.5 ${soundOn ? (light ? 'border-black/30 text-black' : 'border-white/30 text-white') : (light ? 'border-black/15 text-black/50' : 'border-white/15 text-white/50')}`}>
              {soundOn ? 'Sound on' : 'Muted'}
            </button>
            {roomCode && mode === 'multiplayer' && <span className={`rounded-full border px-3 py-1.5 ${light ? 'border-black/15 bg-black/[0.04] text-black/80' : 'border-white/15 bg-white/[0.06] text-white/80'}`}>Room {roomCode}</span>}
            <span className={`rounded-full px-3 py-1.5 ${mode === 'practice' ? (light ? 'bg-black/10 text-black/70' : 'bg-white/10 text-white/70') : connected ? 'bg-emerald-500/15 text-emerald-600' : 'bg-amber-500/15 text-amber-600'}`}>
              {mode === 'practice' ? 'Solo' : connected ? `Live · ${players.length}` : 'Connecting'}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setMode('practice'); setJoined(false); window.history.replaceState(null, '', '/race?mode=practice'); }}
            className={`rounded-full px-5 py-2.5 text-[13px] font-semibold transition ${mode === 'practice' ? (light ? 'bg-black text-white' : 'bg-white text-black') : (light ? 'bg-black/[0.05] text-black/70 hover:bg-black/10 hover:text-black' : 'bg-white/[0.06] text-white/70 hover:bg-white/10 hover:text-white')}`}
          >
            Solo practice
          </button>
          <button
            onClick={() => { setMode('multiplayer'); window.history.replaceState(null, '', '/race?mode=multiplayer'); }}
            className={`rounded-full px-5 py-2.5 text-[13px] font-semibold transition ${mode === 'multiplayer' ? (light ? 'bg-black text-white' : 'bg-white text-black') : (light ? 'bg-black/[0.05] text-black/70 hover:bg-black/10 hover:text-black' : 'bg-white/[0.06] text-white/70 hover:bg-white/10 hover:text-white')}`}
          >
            Multiplayer
          </button>
          {mode === 'practice' && (
            <span className="ml-auto flex flex-wrap items-center gap-1.5">
              {[3, 5, 10].map((mins) => (
                <button key={mins} onClick={() => setDuration(mins)}
                  className={`rounded-full border px-3.5 py-2 text-[12px] font-medium transition ${duration === mins ? pickActive : pickIdle}`}>
                  {mins} min
                </button>
              ))}
              <WeatherPicker small light={light} value={weather} onChange={setWeather} />
            </span>
          )}
        </div>

        {mode === 'practice' && (
          <section className={`mt-4 rounded-2xl border p-4 ${card}`}>
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-2">
                <button onClick={() => setAvatarOpen(true)} title="Choose avatar" aria-label="Choose avatar" className="shrink-0 rounded-full transition hover:scale-105">
                  <AvatarImage wiki={avatar} size={36} light={light} />
                </button>
                <label className="flex items-center gap-2">
                  <span className={`text-[11px] font-medium ${muted}`}>Driver</span>
                  <input value={name} data-name="1" maxLength={14} onChange={(e) => setName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                    placeholder="YOUR NAME" aria-label="Racer name"
                    className={`w-36 rounded-lg border px-3 py-2 text-[12px] font-medium outline-none ${inputCls}`} />
                </label>
              </span>
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <span className={`text-[11px] font-medium ${muted}`}>Garage</span>
                {CARS.map((c) => (
                  <button key={c.id} onClick={() => setCarId(c.id)} title={c.name} aria-label={c.name}
                    className={`rounded-xl border px-2 py-1.5 transition ${carBtn(carId === c.id)}`}>
                    <Car3D color={c.color} size="sm" />
                    <span className={`mt-1 block text-center text-[10px] font-semibold ${carName(carId === c.id)}`}>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {showSetup && (
          <section className={`mt-4 rounded-2xl border p-5 ${card}`}>
            {inviteCode && (
              <p className={`mb-4 rounded-xl border px-4 py-3 text-[12px] ${light ? 'border-black/15 bg-black/[0.03] text-black/80' : 'border-white/15 bg-white/[0.05] text-white/80'}`}>
                Invited to room {inviteCode}{mpDuration > 0 ? ` · ${mpDuration} min timed` : ' · Sprint'} — set your name, pick a car, hit Join.
              </p>
            )}
            <p className={`text-[11px] font-medium ${muted}`}>1 · Driver name + avatar</p>
            <div className="mt-2 flex items-center gap-2">
              <button onClick={() => setAvatarOpen(true)} title="Choose avatar" aria-label="Choose avatar" className="shrink-0 rounded-full transition hover:scale-105">
                <AvatarImage wiki={avatar} size={42} light={light} />
              </button>
              <input value={name} data-name="1" maxLength={14}
                onChange={(e) => { setName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '')); setNameTouched(true); }}
                placeholder="Enter your name to race" aria-label="Racer name"
                className={`w-52 rounded-xl border px-3 py-2.5 text-sm outline-none ${inputCls} ${nameTouched && !nameValid ? (light ? '!border-red-500' : '!border-red-400') : ''}`} />
            </div>
            {nameTouched && !nameValid && (
              <p className="mt-1.5 text-[12px] font-medium text-red-500">Please enter your name to join the race.</p>
            )}
            <p className={`mt-5 text-[11px] font-medium ${muted}`}>2 · Choose your car</p>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {CARS.map((c) => (
                <button key={c.id} onClick={() => setCarId(c.id)}
                  className={`rounded-xl border p-2 text-left transition ${carBtn(carId === c.id)}`}>
                  <Car3D color={c.color} size="sm" />
                  <span className={`mt-1.5 block text-[11px] font-semibold ${light ? (carId === c.id ? 'text-black' : 'text-black/70') : (carId === c.id ? 'text-white' : 'text-white/70')}`}>{c.name}</span>
                </button>
              ))}
            </div>
            {inviteCode ? (
              <div className={`mt-5 rounded-xl border px-4 py-3 ${light ? 'border-black/10 bg-black/[0.03]' : 'border-white/10 bg-black/40'}`}>
                <p className={`text-[11px] font-medium ${muted}`}>Host settings · locked</p>
                <p className={`mt-2 text-[12px] ${light ? 'text-black/80' : 'text-white/80'}`}>Mode · {durLabel(mpDuration)} · {(WEATHERS[mpWeather]).name}</p>
              </div>
            ) : (
              <>
                <p className={`mt-5 text-[11px] font-medium ${muted}`}>3 · Race length</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {DURATIONS.map((mins) => (
                    <button key={mins} onClick={() => setMpDuration(mins)}
                      className={`rounded-full border px-4 py-2 text-[12px] font-medium transition ${mpDuration === mins ? pickActive : pickIdle}`}>
                      {durLabel(mins)}
                    </button>
                  ))}
                </div>
                <p className={`mt-5 text-[11px] font-medium ${muted}`}>4 · Track weather</p>
                <div className="mt-2">
                  <WeatherPicker light={light} value={mpWeather} onChange={setMpWeather} />
                </div>
              </>
            )}
            <p className={`mt-5 text-[11px] font-medium ${muted}`}>{inviteCode ? '3 · Enter the grid' : '5 · Enter the grid'}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {inviteCode ? (
                <button onClick={() => joinAs(inviteCode)} disabled={!nameValid} title={!nameValid ? 'Enter your name first' : undefined} className={primaryBtn}>
                  Join grid {inviteCode} →
                </button>
              ) : (
                <>
                  <button onClick={createRoom} disabled={!nameValid} title={!nameValid ? 'Enter your name first' : undefined} className={primaryBtn}>Create room →</button>
                  <span className={`text-[11px] ${faint}`}>or</span>
                  <input value={joinCode} data-room="1" onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="CODE" aria-label="Room code"
                    className={`w-28 rounded-xl border px-3 py-2 text-sm outline-none ${inputCls}`} />
                  <button onClick={() => joinAs(joinCode)} disabled={!nameValid || !joinCode.trim()} title={!nameValid ? 'Enter your name first' : undefined} className={ghostBtn}>Join →</button>
                </>
              )}
            </div>
          </section>
        )}

        {showLobby && (
          <section className={`mt-4 rounded-2xl border p-5 ${light ? 'border-black/10 bg-white' : 'border-white/10 bg-[#0b0e14]'}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className={`text-[11px] font-medium ${muted}`}>Lobby · Room {roomCode} · {durLabel(roomDuration)}</p>
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
            <p className={`mt-2 break-all text-[11px] ${muted}`}>{inviteLink}</p>
            {host && lobbySecs === null && (
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="flex items-center gap-1.5">
                  <span className={`mr-1 text-[11px] ${muted}`}>Race length</span>
                  {DURATIONS.map((mins) => (
                    <button key={mins} onClick={() => pushDuration(mins)}
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${roomDuration === mins ? pickActive : pickIdle}`}>
                      {durLabel(mins)}
                    </button>
                  ))}
                </span>
                <WeatherPicker small light={light} value={isWeather(roomWeather) ? (roomWeather as WeatherId) : 'rain'} onChange={pushWeather} />
              </div>
            )}
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {players.length === 0 && (
                <p className={`text-[12px] ${muted}`}>
                  {connected ? 'Connecting… drivers appear here.' : 'Server offline — start it with `npm run server`, then rejoin.'}
                </p>
              )}
              {players.map((p) => (
                <div key={p.id} className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${light ? 'border-black/10 bg-black/[0.03]' : 'border-white/10 bg-black/40'}`}>
                  <AvatarImage wiki={p.id === myId ? avatar : p.avatar} size={30} light={light} />
                  <Car3D color={carOf(p.id === myId ? carId : p.car).color} size="sm" />
                  <span className="text-sm font-semibold">{p.id === myId ? `${displayName} (YOU)` : p.name}</span>
                  {(hostId ? p.id === hostId : (p.id === myId && isHost)) && (
                    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${light ? 'bg-black text-white' : 'bg-white text-black'}`}>HOST</span>
                  )}
                  <span className="ml-auto text-[10px] font-medium text-emerald-600">Ready</span>
                </div>
              ))}
            </div>
            {lobbySecs !== null ? (
              <div className={`mt-5 rounded-xl border px-4 py-4 text-center ${light ? 'border-black/15 bg-black/[0.03]' : 'border-white/15 bg-white/[0.04]'}`}>
                {lobbySecs > 3 ? (
                  <>
                    <p className="text-6xl font-semibold tabular-nums">{lobbySecs}</p>
                    <p className={`mt-1 text-[11px] ${faint2}`}>Race starts — get ready to type</p>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <RaceLights remaining={lobbySecs} large />
                    <p className="text-7xl font-extrabold tabular-nums">{lobbySecs}</p>
                    <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${faint2}`}>On your marks</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {raceLive ? (
                  <span className={`rounded-xl border px-4 py-3 text-[12px] ${light ? 'border-black/15 bg-black/[0.03] text-black/70' : 'border-white/15 bg-white/[0.05] text-white/70'}`}>Race in progress — you join the next round</span>
                ) : host ? (
                  <button onClick={startRace} className={primaryBtn}>Start race · 15s countdown →</button>
                ) : (
                  <span className={`rounded-xl border px-4 py-3 text-[12px] ${light ? 'border-black/15 bg-black/[0.03] text-black/60' : 'border-white/15 bg-white/[0.04] text-white/60'}`}>Waiting for host to start…</span>
                )}
                <button onClick={() => { setJoined(false); setGo(false); }} className={ghostBtn}>Leave</button>
              </div>
            )}
          </section>
        )}

        {showTrack && (
          <>
            <section className={`relative mt-4 overflow-hidden rounded-2xl border ${light ? 'border-black/10 bg-[#dfe4ec]' : 'border-white/10 bg-[#0b0e14]'}`}>
              <WeatherCanvas weather={activeWeather.id} light={light} />
              <div className={`relative z-[6] flex items-center justify-between gap-2 border-b px-4 py-2.5 text-[11px] ${light ? 'border-black/10 text-black/60' : 'border-white/10 text-white/55'}`}>
                <span className="truncate font-medium">
                  {finished ? 'Race complete'
                    : mode === 'practice' ? `Solo · ${duration} min · ${car.name}` : mpTimed ? `Timed · ${roomDuration} min · Most typed wins` : `Sprint · Position P0${myPos} / 0${racers.length}`}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full border px-2.5 py-1 ${light ? 'border-black/10 bg-black/[0.05] text-black/70' : 'border-white/10 bg-black/40 text-white/70'}`}>{activeWeather.name} · {activeWeather.sub}</span>
                  <span className="tabular-nums">{engine.isTimed ? `${fmt(engine.timeLeft)} · ` : ''}WPM {Math.round(wpm)} · {Math.round(engine.acc)}%</span>
                </span>
              </div>
              {finished && lobbySecs !== null && (
                <div className={`relative z-[6] border-b px-4 py-3 text-center ${light ? 'border-black/10 bg-black/[0.04]' : 'border-white/10 bg-white/[0.04]'}`}>
                  <p className="text-4xl font-semibold tabular-nums">{lobbySecs}</p>
                  <p className={`text-[11px] ${light ? 'text-black/60' : 'text-white/60'}`}>Next race starts</p>
                </div>
              )}
              <div className="relative z-[6] space-y-2 p-3 md:p-4">
                {racers.map((r, i) => (
                  <RaceLane key={r.id} racer={r} pos={i + 1} racing={racing} weather={activeWeather} light={light} />
                ))}
              </div>
              <div className={`relative z-[6] h-1 ${light ? 'bg-black/10' : 'bg-white/10'}`}>
                <div className={`h-full transition-[width] ${light ? 'bg-black' : 'bg-white'}`} style={{ width: `${Math.round(laneProgress * 100)}%` }} />
              </div>
            </section>

            <section className={`relative mt-4 rounded-2xl border p-5 md:p-7 ${light ? 'border-black/10 bg-white' : 'border-white/10 bg-black/50'}`} onClick={smartFocus}>
              {engine.phase === 'countdown' && (
                <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl backdrop-blur-[2px] ${light ? 'bg-white/80' : 'bg-black/70'}`}>
                  <RaceLights remaining={engine.countdown} large />
                  <p className="text-7xl font-extrabold tabular-nums">{engine.countdown > 0 ? engine.countdown : 'GO'}</p>
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${faint2}`}>{engine.countdown > 0 ? 'On your marks' : 'Go go go'}</p>
                </div>
              )}
              {engine.phase === 'lobby' && (
                <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl p-4 text-center ${light ? 'bg-white/85' : 'bg-black/70'}`}>
                  {mode === 'practice' ? (
                    <button onClick={() => { savedRef.current = false; engine.startTimed(duration); setTimeout(focus, 350); }} className={primaryBtn}>
                      {`Start ${duration} min sprint →`}
                    </button>
                  ) : (
                    <p className={`text-[12px] ${faint2}`}>Waiting for host to start…</p>
                  )}
                  <p className={`text-[11px] ${muted}`}>Click to focus · then type</p>
                </div>
              )}
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className={`text-[11px] ${light ? 'text-black/45' : 'text-white/45'}`}>
                  {mode === 'practice' ? `Type for ${duration} minutes — car moves only with clean keys` : mpTimed ? `Type for ${roomDuration} minutes — most typed wins` : 'Type this passage — same for all racers'}
                </p>
                {engine.isTimed && <p className="shrink-0 text-sm font-semibold tabular-nums">{fmt(engine.timeLeft)}</p>}
              </div>
              <p className="max-h-[240px] overflow-y-auto text-xl leading-[2.75rem] md:text-[22px]" aria-live="polite" style={{ fontFamily: "'Inter','Space Grotesk',system-ui,sans-serif", letterSpacing: '0.045em' }}>
                {words.map(({ word, start }) => {
                  const end = start + word.length;
                  const isCurrent = racing && charIndex >= start && charIndex < end;
                  return (
                    <span key={start} className={isCurrent ? `underline decoration-2 underline-offset-8 ${light ? 'decoration-black/35' : 'decoration-white/40'}` : undefined}>
                      {word.split('').map((ch, k) => {
                        const i = start + k;
                        const done = i < charIndex;
                        const cur = i === charIndex && racing;
                        const wrong = done && engine.errors[i];
                        return (
                          <span key={i} id={`tc-${i}`}>
                            {cur && <span className={`blink -ml-[2px] inline-block h-[1.15em] w-[3px] translate-y-[4px] ${light ? 'bg-emerald-600' : 'bg-emerald-300'}`} />}
                            <span className={wrong ? (light ? 'bg-red-600/10 text-red-600 underline decoration-red-600/70 underline-offset-4' : 'bg-red-500/15 text-red-400 underline decoration-red-400/70 underline-offset-4') : done ? (light ? 'font-medium text-emerald-700' : 'font-medium text-emerald-300') : (light ? 'text-black/60' : 'text-white/55')}>
                              {ch}
                            </span>
                          </span>
                        );
                      })}
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
                  <div key={k} className={`rounded-xl px-3 py-2.5 text-center ${light ? 'bg-black/[0.04]' : 'bg-white/[0.04]'}`}>
                    <p className={`text-[10px] font-medium ${light ? 'text-black/45' : 'text-white/45'}`}>{k}</p>
                    <p className="text-lg font-semibold tabular-nums">{v}</p>
                  </div>
                ))}
              </div>
            </section>

            {finished && (
              <section className={`mt-4 rounded-2xl border p-5 ${light ? 'border-black/15 bg-white' : 'border-white/15 bg-white/[0.03]'}`}>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className={`text-[11px] font-medium ${muted}`}>
                      {mode === 'practice' ? `${duration} min sprint — complete` : mpTimed ? `${roomDuration} min timed — complete · P0${myPos}` : `Results — P0${myPos} finish`}
                    </p>
                    <p className="mt-1 text-4xl font-semibold tracking-tight">WPM {Math.round(wpm)} <span className={`text-xl font-normal ${light ? 'text-black/50' : 'text-white/50'}`}>· {Math.round(engine.acc)}% acc</span></p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {mode === 'practice' ? (
                      <button onClick={() => { savedRef.current = false; engine.startTimed(duration); setTimeout(focus, 350); }} className={primaryBtn}>Race again →</button>
                    ) : host ? (
                      <button onClick={rematch} className={primaryBtn}>Rematch · 15s →</button>
                    ) : (
                      <span className={`rounded-xl border px-4 py-2.5 text-[12px] ${light ? 'border-black/15 bg-black/[0.03] text-black/60' : 'border-white/15 bg-white/[0.04] text-white/60'}`}>Waiting for host rematch…</span>
                    )}
                    <Link href="/" className={ghostBtn}>Home</Link>
                  </div>
                </div>
                {mode === 'multiplayer' && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-[12px]">
                      <thead><tr className={`text-left ${light ? 'text-black/45' : 'text-white/45'}`}><th className="py-2 pr-4 font-medium">POS</th><th className="py-2 pr-4 font-medium">AVATAR</th><th className="py-2 pr-4 font-medium">RACER</th><th className="py-2 pr-4 font-medium">WPM</th><th className="py-2 pr-4 font-medium">ACCURACY</th><th className="py-2 font-medium">PROGRESS</th></tr></thead>
                      <tbody>
                        {racers.map((r, i) => (
                          <tr key={r.id} className={`border-t ${light ? 'border-black/10' : 'border-white/10'} ${r.you ? (light ? 'bg-black/[0.03]' : 'bg-white/[0.05]') : ''}`}>
                            <td className="py-2 pr-4 tabular-nums">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${i === 0 ? 'bg-amber-400 text-black' : i === 1 ? 'bg-slate-300 text-black' : i === 2 ? 'bg-orange-400 text-black' : (light ? 'bg-black/10 text-black/60' : 'bg-white/10 text-white/60')}`}>
                                {i === 0 ? '🥇 1st' : i === 1 ? '🥈 2nd' : i === 2 ? '🥉 3rd' : `0${i + 1}`}
                              </span>
                            </td>
                            <td className="py-2 pr-4"><AvatarImage wiki={r.avatar} size={30} light={light} /></td>
                            <td className="py-2 pr-4 font-semibold">{r.name}{r.finished ? ' 🏁' : ''}</td>
                            <td className="py-2 pr-4 tabular-nums">{r.wpm}</td>
                            <td className={`py-2 pr-4 tabular-nums font-semibold ${r.acc >= 95 ? 'text-emerald-500' : r.acc >= 85 ? 'text-amber-500' : 'text-red-500'}`}>{Math.round(r.acc)}%</td>
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
                  <div key={k} className={`rounded-2xl border px-4 py-3 ${card}`}>
                    <p className={`text-[10px] font-medium ${light ? 'text-black/45' : 'text-white/45'}`}>{k}</p>
                    <p className="text-3xl font-semibold tracking-tight">{v}</p>
                  </div>
                ))}
              </section>
            )}
          </>
        )}
      </div>

      {inRoom && (
        <RoomChat light={light} open={chatOpen} onClose={() => setChatOpen(false)} messages={chat} myName={displayName} onSend={sendChat} />
      )}
      {inRoom && !chatOpen && (
        <button onClick={() => { setChatOpen(true); setChatPing(false); }}
          className={`fixed bottom-5 right-5 z-30 rounded-full px-4 py-2.5 text-[13px] font-semibold shadow-xl ${light ? 'bg-black text-white hover:bg-black/80' : 'bg-white text-black hover:bg-gray-200'}`}
          style={chatPing ? { animation: 'chatBounce .5s ease-in-out 3' } : undefined}>
          <style>{`@keyframes chatBounce { 0%,100% { transform: scale(1); } 30% { transform: scale(1.18) rotate(-4deg); } 60% { transform: scale(0.94) rotate(3deg); } }`}</style>
          <span className="mr-1 inline-block" style={chatPing ? { animation: 'chatBounce .5s ease-in-out 3' } : undefined}>💬</span>
          Chat{chat.length > 0 ? ` · ${chat.length}` : ''}{chatPing ? ' • new!' : ''}
        </button>
      )}
      {showWinner && mode === 'multiplayer' && allFinished && (
        <WinnerModal racers={racers} allFinished={allFinished} light={light} soundOn={soundOn} onClose={() => { winnerDismissed.current = true; setShowWinner(false); }} />
      )}
      {avatarOpen && (
        <AvatarPicker value={avatar} light={light} onPick={pickAvatar} onClose={() => setAvatarOpen(false)} />
      )}
    </main>
  );
}
