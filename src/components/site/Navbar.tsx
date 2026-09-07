'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useOnlineCount } from '@/hooks/useOnlineCount';

const links = [
  { label: 'Game', href: '#intro' },
  { label: 'Modes', href: '#modes' },
];

function OnlineBadge() {
  const count = useOnlineCount();
  if (count === null) {
    return (
      <span className="hidden items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-white/35 md:flex">
        <span className="inline-block h-1.5 w-1.5 bg-white/25" /> OFFLINE
      </span>
    );
  }
  return (
    <span className="hidden items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-white/60 md:flex">
      <span className="blink inline-block h-1.5 w-1.5 bg-acid" /> {count} ONLINE
    </span>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-[100] transition-all duration-300 ${scrolled ? 'border-b border-white/[0.07] bg-void/85 backdrop-blur-md' : 'bg-transparent'}`}>
        <div className={`mx-auto flex max-w-[1440px] items-center justify-between px-5 md:px-10 transition-all ${scrolled ? 'h-[60px]' : 'h-[76px]'}`}>
          <Link href="/" className="flex items-center gap-3" data-cursor="HOME">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/hotkeyslogo.png" alt="HotKeys" className="h-10 w-auto object-contain" />
          </Link>
          <nav className="hidden items-center gap-8 lg:flex">
            {links.map((l) => (
              <a key={l.label} href={l.href} className="group font-tech text-[13px] font-semibold tracking-[0.26em] text-white/70 hover:text-white">
                {l.label.toUpperCase()}
                <span className="block h-px scale-x-0 bg-acid transition-transform group-hover:scale-x-100" />
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <OnlineBadge />
            <Link href="/race" className="btn-race btn-primary !px-6 !py-2.5 !text-[12px]" data-cursor="ENTER">PLAY →</Link>
            <button onClick={() => setOpen(!open)} aria-label="Menu" className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 border border-white/15 lg:hidden">
              <span className={`h-px w-5 bg-white transition ${open ? 'translate-y-[3.5px] rotate-45' : ''}`} />
              <span className={`h-px w-5 bg-white transition ${open ? '-translate-y-[3.5px] -rotate-45' : ''}`} />
            </button>
          </div>
        </div>
      </header>
      {open && (
        <div className="fixed inset-0 z-[99] bg-void/97 pt-[76px] backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col px-6">
            {links.map((l, i) => (
              <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="flex items-baseline gap-4 border-b border-white/10 py-5">
                <span className="font-mono text-xs text-acid">0{i + 1}</span>
                <span className="font-display text-5xl text-white">{l.label.toUpperCase()}</span>
              </a>
            ))}
            <Link href="/race" onClick={() => setOpen(false)} className="btn-race btn-primary mt-8 justify-center">ENTER THE GRID →</Link>
          </nav>
        </div>
      )}
    </>
  );
}
