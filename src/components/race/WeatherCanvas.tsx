'use client';

import { useEffect, useRef } from 'react';
import type { WeatherId } from './Track';

type Drop = { x: number; y: number; vy: number; l: number; a: number };
type Flake = { x: number; y: number; r: number; vy: number; ph: number; a: number };
type Mote = { x: number; y: number; r: number; vx: number; a: number; tw: number };

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** Subtle premium weather overlay — soft rain, snow, dust, mist. */
export default function WeatherCanvas({ weather, light }: { weather: WeatherId; light?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const weatherRef = useRef(weather);
  weatherRef.current = weather;
  const lightRef = useRef(light);
  lightRef.current = light;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const drops: Drop[] = Array.from({ length: 70 }, () => ({ x: rand(0, 900), y: rand(0, 400), vy: rand(7, 12), l: rand(8, 16), a: rand(0.06, 0.16) }));
    const flakes: Flake[] = Array.from({ length: 60 }, () => ({ x: rand(0, 900), y: rand(0, 400), r: rand(0.8, 2.2), vy: rand(0.3, 0.9), ph: rand(0, 6.28), a: rand(0.2, 0.55) }));
    const motes: Mote[] = Array.from({ length: 26 }, () => ({ x: rand(0, 900), y: rand(0, 400), r: rand(10, 30), vx: rand(0.15, 0.45), a: rand(0.03, 0.07), tw: rand(0, 6.28) }));

    let t = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      t += 0.016;
      const k = weatherRef.current;
      const lite = lightRef.current;
      const cw = canvas.clientWidth || w;
      const ch = canvas.clientHeight || h;
      ctx.clearRect(0, 0, cw, ch);

      if (k === 'rain') {
        ctx.lineCap = 'round';
        ctx.lineWidth = 1;
        for (const d of drops) {
          d.y += d.vy;
          if (d.x > cw) d.x = 0;
          if (d.y > ch) { d.y = rand(-20, -5); d.x = rand(0, cw); }
          ctx.strokeStyle = lite ? `rgba(80,100,130,${(d.a + 0.08).toFixed(3)})` : `rgba(170,190,220,${d.a.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo((d.x * cw) / 900, (d.y * ch) / 400);
          ctx.lineTo((d.x * cw) / 900 - 1.5, ((d.y - d.l) * ch) / 400);
          ctx.stroke();
        }
      } else if (k === 'mountain') {
        ctx.fillStyle = lite ? '#ffffff' : '#e8eefc';
        for (const f of flakes) {
          f.y += f.vy;
          f.x += Math.sin(t + f.ph) * 0.2;
          if (f.y > 400) { f.y = -5; f.x = rand(0, 900); }
          ctx.globalAlpha = lite ? Math.min(1, f.a + 0.25) : f.a;
          ctx.beginPath();
          ctx.arc((f.x * cw) / 900, (f.y * ch) / 400, f.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      } else if (k === 'desert') {
        for (const m of motes) {
          m.x -= m.vx;
          if (m.x < -40) { m.x = 940; m.y = rand(0, 400); }
          const g = ctx.createRadialGradient((m.x * cw) / 900, (m.y * ch) / 400, 0, (m.x * cw) / 900, (m.y * ch) / 400, m.r);
          g.addColorStop(0, `rgba(220,180,130,${m.a.toFixed(3)})`);
          g.addColorStop(1, 'rgba(220,180,130,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc((m.x * cw) / 900, (m.y * ch) / 400, m.r, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        for (const f of flakes) {
          f.y += f.vy * 0.5;
          f.x += Math.sin(t * 0.7 + f.ph) * 0.25;
          if (f.y > 400) { f.y = -5; f.x = rand(0, 900); }
          ctx.globalAlpha = f.a * 0.5;
          ctx.fillStyle = '#cfe8d4';
          ctx.beginPath();
          ctx.arc((f.x * cw) / 900, (f.y * ch) / 400, Math.min(1.6, f.r), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    };
    raf = requestAnimationFrame(frame);

    const onVis = () => { visible = !document.hidden; };
    document.addEventListener('visibilitychange', onVis);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting && !document.hidden; });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
      io.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 z-[5] h-full w-full" aria-hidden />;
}
