'use client';

import { useEffect, useRef } from 'react';
import type { WeatherId } from './Track';

type Drop = { x: number; y: number; vx: number; vy: number; l: number; a: number };
type Flake = { x: number; y: number; r: number; vy: number; ph: number; sw: number; a: number };
type Mote = { x: number; y: number; r: number; vx: number; vy: number; a: number; tw: number };
type Fly = { x: number; y: number; r: number; ph: number; sp: number };

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** Canvas particle weather overlay — rain streaks, snow, dust, fireflies. */
export default function WeatherCanvas({ weather }: { weather: WeatherId }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const weatherRef = useRef(weather);
  weatherRef.current = weather;

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

    const drops: Drop[] = Array.from({ length: 150 }, () => spawnDrop(true));
    const flakes: Flake[] = Array.from({ length: 130 }, () => spawnFlake(true));
    const motes: Mote[] = Array.from({ length: 55 }, () => spawnMote(true));
    const flies: Fly[] = Array.from({ length: 24 }, () => spawnFly(true));

    function spawnDrop(anywhere = false): Drop {
      const v = rand(0, 1);
      const windEffect = rand(-0.5, 0.5); // Wind variation
      return {
        x: rand(0, w + 40), y: anywhere ? rand(0, h) : rand(-30, -10),
        vx: -2.2 - v * 2.2 + windEffect, vy: 9 + v * 8,
        l: 10 + v * 16, a: 0.12 + v * 0.3,
      };
    }
    function spawnFlake(anywhere = false): Flake {
      return {
        x: rand(0, w), y: anywhere ? rand(0, h) : rand(-12, -2),
        r: rand(1, 3), vy: rand(0.5, 1.6), ph: rand(0, Math.PI * 2), sw: rand(0.4, 1.4), a: rand(0.35, 0.9),
      };
    }
    function spawnMote(anywhere = false): Mote {
      return {
        x: anywhere ? rand(0, w) : rand(w * 0.4, w + 60), y: rand(0, h),
        r: rand(14, 42), vx: rand(0.25, 0.8), vy: rand(-0.12, 0.12), a: rand(0.04, 0.1), tw: rand(0, Math.PI * 2),
      };
    }
    function spawnFly(anywhere = false): Fly {
      return { x: rand(0, w), y: anywhere ? rand(0, h) : rand(0, h), r: rand(1.4, 2.6), ph: rand(0, Math.PI * 2), sp: rand(0.4, 1) };
    }

    let t = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      t += 0.016;
      const k = weatherRef.current;
      ctx.clearRect(0, 0, w, h);

      if (k === 'rain') {
        ctx.lineCap = 'round';
        for (const d of drops) {
          d.x += d.vx; d.y += d.vy;
          if (d.y > h + 20 || d.x < -30) Object.assign(d, spawnDrop());
          const inv = 1 / Math.hypot(d.vx, d.vy);
          ctx.strokeStyle = `rgba(174,194,224,${d.a.toFixed(3)})`;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - d.vx * inv * d.l, d.y - d.vy * inv * d.l);
          ctx.stroke();
          
          // Add splash effect at road level
          if (d.y > h - 40 && d.y < h - 30) {
            ctx.strokeStyle = `rgba(174,194,224,${(d.a * 0.3).toFixed(3)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.arc(d.x, d.y, 2 + Math.random() * 2, 0, Math.PI);
            ctx.stroke();
          }
        }
      } else if (k === 'mountain') {
        ctx.fillStyle = '#fff';
        for (const f of flakes) {
          f.y += f.vy; f.x += Math.sin(t * 1.6 + f.ph) * f.sw * 0.4;
          if (f.y > h + 6) Object.assign(f, spawnFlake());
          if (f.x < -6) f.x = w + 4;
          ctx.globalAlpha = f.a;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fill();
          
          // Add subtle shadow under snowflakes
          if (f.r > 2) {
            ctx.fillStyle = `rgba(200,220,240,${(f.a * 0.2).toFixed(3)})`;
            ctx.beginPath();
            ctx.ellipse(f.x, f.y + 1, f.r * 0.8, f.r * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
          }
        }
        ctx.globalAlpha = 1;
      } else if (k === 'desert') {
        for (const m of motes) {
          m.x -= m.vx; m.y += m.vy + Math.sin(t + m.tw) * 0.15;
          if (m.x < -60) Object.assign(m, spawnMote());
          const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r);
          const a = (m.a * (0.7 + 0.3 * Math.sin(t * 1.4 + m.tw))).toFixed(3);
          g.addColorStop(0, `rgba(245,178,92,${a})`);
          g.addColorStop(1, 'rgba(245,178,92,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
          ctx.fill();
          
          // Add dust streaks for movement
          if (m.vx > 0.5) {
            ctx.strokeStyle = `rgba(245,178,92,${(m.a * 0.3).toFixed(3)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(m.x + m.r * 2, m.y + rand(-1, 1));
            ctx.stroke();
          }
        }
      } else {
        for (const f of flies) {
          f.x += Math.sin(t * f.sp + f.ph) * 0.35;
          f.y += Math.cos(t * f.sp * 0.8 + f.ph) * 0.3;
          if (f.x < 0) f.x = w; if (f.x > w) f.x = 0;
          if (f.y < 0) f.y = h; if (f.y > h) f.y = 0;
          const glow = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 2.2 * f.sp + f.ph));
          ctx.fillStyle = `rgba(190,242,100,${(0.85 * glow).toFixed(3)})`;
          ctx.shadowColor = 'rgba(190,242,100,.8)';
          ctx.shadowBlur = 10 * glow;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          
          // Add glow trail for fireflies
          if (glow > 0.7) {
            ctx.fillStyle = `rgba(190,242,100,${(0.1 * glow).toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(f.x - Math.sin(t * f.sp + f.ph) * 2, f.y - Math.cos(t * f.sp * 0.8 + f.ph) * 2, f.r * 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
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
