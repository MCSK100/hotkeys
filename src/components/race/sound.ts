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

/** Race-control beeps: 3-2-1 low, GO high. */
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
