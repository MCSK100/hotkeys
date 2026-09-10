'use client';

import { useEffect, useRef, useState } from 'react';
import { AVATARS, AVATAR_CATEGORIES, preloadAvatars, type AvatarCategory } from './avatars';
import AvatarImage from './AvatarImage';

function fileToLogoDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const S = 128;
        const c = document.createElement('canvas');
        c.width = S; c.height = S;
        const g = c.getContext('2d');
        if (!g) { URL.revokeObjectURL(url); resolve(url); return; }
        const scale = Math.max(S / img.width, S / img.height);
        const w = img.width * scale, h = img.height * scale;
        g.fillStyle = '#222';
        g.fillRect(0, 0, S, S);
        g.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', 0.82));
      } catch (e) { URL.revokeObjectURL(url); reject(e); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')); };
    img.src = url;
  });
}

export default function AvatarPicker({ value, light, onPick, onClose }: {
  value: string; light?: boolean; onPick: (wiki: string) => void; onClose: () => void;
}) {
  const [cat, setCat] = useState<AvatarCategory>('actors');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isCustom = !!value && (value.startsWith('data:') || value.startsWith('blob:') || /^https?:\/\//i.test(value));
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
          <p className="font-game text-[17px] font-bold tracking-wide">🎮 PICK YOUR AVATAR</p>
          <button onClick={onClose} aria-label="Close" className={`rounded-lg border px-2 py-1 text-[12px] ${light ? 'border-black/15' : 'border-white/15'}`}>✕</button>
        </div>
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#C6FF00] bg-gradient-to-r from-[#C6FF00]/20 via-fuchsia-500/20 to-cyan-400/20 px-4 py-3.5 font-game text-[16px] font-bold uppercase tracking-widest text-current shadow-[0_0_18px_rgba(198,255,0,0.35)] transition hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(198,255,0,0.6)] active:scale-[0.98] disabled:opacity-60"
          style={{ animation: 'uploadPulse 1.6s ease-in-out infinite' }}>
          <style>{`@keyframes uploadPulse { 0%,100% { box-shadow: 0 0 12px rgba(198,255,0,.35);} 50% { box-shadow: 0 0 26px rgba(198,255,0,.7);} }`}</style>
          <span className="text-xl">📤</span> {uploading ? 'UPLOADING…' : '⬆ UPLOAD YOUR LOGO'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" aria-label="Upload logo"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (!f) return;
            setUploading(true);
            try {
              const dataUrl = await fileToLogoDataUrl(f);
              onPick(dataUrl); onClose();
            } catch { /* ignore */ }
            setUploading(false);
          }} />
        {isCustom && (
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#C6FF00]/50 bg-[#C6FF00]/10 px-3 py-2">
            <AvatarImage wiki={value} size={32} light={light} />
            <span className="font-game text-[12px] font-bold tracking-wider">✔ YOUR LOGO ACTIVE</span>
          </div>
        )}
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
              <AvatarImage wiki={a.wiki} size={44} light={light} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
