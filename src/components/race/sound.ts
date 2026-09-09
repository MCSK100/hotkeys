let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, dur: number, vol = 0.16, delay = 0) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

/** 2-sec winner celebration: soft applause + triumphant fanfare. */
export function playClaps() {
  const c = ac();
  if (!c) return;
  const now = c.currentTime;
  const playNote = (freq: number, at: number, dur: number, vol: number, type: OscillatorType = 'triangle') => {
    try {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + at);
      g.gain.setValueAtTime(0.0001, now + at);
      g.gain.exponentialRampToValueAtTime(vol, now + at + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, now + at + dur);
      osc.connect(g);
      g.connect(c.destination);
      osc.start(now + at);
      osc.stop(now + at + dur + 0.05);
    } catch { /* ignore */ }
  };
  const clap = (at: number) => {
    try {
      const len = 0.06;
      const buf = c.createBuffer(1, Math.floor(c.sampleRate * len), c.sampleRate);
      const d = buf.getChannelData(0);
      for (let j = 0; j < d.length; j++) d[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / d.length, 2);
      const src = c.createBufferSource();
      src.buffer = buf;
      const f = c.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.value = 1800;
      const g = c.createGain();
      g.gain.setValueAtTime(0.1 + Math.random() * 0.05, now + at);
      g.gain.exponentialRampToValueAtTime(0.001, now + at + len + 0.05);
      src.connect(f);
      f.connect(g);
      g.connect(c.destination);
      src.start(now + at);
    } catch { /* ignore */ }
  };
  for (let i = 0; i < 26; i++) clap((i / 26) * 2 + Math.random() * 0.03);
  playNote(523.25, 0, 0.35, 0.1);
  playNote(659.25, 0.12, 0.35, 0.1);
  playNote(783.99, 0.24, 0.4, 0.12);
  playNote(1046.5, 0.38, 0.7, 0.12);
  playNote(1318.5, 0.55, 0.6, 0.05, 'sine');
}

/** Chat pop notification. */
export function chatPop() {
  tone(950, 0.09, 0.16);
  tone(1400, 0.12, 0.14, 0.07);
}
export function countBeep(n: number) {
  if (n <= 0) return;
  tone(440, 0.14);
}

export function goBeep() {
  tone(880, 0.4, 0.2);
  tone(1320, 0.3, 0.1, 0.05);
}

let revAudio: HTMLAudioElement | null = null;
let revTimer: ReturnType<typeof setTimeout> | null = null;

/** Engine-roar GO sound using the local race-engine clip (auto-stops). */
export function engineRev() {
  try {
    if (!revAudio) {
      revAudio = new Audio('/sounds/race-engine.mp3');
      revAudio.volume = 0.5;
      revAudio.preload = 'auto';
    }
    if (revTimer) clearTimeout(revTimer);
    revAudio.currentTime = 0;
    revAudio.play().catch(() => {});
    revTimer = setTimeout(() => {
      revAudio?.pause();
      if (revAudio) revAudio.currentTime = 0;
    }, 6000);
  } catch { /* audio unavailable */ }
}
