'use client';

import { useEffect } from 'react';
import Car3D from './Car3D';
import AvatarImage from './AvatarImage';
import { playClaps } from './sound';

export type PodiumRacer = {
  id: string; name: string; color: string; carId: string; avatar?: string;
  progress: number; wpm: number; acc: number; you: boolean; finished: boolean;
};

function badge(i: number) {
  if (i === 0) return { label: '1st', cls: 'bg-amber-400 text-black', icon: '🥇' };
  if (i === 1) return { label: '2nd', cls: 'bg-slate-300 text-black', icon: '🥈' };
  if (i === 2) return { label: '3rd', cls: 'bg-orange-400 text-black', icon: '🥉' };
  return { label: `${i + 1}th`, cls: 'bg-white/10 text-white/70', icon: '' };
}

export default function WinnerModal({ racers, allFinished, light, soundOn, onClose }: {
  racers: PodiumRacer[]; allFinished: boolean; light?: boolean; soundOn: boolean; onClose: () => void;
}) {
  const sorted = [...racers].sort((a, b) => b.progress - a.progress || b.wpm - a.wpm);
  const winner = sorted[0];

  useEffect(() => {
    if (soundOn) playClaps();
  }, [soundOn]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Race winner">
      <style>{`
        @keyframes winnerSpin { 0% { transform: rotateY(-18deg) scale(1.4); } 50% { transform: rotateY(18deg) scale(1.55); } 100% { transform: rotateY(-18deg) scale(1.4); } }
        @keyframes cupBounce { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-8px) scale(1.06); } }
        @keyframes confettiFall { 0% { transform: translateY(-10px) rotate(0deg); opacity:1; } 100% { transform: translateY(220px) rotate(540deg); opacity:0; } }
        @keyframes modalPop { 0% { transform: scale(.85) translateY(12px); opacity:0; } 100% { transform: scale(1) translateY(0); opacity:1; } }
      `}</style>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl ${light ? 'border-black/10 bg-white text-black' : 'border-white/15 bg-[#0d1119] text-white'}`} style={{ animation: 'modalPop .25s ease-out' }}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 overflow-hidden">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} className="absolute top-0 h-2 w-1.5 rounded-[1px]" style={{
              left: `${(i * 41) % 100}%`,
              background: ['#f43f5e', '#22c55e', '#f59e0b', '#38bdf8', '#a78bfa'][i % 5],
              animation: `confettiFall ${1.4 + (i % 5) * 0.25}s linear ${((i * 97) % 800) / 1000}s infinite`,
            }} />
          ))}
        </div>
        <div className="relative p-6 text-center">
          <div className="text-6xl" style={{ animation: 'cupBounce 1.2s ease-in-out infinite' }}>🏆</div>
          <div className="mt-2 flex justify-center">{winner.avatar ? <AvatarImage wiki={winner.avatar} size={56} ring="#f59e0b" /> : null}</div>
          <p className={`mt-2 text-[11px] font-bold uppercase tracking-[0.2em] ${light ? 'text-black/50' : 'text-white/50'}`}>{allFinished ? 'Race complete · Winner' : 'First to finish · Winner'}</p>
          <h2 className="mt-1 truncate text-3xl font-extrabold tracking-tight">{winner.name}</h2>
          <p className={`mt-1 text-[12px] font-medium tabular-nums ${light ? 'text-black/60' : 'text-white/60'}`}>{winner.wpm} WPM · {Math.round(winner.acc)}% acc · {Math.round(winner.progress * 100)}%</p>
          <div className="mx-auto mt-3 flex justify-center" style={{ perspective: 600 }}>
            <div style={{ animation: 'winnerSpin 2.2s ease-in-out infinite', transformStyle: 'preserve-3d' }}>
              <Car3D color={winner.color} moving you={winner.you} />
            </div>
          </div>
          {!allFinished && (
            <p className={`mt-2 rounded-xl px-3 py-2 text-[11px] font-medium ${light ? 'bg-amber-500/15 text-amber-700' : 'bg-amber-500/15 text-amber-300'}`}>Waiting for others to finish…</p>
          )}
          <div className="mt-4 overflow-hidden rounded-2xl border text-left text-[12px] max-h-56 overflow-y-auto" style={{ borderColor: light ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.1)' }}>
            {sorted.map((r, i) => {
              const b = badge(i);
              return (
                <div key={r.id} className={`flex items-center gap-2 px-3 py-2 ${i !== 0 ? (light ? 'border-t border-black/10' : 'border-t border-white/10') : ''} ${r.you ? (light ? 'bg-black/[0.04]' : 'bg-white/[0.06]') : ''}`}>
                  <span className={`flex min-w-[52px] items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${b.cls}`}><span>{b.icon}</span>{b.label}</span>
                  {r.avatar ? <AvatarImage wiki={r.avatar} size={24} /> : null}
                  <span className="min-w-0 flex-1 truncate font-semibold">{r.name}{r.you ? ' · YOU' : ''}</span>
                  <span className={`tabular-nums ${light ? 'text-black/60' : 'text-white/60'}`}>{r.wpm} wpm</span>
                  <span className={`w-14 text-right tabular-nums font-semibold ${r.acc >= 95 ? 'text-emerald-500' : r.acc >= 85 ? 'text-amber-500' : 'text-red-500'}`}>{Math.round(r.acc)}%</span>
                </div>
              );
            })}
          </div>
          <button onClick={onClose} className={`mt-4 w-full rounded-xl px-5 py-2.5 text-[13px] font-semibold transition ${light ? 'bg-black text-white hover:bg-black/80' : 'bg-white text-black hover:bg-gray-200'}`}>Close ✕</button>
        </div>
      </div>
    </div>
  );
}
