'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

// Local engine ambience (looped hero background sound).
const BGM_URL = '/sounds/race-engine.mp3';

export function useEngineSound() {
  const [enabled, setEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const enabledRef = useRef(true);
  enabledRef.current = enabled;

  const rev = useCallback(() => {
    const a = audioRef.current;
    if (!a || !enabledRef.current) return;
    a.play().catch(() => {});
  }, []);

  useEffect(() => {
    const a = new Audio(BGM_URL);
    a.loop = true;
    a.volume = 0.35;
    a.preload = 'auto';
    audioRef.current = a;
    // Autoplay is blocked until user interacts — try immediately, then on first gesture.
    a.play().catch(() => {});
    const fire = () => a.play().catch(() => {});
    window.addEventListener('pointerdown', fire, { once: true });
    window.addEventListener('keydown', fire, { once: true });
    return () => {
      window.removeEventListener('pointerdown', fire);
      window.removeEventListener('keydown', fire);
      a.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (enabled) a.play().catch(() => {});
    else a.pause();
  }, [enabled]);

  return { enabled, setEnabled, rev };
}
