'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import VideoHero from './VideoHero';
import { useEngineSound } from '@/hooks/useEngineSound';

function useCount(target: number, run: boolean, dur = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target, dur]);
  return v;
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);
  const speed = useCount(284, started);
  const { enabled, setEnabled, rev } = useEngineSound();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    setStarted(true);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
      tl.to('[data-hero-bg]', { yPercent: 22, scale: 1.18, ease: 'none' }, 0)
        .to('[data-hero-fg]', { yPercent: -30, opacity: 0.15, ease: 'none' }, 0)
        .to('[data-hero-shade]', { opacity: 0.85, ease: 'none' }, 0);
      gsap.from('[data-hero-line]', { y: 90, opacity: 0, duration: 1, stagger: 0.12, ease: 'power4.out', delay: 0.15 });
      gsap.from('[data-hero-fade]', { y: 24, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', delay: 0.7 });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="film-grain vignette relative flex min-h-[100svh] flex-col overflow-clip bg-void">
      <div data-hero-bg className="absolute inset-0 will-change-transform">
        <VideoHero src="/videos/racing-hero.mp4" />
        <div data-hero-shade className="absolute inset-0 bg-void/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-void via-void/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-void/70" />
        <div className="scanbeam" />
      </div>

      <button
        onClick={() => { setEnabled(!enabled); if (!enabled) setTimeout(rev, 50); }}
        aria-label="Toggle engine sound"
        className="absolute right-5 top-[88px] z-[6] flex items-center gap-2 border border-white/15 bg-black/50 px-3 py-2 font-mono text-[9px] tracking-[0.25em] text-white/70 backdrop-blur md:right-10"
      >
        <span className={`inline-block h-1.5 w-1.5 ${enabled ? 'bg-acid' : 'bg-white/30'}`} />
        {enabled ? 'SOUND ON' : 'MUTED'}
      </button>

      <div className="relative z-[5] mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-end px-5 pb-10 pt-[110px] md:px-10 md:pb-14">
        <div data-hero-fg className="will-change-transform">
          <p data-hero-fade className="mb-4 flex items-center gap-3 font-mono text-[10px] tracking-[0.42em] text-acid md:text-[11px]">
            <span className="inline-block h-px w-10 bg-acid" /> {'HOTKEYS // NIGHT CIRCUIT'}
          </p>
          <h1 className="font-display leading-[0.86] text-white">
            <span data-hero-line className="block text-[19vw] md:text-[11.5rem]">OWN THE</span>
            <span data-hero-line className="block text-[19vw] text-stroke md:text-[11.5rem]">STREETS<span className="text-acid" style={{ WebkitTextStroke: '0' }}>.</span></span>
          </h1>
          <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-md">
              <p data-hero-fade className="text-[15px] leading-7 text-white/70">A typing race arena. Every keystroke is throttle — train solo to boost your WPM, then battle real rivals live.</p>
              <div data-hero-fade className="mt-6 flex flex-wrap items-center gap-3">
                <Link href="/race?mode=practice" className="btn-race btn-primary" data-cursor="ENTER">PRACTICE RACE <span className="arr">→</span></Link>
                <Link href="/race?mode=multiplayer" className="btn-race btn-ghost" data-cursor="ENTER">MULTIPLAYER RACE <span className="arr">→</span></Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm sm:grid-cols-4 md:w-[520px]">
              {[
                ['SPEED', `${speed} KM/H`],
                ['POSITION', '02 / 12'],
                ['LAP', '03 / 05'],
                ['BEST', '01:24.823'],
              ].map(([k, val]) => (
                <div key={k} className="bg-black/45 px-4 py-3">
                  <p className="font-mono text-[9px] tracking-[0.3em] text-smoke">{k}</p>
                  <p className="mt-1 font-mono text-[15px] font-bold text-white">{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div data-hero-fade className="mt-8 flex items-center justify-between border-t border-white/10 pt-4 font-mono text-[9px] tracking-[0.3em] text-white/50">
          <span>{'SCROLL // INTRO SEQUENCE'}</span>
          <span className="hidden sm:block">SECTOR — NIGHT CIRCUIT / WET ASPHALT</span>
          <span className="flex items-center gap-2"><span className="blink h-1.5 w-1.5 bg-danger" /> REC</span>
        </div>
      </div>
    </section>
  );
}
