'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Grid } from '@giphy/react-components';
import { GiphyFetch } from '@giphy/js-fetch-api';
import type { IGif } from '@giphy/js-types';

const KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY ?? '';

export default function GifPicker({ onPick, light }: { onPick: (url: string) => void; light?: boolean }) {
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');

  const gf = useMemo(() => (KEY ? new GiphyFetch(KEY) : null), []);

  useEffect(() => {
    const id = setTimeout(() => setSearch(query.trim()), 400);
    return () => clearTimeout(id);
  }, [query]);

  const fetchGifs = useCallback(
    (offset: number) => {
      if (!gf) return Promise.resolve({ data: [], pagination: { total_count: 0, count: 0, offset }, meta: { status: 200, msg: 'OK', response_id: '' } });
      return search ? gf.search(search, { offset, limit: 10 }) : gf.trending({ offset, limit: 10 });
    },
    [gf, search]
  );

  const onGifClick = useCallback(
    (gif: IGif, e: React.SyntheticEvent) => {
      e.preventDefault();
      onPick(gif.images?.original?.url ?? gif.images?.fixed_height?.url ?? gif.url);
    },
    [onPick]
  );

  if (!KEY) {
    return (
      <p className={`border-t px-4 py-3 text-[11px] leading-5 ${light ? 'border-black/10 text-black/50' : 'border-white/10 text-white/50'}`}>
        GIF search needs a Giphy API key — add <span className={light ? 'text-black/80' : 'text-white/80'}>NEXT_PUBLIC_GIPHY_API_KEY</span> to your env and restart.
        Until then, paste any GIF / image link and it plays inline.
      </p>
    );
  }

  return (
    <div className={`border-t px-3 py-2 ${light ? 'border-black/10' : 'border-white/10'}`}>
      <input
        value={query} data-chat="1" onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.stopPropagation()} onKeyUp={(e) => e.stopPropagation()}
        placeholder="Search GIFs…"
        className={`mb-2 w-full rounded-lg border px-3 py-1.5 text-[12px] outline-none ${light ? 'border-black/15 bg-black/[0.03] text-black placeholder:text-black/30 focus:border-black/50' : 'border-white/15 bg-black/40 text-white placeholder:text-white/30 focus:border-white/50'}`}
      />
      <div className="max-h-48 overflow-y-auto">
        <Grid
          key={search}
          width={282}
          columns={2}
          gutter={6}
          fetchGifs={fetchGifs}
          onGifClick={onGifClick}
          noResultsMessage="No GIFs found."
        />
      </div>
    </div>
  );
}
