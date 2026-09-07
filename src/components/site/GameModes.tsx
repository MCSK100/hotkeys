'use client';
import Link from 'next/link';
import { useState } from 'react';

const modes = [
  { id: '01', mins: 3, name: '3 MIN SPRINT', desc: 'Quick solo burst. Warm up your fingers and lock a clean rhythm before the real battle.', tag: 'SOLO // SHORT', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=70&auto=format&fit=crop' },
  { id: '02', mins: 5, name: '5 MIN CIRCUIT', desc: 'The classic training lap. Hold speed and accuracy for five full minutes of pressure.', tag: 'SOLO // CLASSIC', img: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=1200&q=70&auto=format&fit=crop' },
  { id: '03', mins: 10, name: '10 MIN ENDURANCE', desc: 'Long-haul focus run. Build stamina and chase your best average WPM.', tag: 'SOLO // PRO', img: 'https://images.unsplash.com/photo-1493238792000-8113da705763?w=1200&q=70&auto=format&fit=crop' },
  { id: '04', mins: 0, name: 'MULTIPLAYER RACE', desc: 'Create a room, invite friends with a link, pick your car and race the same passage live.', tag: 'VS // LIVE', img: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1200&q=70&auto=format&fit=crop' },
];

export default function GameModes() {
  const [active, setActive] = useState(1);
  const m = modes[active];
  return (
    <section id="modes" className="bg-carbon py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.4em] text-acid">{'02 // SOLO TRAINING'}</p>
            <h2 className="mt-2 font-display text-6xl leading-[0.9] text-white md:text-8xl">PICK YOUR TIME<br />TO <span className="text-acid">ENTER THE RACE</span></h2>
          </div>
          <p className="max-w-xs text-sm leading-6 text-white/55">Solo practice is just you and the clock — no bots. 3, 5 or 10 minute typing sprints.</p>
        </div>
        <div className="mt-10 flex flex-col gap-2 md:h-[520px] md:flex-row">
          {modes.map((item, i) => {
            const on = i === active;
            return (
              <button
                key={item.id}
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(i)}
                data-cursor="SELECT"
                className={`group relative overflow-hidden text-left transition-all duration-500 ${on ? 'md:flex-[2.6]' : 'md:flex-[1]'} min-h-[180px] md:min-h-0`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.img} alt="" loading="lazy" className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${on ? 'scale-100 grayscale-0' : 'scale-110 grayscale'}`} />
                <span className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
                <span className={`absolute left-0 top-0 h-full w-[3px] bg-acid transition-opacity ${on ? 'opacity-100' : 'opacity-0'}`} />
                <span className="absolute inset-x-0 top-0 flex items-center justify-between p-5 font-mono text-[10px] tracking-[0.3em] text-white/70">
                  <span>{item.id}</span>{on && <span className="bg-acid px-2 py-1 text-black">ACTIVE</span>}
                </span>
                <span className={`absolute inset-x-0 bottom-0 block p-5 md:p-7 ${on ? '' : 'md:[writing-mode:vertical-rl] md:rotate-180'}`}>
                  <span className={`block font-display leading-none text-white ${on ? 'text-5xl md:text-7xl' : 'text-3xl md:text-4xl'}`}>{item.name}</span>
                  {on && (
                    <span className="mt-3 block max-w-md">
                      <span className="block text-sm leading-6 text-white/70">{item.desc}</span>
                      <span className="mt-3 block font-mono text-[10px] tracking-[0.25em] text-acid">{item.tag}</span>
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {m.mins > 0 ? (
            <Link href={`/race?mode=practice&duration=${m.mins}`} className="btn-race btn-primary" data-cursor="ENTER">
              {`START ${m.mins} MIN PRACTICE`} <span className="arr">→</span>
            </Link>
          ) : (
            <Link href="/race?mode=multiplayer" className="btn-race btn-primary" data-cursor="ENTER">
              CREATE MULTIPLAYER ROOM <span className="arr">→</span>
            </Link>
          )}
          <span className="self-center font-mono text-[10px] tracking-[0.3em] text-white/40">SOLO = YOU ONLY · NO BOTS</span>
        </div>
      </div>
    </section>
  );
}
