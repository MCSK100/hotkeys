'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { buildLongText, randomQuote } from '@/components/race/quotes';

export type RacePhase = 'lobby' | 'countdown' | 'racing' | 'finished';

export function useTypingEngine() {
  const [text, setText] = useState(() => randomQuote());
  const [charIndex, setCharIndex] = useState(0);
  const [errors, setErrors] = useState<boolean[]>([]);
  const [phase, setPhase] = useState<RacePhase>('lobby');
  const [countdown, setCountdown] = useState(3);
  const [durationSec, setDurationSec] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const startRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const correctRef = useRef(0);
  const typedRef = useRef(0);
  const allowExtendRef = useRef(true);
  const [tick, setTick] = useState(0);

  const resetCounters = () => {
    startRef.current = null;
    endRef.current = null;
    correctRef.current = 0;
    typedRef.current = 0;
    setCorrectChars(0);
  };

  const newRace = useCallback((nextText?: string) => {
    const t = nextText ?? randomQuote(text);
    setText(t);
    setCharIndex(0);
    setErrors([]);
    setDurationSec(0);
    setTimeLeft(0);
    setPhase('countdown');
    setCountdown(3);
    resetCounters();
  }, [text]);

  const practice = useCallback(() => {
    const t = randomQuote(text);
    setText(t);
    setCharIndex(0);
    setErrors([]);
    setDurationSec(0);
    setTimeLeft(0);
    setPhase('racing');
    setCountdown(0);
    resetCounters();
    startRef.current = performance.now();
  }, [text]);

  const startTimed = useCallback((minutes: number, customText?: string, allowExtend = true) => {
    const t = customText ?? buildLongText(minutes);
    allowExtendRef.current = allowExtend;
    setText(t);
    setCharIndex(0);
    setErrors([]);
    setDurationSec(minutes * 60);
    setTimeLeft(minutes * 60);
    setPhase('countdown');
    setCountdown(3);
    resetCounters();
  }, []);

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      setPhase('racing');
      startRef.current = performance.now();
      return;
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, countdown]);

  useEffect(() => {
    if (phase !== 'racing') return;
    const id = setInterval(() => {
      setTick((t) => t + 1);
      if (durationSec > 0) {
        setTimeLeft((tl) => {
          if (tl <= 1) {
            endRef.current = performance.now();
            setPhase('finished');
            return 0;
          }
          return tl - 1;
        });
      }
    }, 1000);
    return () => clearInterval(id);
  }, [phase, durationSec]);

  const typeChar = useCallback((key: string) => {
    if (phase !== 'racing') return false;
    if (key === 'Backspace') {
      if (charIndex === 0) return false;
      const del = charIndex - 1;
      setErrors((prev) => {
        if (!prev[del]) return prev;
        const next = [...prev];
        next[del] = false;
        return next;
      });
      setCharIndex((i) => i - 1);
      return true;
    }
    if (key.length !== 1) return false;
    if (charIndex >= text.length) return false;
    const expected = text[charIndex];
    const correct = key === expected;
    typedRef.current += 1;
    if (correct) {
      correctRef.current += 1;
      setCorrectChars((h) => h + 1);
    }
    setErrors((prev) => {
      const next = [...prev];
      next[charIndex] = !correct;
      return next;
    });
    const nextIdx = charIndex + 1;
    if (durationSec === 0 && nextIdx >= text.length) {
      setCharIndex(nextIdx);
      endRef.current = performance.now();
      setPhase('finished');
      return correct;
    }
    if (durationSec > 0 && nextIdx >= text.length) {
      // Timed text fully typed (multiplayer shared text): crushing it counts as a finish.
      setCharIndex(nextIdx);
      endRef.current = performance.now();
      setPhase('finished');
      return correct;
    }
    if (durationSec > 0 && allowExtendRef.current && nextIdx >= text.length - 200) {
      setText((prev) => prev + ' ' + randomQuote());
    }
    setCharIndex(nextIdx);
    return correct;
  }, [phase, charIndex, text, durationSec]);

  const elapsedMin = (() => {
    if (!startRef.current) return 0;
    const end = phase === 'finished' && endRef.current ? endRef.current : performance.now();
    return Math.max(0, (end - startRef.current) / 60000);
  })();
  void tick;

  const wpm = elapsedMin > 0 ? (correctRef.current / 5) / elapsedMin : 0;
  const raw = elapsedMin > 0 ? (typedRef.current / 5) / elapsedMin : 0;
  const acc = typedRef.current > 0 ? (correctRef.current / typedRef.current) * 100 : 100;
  const progress = durationSec > 0
    ? Math.min(1, elapsedMin / (durationSec / 60))
    : text.length ? charIndex / text.length : 0;
  const typed = text.length ? Math.min(1, charIndex / text.length) : 0;

  return {
    text, charIndex, errors, phase, countdown,
    durationSec, timeLeft, isTimed: durationSec > 0, typed, correctChars,
    wpm: Number.isFinite(wpm) ? wpm : 0,
    raw: Number.isFinite(raw) ? raw : 0,
    acc: Number.isFinite(acc) ? acc : 100,
    progress,
    typeChar, newRace, practice, startTimed,
    setPhase,
  };
}
