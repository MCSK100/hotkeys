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

/** 2-sec crowd claps for winner modal (synthesized noise bursts). */
export function playClaps() {
  const c = ac();
  if (!c) return;
  const dur = 2;
  const bursts = 14;
  for (let i = 0; i < bursts; i++) {
    const t = c.currentTime + (i / bursts) * dur + Math.random() * 0.05;
    const len = 0.09;
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * len), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let j = 0; j < d.length; j++) d[j] = (Math.random() * 2 - 1) * (1 - j / d.length);
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 1600 + Math.random() * 1200;
    const g = c.createGain();
    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + len + 0.08);
    src.connect(f);
    f.connect(g);
    g.connect(c.destination);
    src.start(t);
  }
  tone(523, 0.5, 0.08, 0);
  tone(659, 0.5, 0.08, 0.12);
  tone(784, 0.8, 0.1, 0.24);
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
