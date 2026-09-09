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
  { id: 'vikram', name: 'Vikram', category: 'actors', wiki: 'Vikram_(actor)', img: 'https://media.themoviedb.org/t/p/w600_and_h900_face/o11aBHj4gFkTPgh6zsLHPq67b0b.jpg' },
  { id: 'pradeep', name: 'Pradeep Ranganathan', category: 'actors', wiki: 'Pradeep_Ranganathan', img: 'https://media.themoviedb.org/t/p/w600_and_h900_face/9xihfKNyRbDtiV6p2iB1FRcNdNL.jpg' },
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
  { id: 'hulk', name: 'Hulk', category: 'heroes', wiki: 'Hulk' },
  { id: 'ironman', name: 'Iron Man', category: 'heroes', wiki: 'Iron_Man' },
  { id: 'thor', name: 'Thor', category: 'heroes', wiki: 'Thor_(Marvel_Comics)' },
  { id: 'thanos', name: 'Thanos', category: 'heroes', wiki: 'Thanos' },
  { id: 'cap', name: 'Captain America', category: 'heroes', wiki: 'Captain_America' },
  { id: 'superman', name: 'Superman', category: 'heroes', wiki: 'Superman' },
  { id: 'spiderman', name: 'Spider-Man', category: 'heroes', wiki: 'Spider-Man' },
  { id: 'batman', name: 'Batman', category: 'heroes', wiki: 'Batman' },
  { id: 'heman', name: 'He-Man', category: 'heroes', wiki: 'He-Man' },
];

const LEGACY_WIKI: Record<string, string> = {
  Mark_Ruffalo: 'Hulk',
  Robert_Downey_Jr: 'Iron_Man',
  'Robert_Downey_Jr.': 'Iron_Man',
  Chris_Hemsworth: 'Thor_(Marvel_Comics)',
  Josh_Brolin: 'Thanos',
  Chris_Evans: 'Captain_America',
  Henry_Cavill: 'Superman',
  Tom_Holland: 'Spider-Man',
  Christian_Bale: 'Batman',
  Dolph_Lundgren: 'He-Man',
};

const thumbCache = new Map<string, string>();

export function avatarDefOf(wikiOrId: string): AvatarDef {
  const mapped = LEGACY_WIKI[wikiOrId];
  const key = mapped ?? wikiOrId;
  return AVATARS.find((a) => a.wiki === key || a.id === key) ?? AVATARS[0];
}

async function fetchWikiMediaArt(wiki: string): Promise<string | null> {
  try {
    const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(wiki)}`);
    if (!r.ok) return null;
    const j = await r.json();
    const item = Array.isArray(j?.items) ? j.items.find((it: { type: string }) => it?.type === 'image') : null;
    const set = item?.srcset;
    const src = Array.isArray(set) && set.length > 0 ? set[set.length - 1]?.src ?? set[0]?.src : null;
    if (!src) return null;
    return src.startsWith('http') ? src : `https:${src}`;
  } catch {
    return null;
  }
}

function upscaleWikiThumb(src: string, width: number): string {
  if (!src.includes('/thumb/')) return src;
  return src.replace(/\/\d+px-/, `/${width}px-`);
}

export async function fetchAvatarThumb(wiki: string): Promise<string | null> {
  const def = avatarDefOf(wiki);
  if (def.img) {
    thumbCache.set(def.wiki, def.img);
    return def.img;
  }
  const hit = thumbCache.get(def.wiki);
  if (hit) return hit;
  try {
    const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(def.wiki)}`);
    if (r.ok) {
      const j = await r.json();
      const t = j?.thumbnail;
      const o = j?.originalimage;
      let src: string | null = null;
      if (o?.source && o.width && o.width <= 640) {
        src = o.source;
      } else if (t?.source) {
        const target = Math.min(640, o?.width ?? t?.width ?? 320);
        src = upscaleWikiThumb(t.source, target);
      } else if (o?.source) {
        src = o.source;
      }
      if (src) {
        thumbCache.set(def.wiki, src);
        return src;
      }
    }
  } catch { /* fall through to media-list */ }
  const art = await fetchWikiMediaArt(def.wiki);
  if (art) {
    thumbCache.set(def.wiki, art);
    return art;
  }
  return null;
}

export function preloadAvatars() {
  for (const a of AVATARS) void fetchAvatarThumb(a.wiki);
}
