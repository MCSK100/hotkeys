import Link from 'next/link';

const cols: { h: string; links: { label: string; href: string }[] }[] = [
  {
    h: 'GAME',
    links: [
      { label: 'Solo practice', href: '/race?mode=practice' },
      { label: 'Multiplayer', href: '/race?mode=multiplayer' },
      { label: 'Modes', href: '/#modes' },
      { label: 'How it works', href: '/#intro' },
    ],
  },
  {
    h: 'COMPETE',
    links: [
      { label: 'Tournaments', href: '/tournaments' },
      { label: 'Clans', href: '/clans' },
      { label: 'Fair play', href: '/fair-play' },
    ],
  },
  {
    h: 'STUDIO',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    h: 'PLAY',
    links: [
      { label: 'Enter grid', href: '/race' },
      { label: 'Support', href: '/support' },
      { label: 'Status', href: '/status' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.07] bg-void">
      <div className="mx-auto max-w-[1440px] px-5 pb-6 pt-12 md:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/hotkeyslogo.png" alt="HotKeys" className="h-10 w-auto object-contain" />
            </div>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/50">
              HotKeys Night Circuit turns typing practice into a race. Train solo in 3, 5 and 10 minute sprints, then create a room, invite friends, and battle live on the same passage.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/race?mode=practice" className="btn-race btn-primary !px-5 !py-2.5 !text-[11px]">PRACTICE →</Link>
              <Link href="/race?mode=multiplayer" className="btn-race btn-ghost !px-5 !py-2.5 !text-[11px]">MULTIPLAYER</Link>
            </div>
            <p className="mt-5 inline-flex items-center gap-2 border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 font-mono text-[10px] tracking-[0.25em] text-emerald-300">
              <span className="blink inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" /> ARENA ONLINE
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {cols.map((col) => (
              <div key={col.h}>
                <p className="font-mono text-[10px] tracking-[0.35em] text-acid">{col.h}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}><Link href={l.href} className="text-sm text-white/60 hover:text-white">{l.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-5 font-mono text-[9px] tracking-[0.3em] text-white/35">
          <span>© 2026 HOTKEYS STUDIO — FAN CONCEPT. NOT AFFILIATED WITH NFS / FORZA / GRAN TURISMO.</span>
          <span className="flex gap-5">
            <Link href="/fair-play" className="hover:text-white">FAIR PLAY</Link>
            <Link href="/status" className="hover:text-white">STATUS</Link>
            <Link href="/" className="hover:text-white">TOP ↑</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
