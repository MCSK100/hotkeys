'use client';
import { useEffect, useRef, useState } from 'react';

type Props = { src: string; className?: string; playbackRate?: number };

export default function VideoHero({ src, className = '', playbackRate = 1 }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.playbackRate = playbackRate;
    const onCanPlay = () => setReady(true);
    v.addEventListener('canplay', onCanPlay);
    const p = v.play();
    if (p) p.catch(() => {});
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) v.pause();
    return () => v.removeEventListener('canplay', onCanPlay);
  }, [playbackRate, src]);

  return (
    <span className="absolute inset-0 block bg-void">
      {!ready && <span className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_50%_40%,#141a24_0%,#050609_70%)]" />}
      <video
        ref={ref}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className={`h-full w-full object-cover ${className}`}
        style={{ opacity: ready ? 1 : 0, transition: 'opacity .6s ease' }}
      >
        <source src={src} type="video/mp4" />
      </video>
    </span>
  );
}
