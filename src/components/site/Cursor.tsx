'use client';
import { useEffect, useState } from 'react';

export default function Cursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [label, setLabel] = useState('');
  const [hover, setHover] = useState(false);
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    setFine(mq.matches);
    if (!mq.matches) return;
    document.documentElement.classList.add('cursor-none-fine');
    let raf = 0;
    let tx = -100, ty = -100, cx = -100, cy = -100;
    const move = (e: MouseEvent) => {
      tx = e.clientX; ty = e.clientY;
      const t = (e.target as HTMLElement)?.closest?.('[data-cursor]');
      setLabel(t?.getAttribute('data-cursor') || '');
      setHover(!!(e.target as HTMLElement)?.closest?.('a,button,[data-cursor]'));
    };
    const loop = () => {
      cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22;
      setPos({ x: cx, y: cy });
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('mousemove', move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('cursor-none-fine');
    };
  }, []);

  if (!fine) return null;
  return (
    <div id="race-cursor" className="pointer-events-none fixed left-0 top-0 z-[200]" style={{ transform: `translate(${pos.x}px,${pos.y}px)` }}>
      <div className="-translate-x-1/2 -translate-y-1/2">
        <div className={`flex items-center justify-center rounded-full border transition-all duration-200 ${label || hover ? 'h-16 w-16 border-acid/80 bg-black/60 backdrop-blur' : 'h-2 w-2 border-transparent bg-acid'}`}>
          {label ? (
            <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-acid">{label}</span>
          ) : hover ? (
            <span className="block h-8 w-8 rounded-full border border-white/30" />
          ) : null}
        </div>
      </div>
    </div>
  );
}
