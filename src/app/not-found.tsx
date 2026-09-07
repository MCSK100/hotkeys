import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="film-grain relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-void px-6 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(198,255,0,0.07),transparent_60%)]" />
      <p className="font-mono text-[11px] tracking-[0.45em] text-acid">404 {'//'} OFF TRACK</p>
      <h1 className="mt-4 font-display text-[34vw] leading-[0.85] text-white md:text-[11rem]">
        WRONG <span className="text-stroke">TURN</span>
      </h1>
      <p className="mt-4 max-w-md text-sm leading-6 text-white/60">
        You drifted off the Night Circuit. The checkpoint you are looking for does not exist or the room code expired.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-race btn-primary">BACK TO GRID →</Link>
        <Link href="/race" className="btn-race btn-ghost">START RACING</Link>
      </div>
      <p className="mt-8 font-mono text-[10px] tracking-[0.3em] text-white/35">HK // NIGHT CIRCUIT — SECTOR 404</p>
    </main>
  );
}
