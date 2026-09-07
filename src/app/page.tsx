'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import Navbar from '@/components/site/Navbar';
import Hero from '@/components/site/Hero';
import GameIntro from '@/components/site/GameIntro';
import GameModes from '@/components/site/GameModes';
import SeoContent from '@/components/site/SeoContent';
import FinalCTA from '@/components/site/FinalCTA';
import Footer from '@/components/site/Footer';
import Cursor from '@/components/site/Cursor';

export default function HomePage() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <main className="relative bg-void text-bone">
      <Cursor />
      <Navbar />
      <Hero />
      <GameIntro />
      <GameModes />
      <SeoContent />
      <FinalCTA />
      <Footer />
    </main>
  );
}
