'use client';
import Link from 'next/link';
import VideoHero from './VideoHero';
import { useOnlineCount } from '@/hooks/useOnlineCount';

export default function FinalCTA() {
  const count = useOnlineCount();
  return (
    <section className="film-grain vignette relative flex min-h-[92svh] flex-col justify-center overflow-clip">
      <div className="absolute inset-0">
        <VideoHero src="/videos/racing-night.mp4" />
        <div className="absolute inset-0 bg-void/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-void" />
      </div>
      <div className="relative z-[5] mx-auto w-full max-w-[1440px] px-5 text-center md:px-10">
        <p className="font-mono text-[10px] tracking-[0.45em] text-acid">FINAL CALL // GRID CLOSING</p>
        <h2 className="mx-auto mt-4 font-display leading-[0.86] text-white text-[22vw] md:text-[11rem]">READY<br />TO RACE?</h2>
        <div className="mt-8 flex flex-col items-center gap-4">
          <Link href="/race" className="btn-race btn-primary !px-12 !py-5 !text-sm" data-cursor="ENTER">ENTER THE GRID <span className="arr">→</span></Link>
          <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-white/60">
            <span className={`h-1.5 w-1.5 rounded-full ${count === null ? 'bg-white/25' : 'bg-emerald-400'}`} />
            {count === null ? 'SERVER OFFLINE — SOLO STILL WORKS' : `${count} RACER${count === 1 ? '' : 'S'} ON TRACK`}
          </p>
        </div>
      </div>
    </section>
  );
}
