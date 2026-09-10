'use client';

import { useEffect, useState } from 'react';
import { avatarDefOf, fetchAvatarThumb } from './avatars';

function UploadPlaceholder({ size, ring, light }: { size: number; ring?: string; light?: boolean }) {
  return (
    <span title="Choose avatar" className={`flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-dashed transition hover:scale-105 ${light ? 'border-black/30 bg-black/[0.06] text-black/60 hover:border-black/60 hover:text-black' : 'border-white/30 bg-white/[0.06] text-white/70 hover:border-white/60 hover:text-white'}`}
      style={{ width: size, height: size, border: ring ? `2px solid ${ring}` : undefined }}>
      <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    </span>
  );
}

export default function AvatarImage({ wiki, size = 28, ring, light }: { wiki: string; size?: number; ring?: string; light?: boolean }) {
  const isCustom = !!wiki && (wiki.startsWith('data:') || wiki.startsWith('blob:') || /^https?:\/\//i.test(wiki));
  const def = avatarDefOf(isCustom ? '' : wiki);
  const [src, setSrc] = useState<string | null>(isCustom ? wiki : null);
  useEffect(() => {
    if (!wiki) return;
    if (isCustom) { setSrc(wiki); return; }
    let live = true;
    void fetchAvatarThumb(def.wiki).then((s) => { if (live) setSrc(s); });
    return () => { live = false; };
  }, [def.wiki, wiki, isCustom]);
  if (!wiki) return <UploadPlaceholder size={size} ring={ring} light={light} />;
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={isCustom ? 'Custom logo' : def.name} title="Choose avatar" loading="lazy" referrerPolicy="no-referrer"
      className="shrink-0 cursor-pointer rounded-full object-cover transition hover:scale-105" style={{ width: size, height: size, objectPosition: '50% 18%', border: ring ? `2px solid ${ring}` : undefined, background: '#222' }} />;
  }
  return <UploadPlaceholder size={size} ring={ring} light={light} />;
}
