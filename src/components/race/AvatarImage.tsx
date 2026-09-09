'use client';

import { useEffect, useState } from 'react';
import { avatarDefOf, fetchAvatarThumb } from './avatars';

export default function AvatarImage({ wiki, size = 28, ring }: { wiki: string; size?: number; ring?: string }) {
  const def = avatarDefOf(wiki);
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    void fetchAvatarThumb(def.wiki).then((s) => { if (live) setSrc(s); });
    return () => { live = false; };
  }, [def.wiki]);
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={def.name} title={def.name} loading="lazy" referrerPolicy="no-referrer"
      className="shrink-0 rounded-full object-cover" style={{ width: size, height: size, objectPosition: '50% 18%', border: ring ? `2px solid ${ring}` : undefined, background: '#222' }} />;
  }
  return (
    <span title={def.name} className="flex shrink-0 items-center justify-center rounded-full bg-white/15 text-[11px] font-bold text-white"
      style={{ width: size, height: size, border: ring ? `2px solid ${ring}` : undefined }}>
      {def.name.slice(0, 1)}
    </span>
  );
}
