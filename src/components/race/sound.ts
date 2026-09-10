let ctx: AudioContext | null = null;
let soundEnabled = true;

export function setSoundEnabled(v: boolean) {
  soundEnabled = v;
  if (!v) {
    try { revAudio?.pause(); } catch { /* ignore */ }
    try { if (cheerAudio) cheerAudio.pause(); } catch { /* ignore */ }
    try { if (ctx && ctx.state === 'running') void ctx.suspend(); } catch { /* ignore */ }
  } else {
    try { if (ctx && ctx.state === 'suspended') void ctx.resume(); } catch { /* ignore */ }
  }
}

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
  if (!soundEnabled) return;
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

let cheerAudio: HTMLAudioElement | null = null;

/** Winner crowd cheer clip. */
export function playClaps() {
  if (!soundEnabled) return;
  try {
    if (!cheerAudio) {
      cheerAudio = new Audio('/dragon-studio-crowd-cheer-406646.mp3');
      cheerAudio.volume = 0.6;
      cheerAudio.preload = 'auto';
    }
    cheerAudio.currentTime = 0;
    cheerAudio.play().catch(() => {});
  } catch { /* audio unavailable */ }
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
  if (!soundEnabled) return;
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
