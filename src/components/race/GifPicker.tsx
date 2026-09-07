'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const TENOR_KEY = process.env.NEXT_PUBLIC_TENOR_API_KEY ?? '';

type GifItem = { id: string; url: string; preview: string };

async function fetchGifs(query: string): Promise<GifItem[]> {
  const base = query
    ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${TENOR_KEY}&client_key=hotkeys&limit=12&media_filter=gif,tinygif`
    : `https://tenor.googleapis.com/v2/featured?key=${TENOR_KEY}&client_key=hotkeys&limit=12&media_filter=gif,tinygif`;
  const res = await fetch(base);
  if (!res.ok) throw new Error('gif search failed');
  const json = await res.json();
  return ((json.results ?? []) as Array<{ id: string; media_formats?: Record<string, { url?: string }> }>).map((r) => ({
    id: String(r.id),
    url: r.media_formats?.gif?.url ?? '',
    preview: r.media_formats?.tinygif?.url ?? r.media_formats?.gif?.url ?? '',
  })).filter((g) => g.url);
}

export default function GifPicker({ onPick }: { onPick: (url: string) => void }) {
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState<GifItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (q: string) => {
    if (!TENOR_KEY) return;
    setLoading(true);
    setError(false);
    try {
      setGifs(await fetchGifs(q));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load('');
  }, [load]);

  const onSearch = (v: string) => {
    setQuery(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => load(v.trim()), 400);
  };

  if (!TENOR_KEY) {
    return (
      <p className="border-t border-white/10 px-4 py-3 text-[11px] leading-5 text-white/50">
        GIF search needs a free Tenor API key — add <span className="text-white/80">NEXT_PUBLIC_TENOR_API_KEY</span> to your env and restart.
        Until then, paste any GIF / image link and it plays inline.
      </p>
    );
  }

  return (
    <div className="border-t border-white/10 px-3 py-2">
      <input
        value={query} data-chat="1" onChange={(e) => onSearch(e.target.value)}
        onKeyDown={(e) => e.stopPropagation()} onKeyUp={(e) => e.stopPropagation()}
        placeholder="Search GIFs…"
        className="mb-2 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-1.5 text-[12px] text-white outline-none placeholder:text-white/30 focus:border-white/50"
      />
      {loading && gifs.length === 0 ? (
        <p className="py-3 text-center text-[11px] text-white/40">Loading GIFs…</p>
      ) : error ? (
        <p className="py-3 text-center text-[11px] text-white/40">Couldn't load GIFs. Try again.</p>
      ) : (
        <div className="grid max-h-44 grid-cols-3 gap-1.5 overflow-y-auto">
          {gifs.map((g) => (
            <button key={g.id} onClick={() => onPick(g.url)} className="overflow-hidden rounded-lg hover:opacity-80" title="Send GIF">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.preview} alt="gif option" className="h-16 w-full object-cover" loading="lazy" />
            </button>
          ))}
          {gifs.length === 0 && !loading && (
            <p className="col-span-3 py-3 text-center text-[11px] text-white/40">No GIFs found.</p>
          )}
        </div>
      )}
    </div>
  );
}
