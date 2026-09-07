import Link from 'next/link';
import type { ReactNode } from 'react';
import Footer from '@/components/site/Footer';

export default function InfoPage({ kicker, title, intro, children }: { kicker: string; title: ReactNode; intro: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-void text-bone">
      <header className="border-b border-white/[0.07] bg-carbon/80">
        <div className="mx-auto flex h-[60px] max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/hotkeyslogo.png" alt="HotKeys" className="h-9 w-auto object-contain" />
            <span className="font-tech text-sm font-bold tracking-[0.2em]">HOTKEYS</span>
          </Link>
          <Link href="/race" className="btn-race btn-primary !px-5 !py-2 !text-[11px]">ENTER GRID →</Link>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-14">
        <p className="font-mono text-[10px] tracking-[0.4em] text-acid">{kicker}</p>
        <h1 className="mt-3 font-display text-6xl leading-[0.9] md:text-8xl">{title}</h1>
        <p className="mt-5 text-[15px] leading-7 text-white/65">{intro}</p>
        <div className="mt-8 space-y-4 text-[14px] leading-7 text-white/60">{children}</div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/race?mode=practice" className="btn-race btn-primary !py-3">PRACTICE RACE →</Link>
          <Link href="/race?mode=multiplayer" className="btn-race btn-ghost !py-3">MULTIPLAYER RACE</Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
