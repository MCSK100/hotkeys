'use client';

import { useEffect, useRef, useState } from 'react';
import { AVATARS, AVATAR_CATEGORIES, preloadAvatars, type AvatarCategory } from './avatars';
import AvatarImage from './AvatarImage';

function fileToLogoDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const S = 128;
        const canvas = document.createElement('canvas');
        canvas.width = S;
        canvas.height = S;
        const ctx = canvas.getContext('2d');
        if (!ctx) { URL.revokeObjectURL(url); reject(new Error('canvas')); return; }
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, S, S);
        ctx.drawImage(img, sx, sy, side, side, 0, 0, S, S);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      } catch (e) { URL.revokeObjectURL(url); reject(e); }
    };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

export default function AvatarPicker({ value, light, onPick, onClose }: {
  value: string; light?: boolean; onPick: (wiki: string) => void; onClose: () => void;
}) {
  const [cat, setCat] = useState<AvatarCategory>('actors');
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
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
        <div className="mt-3 flex gap-1.5">
          {AVATAR_CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${cat === c.id ? (light ? 'bg-black text-white' : 'bg-white text-black') : (light ? 'bg-black/[0.05] text-black/60' : 'bg-white/[0.07] text-white/60')}`}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-dashed px-3 py-2.5">
          <AvatarImage wiki={isCustom ? value : ''} size={40} light={light} />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-bold">Upload your logo</p>
            <p className={`truncate text-[11px] ${light ? 'text-black/55' : 'text-white/55'}`}>PNG / JPG · cropped to circle · stays on this device</p>
          </div>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" aria-label="Upload logo"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (!f) return;
              setUploadErr('');
              setUploading(true);
              try {
                const dataUrl = await fileToLogoDataUrl(f);
                onPick(dataUrl);
                onClose();
              } catch {
                setUploadErr('Could not read that image. Try a PNG or JPG.');
              } finally {
                setUploading(false);
              }
            }} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className={`shrink-0 rounded-full px-3.5 py-2 text-[12px] font-bold transition disabled:opacity-50 ${light ? 'bg-black text-white' : 'bg-white text-black'}`}>
            {uploading ? '…' : isCustom ? 'Change' : 'Upload'}
          </button>
        </div>
        {uploadErr && <p className="mt-1.5 text-[12px] font-bold text-red-500">{uploadErr}</p>}
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
