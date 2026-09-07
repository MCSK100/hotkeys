'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3001';

export type NetPlayer = { id: string; name: string; car: string; progress: number; wpm: number; finished: boolean };

export function useRoom(roomCode: string | null, name: string, car: string, enabled: boolean) {
  const [players, setPlayers] = useState<NetPlayer[]>([]);
  const [connected, setConnected] = useState(false);
  const [lobbySecs, setLobbySecs] = useState<number | null>(null);
  const [go, setGo] = useState(false);
  const [roomDuration, setRoomDuration] = useState(0);
  const [roomWeather, setRoomWeather] = useState('rain');
  const [hostId, setHostId] = useState<string | null>(null);
  const [roomStatus, setRoomStatus] = useState('lobby');
  const wsRef = useRef<WebSocket | null>(null);
  const idRef = useRef(`p-${Math.random().toString(36).slice(2, 8)}`);
  const lastSend = useRef(0);
  // Identity captured at join time so typing in inputs can't reconnect the socket.
  const identityRef = useRef({ name, car });
  identityRef.current = { name, car };

  useEffect(() => {
    setGo(false);
    setLobbySecs(null);
    setPlayers([]);
    setRoomDuration(0);
    setRoomWeather('rain');
    setHostId(null);
    setRoomStatus('lobby');
  }, [roomCode]);

  useEffect(() => {
    if (!enabled || !roomCode) return;
    const identity = identityRef.current;
    const myId = idRef.current;
    let closed = false;
    let ws: WebSocket;
    try {
      ws = new WebSocket(WS_URL);
    } catch {
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => {
      if (closed) return;
      setConnected(true);
      ws.send(JSON.stringify({ type: 'JOIN_ROOM', payload: { roomCode, profile: { id: myId, name: identity.name, car: identity.car } } }));
    };
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data as string);
        if (msg.type === 'ROOM_STATE') {
          if (typeof msg.room?.duration === 'number') setRoomDuration(msg.room.duration);
          if (typeof msg.room?.weather === 'string') setRoomWeather(msg.room.weather);
          if (typeof msg.room?.hostId === 'string') setHostId(msg.room.hostId);
          if (typeof msg.room?.status === 'string') setRoomStatus(msg.room.status);
          const list = (msg.room?.players ?? []).map((p: { id: string; profile?: { name?: string; car?: string }; progress?: { progressPercent?: number; currentWpm?: number } }) => ({
            id: p.id,
            name: p.id === myId ? `${identity.name} (YOU)` : (p.profile?.name ?? 'RACER'),
            car: p.id === myId ? identity.car : (p.profile?.car ?? 'volt'),
            progress: p.progress?.progressPercent ?? 0,
            wpm: Math.round(p.progress?.currentWpm ?? 0),
            finished: (p.progress?.progressPercent ?? 0) >= 1,
          }));
          setPlayers(list);
        }
        if (msg.type === 'PROGRESS_BATCH') {
          setPlayers((prev) => {
            const known = new Map(prev.map((p) => [p.id, p]));
            return (msg.payloads ?? []).map((p: { pid: string; p: number; w: number }) => {
              const old = known.get(p.pid);
              const mine = p.pid === myId;
              return {
                id: p.pid,
                name: mine ? `${identity.name} (YOU)` : (old?.name ?? p.pid.slice(0, 6)),
                car: mine ? identity.car : (old?.car ?? 'volt'),
                progress: p.p ?? 0, wpm: Math.round(p.w ?? 0), finished: (p.p ?? 0) >= 1,
              };
            });
          });
        }
        if (msg.type === 'LOBBY_COUNTDOWN') setLobbySecs(msg.value);
        if (msg.type === 'RACE_START') {
          setLobbySecs(null);
          setGo(true);
        }
        if (msg.type === 'RACE_END') setPlayers((prev) => [...prev]);
      } catch { /* ignore */ }
    };
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    return () => {
      closed = true;
      try { ws.close(); } catch { /* ignore */ }
      wsRef.current = null;
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, roomCode]);

  const send = useCallback((progress: number, wpm: number, finished: boolean) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const t = performance.now();
    if (t - lastSend.current < 120 && !finished) return;
    lastSend.current = t;
    ws.send(JSON.stringify({
      type: 'PROGRESS',
      payload: { playerId: idRef.current, charIndex: Math.round(progress * 1000), currentWpm: Math.round(wpm), progressPercent: progress, errorState: false, finished },
    }));
    if (finished) ws.send(JSON.stringify({ type: 'FINISH', payload: { playerId: idRef.current } }));
  }, []);

  const startRace = useCallback(() => {
    wsRef.current?.send(JSON.stringify({ type: 'HOST_START', payload: {} }));
  }, []);

  const setDuration = useCallback((minutes: number) => {
    wsRef.current?.send(JSON.stringify({ type: 'SET_DURATION', payload: { minutes } }));
  }, []);

  const setWeather = useCallback((weather: string) => {
    wsRef.current?.send(JSON.stringify({ type: 'SET_WEATHER', payload: { weather } }));
  }, []);

  return { players, connected, lobbySecs, go, myId: idRef.current, hostId, roomStatus, send, startRace, setGo, roomDuration, setDuration, roomWeather, setWeather };
}
