'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import VideoHero from './VideoHero';

export default function GameIntro() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.to('[data-intro-img]', {
        scale: 1.18, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
      });
      gsap.to('[data-intro-title]', {
        xPercent: -6, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
      });
      gsap.from('[data-intro-reveal]', {
        y: 60, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 70%' },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="intro" className="relative overflow-clip bg-void">
      <div className="marquee-track border-y border-white/[0.07] py-3 font-mono text-[10px] tracking-[0.4em] text-white/40">
        {Array.from({ length: 2 }).map((_, k) => (
          <span key={k} className="flex shrink-0">
            {['TYPING SPEED', 'ACCURACY', 'LIVE RACES', 'NO BRAKES'].map((t) => (
              <span key={t} className="mx-8 flex items-center gap-8">{t} <span className="text-acid">{'///'}</span></span>
            ))}
          </span>
        ))}
      </div>
      <div className="mx-auto grid max-w-[1440px] gap-0 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
        <div className="flex flex-col justify-center">
          <p data-intro-reveal className="font-mono text-[10px] tracking-[0.4em] text-acid">{'01 // SPEED LAB'}</p>
          <h2 data-intro-title className="mt-4 font-display text-[15vw] leading-[0.88] text-white sm:text-8xl lg:text-[7rem]">
            SPEED UP<br />YOUR <span className="text-acid">TYPING</span><br /><span className="text-stroke">SPEED.</span>
          </h2>
          <p data-intro-reveal className="mt-6 max-w-md text-[15px] leading-7 text-white/65">
            HotKeys is a racing typing arena. Practice solo against the clock to raise your WPM and accuracy, then take it live — create a room, invite friends, and battle real racers on the same passage.
          </p>
          <p data-intro-reveal className="mt-3 max-w-md text-[14px] leading-7 text-white/45">
            Pick a 3, 5 or 10 minute sprint below for focused training, or jump into multiplayer for head-to-head pressure. Every keystroke moves your car.
          </p>
          <div data-intro-reveal className="mt-8 grid max-w-md grid-cols-3 divide-x divide-white/10 border-y border-white/10">
            {[['3/5/10', 'MIN SPRINTS'], ['LIVE', 'MULTIPLAYER'], ['100%', 'FREE PLAY']].map(([v, l]) => (
              <div key={l} className="px-4 py-4">
                <p className="font-display text-3xl text-white">{v}</p>
                <p className="font-mono text-[9px] tracking-[0.3em] text-smoke">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div data-intro-reveal className="relative mt-10 min-h-[380px] overflow-hidden lg:mt-0 lg:min-h-[560px]">
          <div data-intro-img className="film-grain absolute inset-0">
            <VideoHero src="/videos/racing-night.mp4" />
            <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-transparent to-transparent" />
          </div>
          <div className="absolute left-4 top-4 flex items-center gap-2 bg-black/60 px-3 py-2 font-mono text-[9px] tracking-[0.3em] text-acid backdrop-blur">● SECTOR 03 — LIVE</div>
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <p className="font-mono text-[9px] tracking-[0.3em] text-white/60">TRAINING MODE</p>
              <p className="font-display text-3xl text-white">TYPE · RACE · IMPROVE</p>
            </div>
            <p className="font-mono text-xs text-acid">WPM + ACC</p>
          </div>
        </div>
      </div>
    </section>
  );
}
