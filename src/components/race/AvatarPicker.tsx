'use client';

import { useEffect, useState } from 'react';
import { AVATARS, AVATAR_CATEGORIES, preloadAvatars, type AvatarCategory } from './avatars';
import AvatarImage from './AvatarImage';

export default function AvatarPicker({ value, light, onPick, onClose }: {
  value: string; light?: boolean; onPick: (wiki: string) => void; onClose: () => void;
}) {
  const [cat, setCat] = useState<AvatarCategory>('actors');
  useEffect(() => { preloadAvatars(); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const list = AVATARS.filter((a) => a.category === cat);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Choose avatar">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-sm rounded-2xl border p-4 shadow-2xl ${light ? 'border-black/10 bg-white text-black' : 'border-white/15 bg-[#0d1119] text-white'}`}>
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-bold">Pick your avatar</p>
          <button onClick={onClose} aria-label="Close" className={`rounded-lg border px-2 py-1 text-[12px] ${light ? 'border-black/15' : 'border-white/15'}`}>✕</button>
        </div>
        <div className="mt-3 flex gap-1.5">
          {AVATAR_CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${cat === c.id ? (light ? 'bg-black text-white' : 'bg-white text-black') : (light ? 'bg-black/[0.05] text-black/60' : 'bg-white/[0.07] text-white/60')}`}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="mt-3 grid max-h-72 grid-cols-4 gap-2 overflow-y-auto">
          {list.map((a) => (
            <button key={a.id} onClick={() => { onPick(a.wiki); onClose(); }} title={a.name}
              className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition ${value === a.wiki ? (light ? 'border-black bg-black/[0.04]' : 'border-white bg-white/10') : (light ? 'border-black/10 hover:border-black/40' : 'border-white/10 hover:border-white/40')}`}>
              <AvatarImage wiki={a.wiki} size={44} />
              <span className="w-full truncate text-center text-[10px] font-semibold leading-tight">{a.name}</span>
            </button>
          ))}
        </div>
        <p className={`mt-2 text-[10px] ${light ? 'text-black/45' : 'text-white/45'}`}>Photos load live from Wikipedia.</p>
      </div>
    </div>
  );
}
