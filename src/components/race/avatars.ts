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
  { id: 'udhayanidhi', name: 'Udhayanidhi', category: 'leaders', wiki: 'Udhayanidhi_Stalin' },
  { id: 'putin', name: 'Vladimir Putin', category: 'leaders', wiki: 'Vladimir_Putin' },
  { id: 'trump', name: 'Donald Trump', category: 'leaders', wiki: 'Donald_Trump' },
  { id: 'hulk', name: 'Hulk', category: 'heroes', wiki: 'Hulk', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Cosplay%20of%20Hulk%20at%20Brussels%20Comic%20Con%202019%20(33424478778).jpg?width=200' },
  { id: 'ironman', name: 'Iron Man', category: 'heroes', wiki: 'Iron_Man', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Iron%20Man%20Cosplay%20at%202013%20Phoenix%20Comicon.jpg?width=200' },
  { id: 'thor', name: 'Thor', category: 'heroes', wiki: 'Thor_(Marvel_Comics)', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Genderbent%20Thor%20Cosplay%20(14766539893).jpg?width=200' },
  { id: 'thanos', name: 'Thanos', category: 'heroes', wiki: 'Thanos', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Cosplay%20of%20Thanos%20at%20GalaxyCon%20Richmond%202020%20(49666517961).jpg?width=200' },
  { id: 'cap', name: 'Captain America', category: 'heroes', wiki: 'Captain_America', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Cosplay%20of%20Captain%20America%20at%20GalaxyCon%20Richmond%202020%20(49666535606).jpg?width=200' },
  { id: 'superman', name: 'Superman', category: 'heroes', wiki: 'Superman', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Superman%20Cosplay%20at%20NYCC%202017.jpg?width=200' },
  { id: 'spiderman', name: 'Spider-Man', category: 'heroes', wiki: 'Spider-Man', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Asia%20Comic%20Expo%202023%20-%20Spider-Man%20cosplay%201.jpg?width=200' },
  { id: 'batman', name: 'Batman', category: 'heroes', wiki: 'Batman', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Batman%20Cosplay%20at%20NYCC%202017.jpg?width=200' },
  { id: 'heman', name: 'He-Man', category: 'heroes', wiki: 'He-Man', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lucca%20Comics%20%26%20Games%202019%20-%20Cosplay%20He-Man%20and%20Skeletor.jpg?width=200' },
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
