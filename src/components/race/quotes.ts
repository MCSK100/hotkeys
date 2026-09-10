export const QUOTES = [
  'The quick brown fox jumps over the lazy dog near the river bank.',
  'A good programmer looks both ways before crossing a one way street.',
  'She sells sea shells by the sea shore but the shells she sells are not real.',
  'In the middle of difficulty lies opportunity waiting for those who seek it.',
  'The early bird catches the worm but the second mouse gets the cheese.',
  'A journey of a thousand miles begins with a single step forward today.',
  'Practice makes progress when you show up every day and do the work.',
  'The best time to plant a tree was twenty years ago and now is second.',
  'Knowledge is power but enthusiasm pulls the switch and lights the room.',
  'Success is not final and failure is not fatal it is courage to continue.',
  'Racing lights flash red then green as engines roar down the straight.',
  'Fast fingers fly across the keys while the crowd holds its breath.',
  'Every keystroke pushes the car forward toward the finish line ahead.',
  'The pit crew watches lap times fall as drivers find their rhythm.',
  'Night rain slicks the track and headlights cut through the mist.',
  'Desert heat shimmers above the asphalt as tires grip the road.',
  'Forest mist curls between tall pines while racers chase the lead.',
  'Snow caps the alpine peaks as the final lap begins at dawn.',
  'A steady rhythm beats raw speed when accuracy keeps you clean.',
  'Champions are made in the last ten seconds of every close race.',
  'Type like the wind and let your car dance across the finish.',
  'Focus on the next word and the speed will follow on its own.',
  'Great drivers stay calm when the pressure rises at the start.',
  'The countdown ends and every racer launches off the line together.',
];

export function randomQuote(exclude?: string) {
  const pool = QUOTES.filter((q) => q !== exclude);
  return pool[Math.floor(Math.random() * pool.length)] ?? QUOTES[0];
}

export function buildLongText(minutes: number, seed = ''): string {
  let h = 0;
  for (const c of seed.toUpperCase()) h = (h * 31 + c.charCodeAt(0)) % 997;
  // Minimum-word paragraphs: short races get a short passage.
  // Solo auto-extends if you out-type it; multiplayer full-text finish counts as a win.
  const CAPS: Record<number, number> = { 3: 120, 5: 180 };
  const targetWords = CAPS[minutes] ?? Math.max(80, minutes * 70);
  const parts: string[] = [];
  let words = 0;
  let i = h % QUOTES.length;
  while (words < targetWords) {
    const q = QUOTES[i % QUOTES.length];
    parts.push(q);
    words += q.split(' ').length;
    i += 1;
  }
  return parts.join(' ');
}

export function sharedTimedText(roomCode: string, minutes: number, round = 0): string {
  return buildLongText(minutes, `room-${roomCode}-r${round}`);
}

export function sharedQuote(roomCode: string, round = 0): string {
  let h = 0;
  for (const c of roomCode.toUpperCase()) h = (h * 31 + c.charCodeAt(0)) % 997;
  const n = QUOTES.length;
  const rot = (h + round * 7 + Math.floor(round / n) * 3) % n;
  const step = 3 + (round % 4);
  const parts = [QUOTES[rot % n], QUOTES[(rot + step) % n], QUOTES[(rot + step * 2 + 1) % n]];
  return parts.join(' ');
}

export type RaceCar = { id: string; name: string; color: string; img: string };

export const CARS: RaceCar[] = [
  { id: 'volt', name: 'VOLT GT', color: '#00E5FF', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&q=60&auto=format&fit=crop' },
  { id: 'ember', name: 'EMBER S', color: '#FF3D2E', img: 'https://images.unsplash.com/photo-1493238792000-8113da705763?w=200&q=60&auto=format&fit=crop' },
  { id: 'ghost', name: 'GHOST X', color: '#e2e8f0', img: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=200&q=60&auto=format&fit=crop' },
  { id: 'storm', name: 'STORM R', color: '#38bdf8', img: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=200&q=60&auto=format&fit=crop' },
  { id: 'venom', name: 'VENOM V', color: '#8b5cf6', img: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=200&q=60&auto=format&fit=crop' },
  { id: 'apex', name: 'APEX M', color: '#f59e0b', img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=200&q=60&auto=format&fit=crop' },
];

export type RaceRecord = { wpm: number; acc: number; date: number };

const KEY = 'hk-race-history-v1';
const LEGACY_KEY = 'ht-race-history-v1';

export function loadHistory(): RaceRecord[] {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY) ?? '[]';
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveResult(wpm: number, acc: number) {
  try {
    const h = loadHistory();
    h.unshift({ wpm: Math.round(wpm), acc: Math.round(acc * 10) / 10, date: Date.now() });
    localStorage.setItem(KEY, JSON.stringify(h.slice(0, 10)));
  } catch { /* ignore */ }
}

export function makeRoomCode() {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}
