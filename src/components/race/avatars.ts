export type AvatarCategory = 'actors' | 'leaders' | 'heroes';

export type AvatarDef = { id: string; name: string; category: AvatarCategory; wiki: string; img?: string };

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
  { id: 'pradeep', name: 'Pradeep Ranganathan', category: 'actors', wiki: 'Pradeep_Ranganathan', img: 'https://media.themoviedb.org/t/p/w300_and_h450_face/yfATc50b77UwlNxz9OrokPYnwRj.jpg' },
  { id: 'dhanush', name: 'Dhanush', category: 'actors', wiki: 'Dhanush' },
  { id: 'suriya', name: 'Suriya', category: 'actors', wiki: 'Suriya' },
  { id: 'stalin', name: 'M.K. Stalin', category: 'leaders', wiki: 'M._K._Stalin' },
  { id: 'modi', name: 'Modi', category: 'leaders', wiki: 'Narendra_Modi' },
  { id: 'edapadi', name: 'Edappadi K. Palaniswami', category: 'leaders', wiki: 'Edappadi_K._Palaniswami' },
  { id: 'kalaignar', name: 'Kalaignar Karunanidhi', category: 'leaders', wiki: 'M._Karunanidhi' },
  { id: 'amitshah', name: 'Amit Shah', category: 'leaders', wiki: 'Amit_Shah' },
  { id: 'seeman', name: 'Seeman', category: 'leaders', wiki: 'Seeman_(politician)' },
  { id: 'annamalai', name: 'Annamalai', category: 'leaders', wiki: 'K._Annamalai' },
  { id: 'udhayanidhi', name: 'Udhayanidhi', category: 'leaders', wiki: 'Udhayanidhi_Stalin' },
  { id: 'putin', name: 'Vladimir Putin', category: 'leaders', wiki: 'Vladimir_Putin' },
  { id: 'trump', name: 'Donald Trump', category: 'leaders', wiki: 'Donald_Trump' },
  { id: 'hulk', name: 'Hulk (Mark Ruffalo)', category: 'heroes', wiki: 'Mark_Ruffalo' },
  { id: 'ironman', name: 'Iron Man (RDJ)', category: 'heroes', wiki: 'Robert_Downey_Jr.' },
  { id: 'thor', name: 'Thor (Hemsworth)', category: 'heroes', wiki: 'Chris_Hemsworth' },
  { id: 'thanos', name: 'Thanos (Brolin)', category: 'heroes', wiki: 'Josh_Brolin' },
  { id: 'cap', name: 'Captain America (Evans)', category: 'heroes', wiki: 'Chris_Evans' },
  { id: 'superman', name: 'Superman (Cavill)', category: 'heroes', wiki: 'Henry_Cavill' },
  { id: 'spiderman', name: 'Spider-Man (Holland)', category: 'heroes', wiki: 'Tom_Holland' },
  { id: 'batman', name: 'Batman (Bale)', category: 'heroes', wiki: 'Christian_Bale' },
  { id: 'heman', name: 'He-Man (Lundgren)', category: 'heroes', wiki: 'Dolph_Lundgren' },
];

const thumbCache = new Map<string, string>();

export function avatarDefOf(wikiOrId: string): AvatarDef {
  return AVATARS.find((a) => a.wiki === wikiOrId || a.id === wikiOrId) ?? AVATARS[0];
}

export async function fetchAvatarThumb(wiki: string): Promise<string | null> {
  const def = avatarDefOf(wiki);
  if (def.img) {
    thumbCache.set(wiki, def.img);
    return def.img;
  }
  const hit = thumbCache.get(wiki);
  if (hit) return hit;
  try {
    const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wiki)}`);
    if (!r.ok) return def.img ?? null;
    const j = await r.json();
    const src = j?.thumbnail?.source ?? j?.originalimage?.source ?? def.img ?? null;
    if (src) thumbCache.set(wiki, src);
    return src;
  } catch {
    return def.img ?? null;
  }
}

export function preloadAvatars() {
  for (const a of AVATARS) void fetchAvatarThumb(a.wiki);
}
