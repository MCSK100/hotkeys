export type AvatarCategory = 'actors' | 'leaders' | 'heroes';

export type AvatarDef = { id: string; name: string; category: AvatarCategory; wiki: string };

export const AVATAR_CATEGORIES: { id: AvatarCategory; label: string }[] = [
  { id: 'actors', label: 'Tamil Actors' },
  { id: 'leaders', label: 'Leaders' },
  { id: 'heroes', label: 'Heroes' },
];

export const AVATARS: AvatarDef[] = [
  { id: 'vijay', name: 'Vijay', category: 'actors', wiki: 'Vijay_(actor)' },
  { id: 'rajini', name: 'Rajini', category: 'actors', wiki: 'Rajinikanth' },
  { id: 'ajith', name: 'Ajith', category: 'actors', wiki: 'Ajith_Kumar' },
  { id: 'kamal', name: 'Kamal', category: 'actors', wiki: 'Kamal_Haasan' },
  { id: 'vikram', name: 'Vikram', category: 'actors', wiki: 'Vikram_(actor)' },
  { id: 'pradeep', name: 'Pradeep Ranganathan', category: 'actors', wiki: 'Pradeep_Ranganathan' },
  { id: 'dhanush', name: 'Dhanush', category: 'actors', wiki: 'Dhanush' },
  { id: 'stalin', name: 'M.K. Stalin', category: 'leaders', wiki: 'M._K._Stalin' },
  { id: 'modi', name: 'Modi', category: 'leaders', wiki: 'Narendra_Modi' },
  { id: 'edapadi', name: 'Edappadi K. Palaniswami', category: 'leaders', wiki: 'Edappadi_K._Palaniswami' },
  { id: 'kalaignar', name: 'Kalaignar Karunanidhi', category: 'leaders', wiki: 'M._Karunanidhi' },
  { id: 'amitshah', name: 'Amit Shah', category: 'leaders', wiki: 'Amit_Shah' },
  { id: 'hulk', name: 'Hulk', category: 'heroes', wiki: 'Hulk' },
  { id: 'ironman', name: 'Iron Man', category: 'heroes', wiki: 'Iron_Man' },
  { id: 'thor', name: 'Thor', category: 'heroes', wiki: 'Thor_(Marvel_Comics)' },
  { id: 'thanos', name: 'Thanos', category: 'heroes', wiki: 'Thanos' },
  { id: 'cap', name: 'Captain America', category: 'heroes', wiki: 'Captain_America' },
];

const thumbCache = new Map<string, string>();

export function avatarDefOf(wikiOrId: string): AvatarDef {
  return AVATARS.find((a) => a.wiki === wikiOrId || a.id === wikiOrId) ?? AVATARS[0];
}

export async function fetchAvatarThumb(wiki: string): Promise<string | null> {
  const hit = thumbCache.get(wiki);
  if (hit) return hit;
  try {
    const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wiki)}`);
    if (!r.ok) return null;
    const j = await r.json();
    const src = j?.thumbnail?.source ?? j?.originalimage?.source ?? null;
    if (src) thumbCache.set(wiki, src);
    return src;
  } catch {
    return null;
  }
}

export function preloadAvatars() {
  for (const a of AVATARS) void fetchAvatarThumb(a.wiki);
}
