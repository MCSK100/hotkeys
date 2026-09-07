'use client';

import { useEffect, useState } from 'react';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3001';

let socket: WebSocket | null = null;
let count: number | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<(n: number | null) => void>();

function notify(n: number | null) {
  count = n;
  listeners.forEach((fn) => fn(n));
}

function ensure() {
  if (socket || typeof window === 'undefined') return;
  try {
    socket = new WebSocket(WS_URL);
  } catch {
    socket = null;
    return;
  }
  socket.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data as string);
      if (msg.type === 'ONLINE_COUNT' && typeof msg.count === 'number') notify(msg.count);
    } catch { /* ignore */ }
  };
  const dead = () => {
    socket = null;
    notify(null);
    if (listeners.size > 0 && !retryTimer) {
      retryTimer = setTimeout(() => {
        retryTimer = null;
        ensure();
      }, 3000);
    }
  };
  socket.onclose = dead;
  socket.onerror = dead;
}

/** Live site-wide racer count from the race server. Null = server unreachable. */
export function useOnlineCount() {
  const [c, setC] = useState<number | null>(count);
  useEffect(() => {
    listeners.add(setC);
    setC(count);
    ensure();
    return () => {
      listeners.delete(setC);
    };
  }, []);
  return c;
}
