'use client';

type Props = {
  color: string;
  moving?: boolean;
  you?: boolean;
  size?: 'sm' | 'md';
};

/** Stylized 3D side-view GT race car rendered in pure CSS. */
export default function Car3D({ color, moving = false, you = false, size = 'md' }: Props) {
  const scale = size === 'sm' ? 0.7 : 1;
  return (
    <span
      className="relative block shrink-0"
      style={{ width: 98 * scale, height: 52 * scale }}
      aria-hidden
    >
      <style>{`
        @keyframes wheelspin { to { transform: rotate(360deg); } }
        @keyframes carbob { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-1.6px) rotate(-.35deg); } }
        @keyframes flameflick { 0%,100% { transform: scaleX(1); opacity:.95; } 50% { transform: scaleX(.45); opacity:.4; } }
        @keyframes speedline { 0% { transform: translateX(6px); opacity: 0; } 30% { opacity: .65; } 100% { transform: translateX(-30px); opacity: 0; } }
      `}</style>

      {/* ground shadow + neon underglow */}
      <span
        className="absolute left-[8px] right-[8px] bottom-[1px] h-[9px] rounded-[50%]"
        style={{ background: 'rgba(0,0,0,.62)', boxShadow: you ? `0 0 24px 4px ${color}66` : `0 0 12px 2px ${color}40` }}
      />
      <span
        className="absolute left-[16px] right-[16px] bottom-[3px] h-[4px] rounded-full"
        style={{ background: color, opacity: 0.8, filter: 'blur(4px)' }}
      />

      {/* speed lines */}
      {moving && (
        <>
          {[12, 22, 32].map((top, i) => (
            <span
              key={top}
              className="absolute left-[-4px] h-[2px] w-[20px] rounded-full bg-white/50"
              style={{ top, animation: `speedline .45s linear ${i * 0.15}s infinite` }}
            />
          ))}
        </>
      )}

      {/* headlight beam */}
      <span
        className="absolute top-[19px] left-[76px] h-[7px] w-[32px]"
        style={{
          background: 'linear-gradient(90deg, rgba(255,255,240,.6), transparent)',
          clipPath: 'polygon(0 25%, 100% 0, 100% 100%, 0 75%)',
          opacity: moving ? 1 : 0.3,
        }}
      />
      {/* exhaust flames */}
      <span
        className="absolute top-[33px] left-[-4px] h-[6px] w-[13px] rounded-full"
        style={{
          background: 'linear-gradient(270deg, #7dd3fc, #C6FF00 60%, transparent)',
          transformOrigin: 'right center',
          animation: moving ? 'flameflick .16s linear infinite' : 'none',
          opacity: moving ? 1 : 0,
        }}
      />

      {/* ===== chassis ===== */}
      <span
        className="absolute left-[3px] top-[13px]"
        style={{ width: 88 * scale, height: 26 * scale, animation: moving ? 'carbob .28s ease-in-out infinite' : 'none' }}
      >
        {/* main hull — low nose, high tail */}
        <span
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, color-mix(in srgb, ${color} 82%, white) 0%, ${color} 30%, color-mix(in srgb, ${color} 52%, black) 72%, #04060b 100%)`,
            clipPath: 'polygon(0% 74%, 2% 56%, 10% 50%, 20% 47%, 30% 44%, 36% 18%, 43% 12%, 60% 12%, 69% 32%, 86% 38%, 96% 50%, 100% 62%, 98% 76%, 92% 82%, 8% 84%)',
            filter: 'drop-shadow(0 4px 5px rgba(0,0,0,.6))',
          }}
        />
        {/* top highlight */}
        <span
          className="absolute rounded-full"
          style={{ left: 30 * scale, top: 2.5 * scale, width: 34 * scale, height: 2.5 * scale, background: 'rgba(255,255,255,.5)' }}
        />
        {/* glass canopy */}
        <span
          className="absolute"
          style={{
            left: 37 * scale, top: 1 * scale, width: 25 * scale, height: 12 * scale,
            background: 'linear-gradient(115deg, #f0f9ff 0%, #7d9bbf 30%, #2b3d55 62%, #0b1220 100%)',
            clipPath: 'polygon(14% 100%, 34% 0, 78% 0, 100% 100%)',
            opacity: 0.96,
          }}
        />
        {/* canopy shine streak */}
        <span
          className="absolute rounded-full bg-white/70"
          style={{ left: 46 * scale, top: 2.5 * scale, width: 3 * scale, height: 8 * scale, transform: 'rotate(18deg)' }}
        />
        {/* hood vents */}
        <span className="absolute flex gap-[3px]" style={{ left: 68 * scale, top: 9 * scale }}>
          {[0, 1, 2].map((i) => (
            <span key={i} className="rounded-[1px] bg-black/60" style={{ width: 5 * scale, height: 2.5 * scale }} />
          ))}
        </span>
        {/* side intake */}
        <span
          className="absolute rounded-[2px]"
          style={{ left: 30 * scale, top: 13.5 * scale, width: 12 * scale, height: 6 * scale, background: 'linear-gradient(180deg,#020409,#1a2233)', border: '1px solid rgba(255,255,255,.18)' }}
        />
        {/* door cut + handle */}
        <span className="absolute bg-black/45" style={{ left: 44 * scale, top: 12 * scale, width: 1 * scale, height: 9 * scale }} />
        <span className="absolute rounded-full bg-white/50" style={{ left: 46 * scale, top: 12.5 * scale, width: 5 * scale, height: 1.6 * scale }} />
        {/* number roundel */}
        <span
          className="absolute flex items-center justify-center rounded-full bg-white font-bold text-black"
          style={{ left: 52 * scale, top: 13.5 * scale, width: 10 * scale, height: 10 * scale, fontSize: 7.5 * scale, boxShadow: '0 1px 3px rgba(0,0,0,.5)' }}
        >
          7
        </span>
        {/* GT rear wing */}
        <span className="absolute" style={{ left: -1 * scale, top: -5 * scale, width: 20 * scale, height: 14 * scale }}>
          <span className="absolute rounded-[1px]" style={{ left: 4 * scale, bottom: 0, width: 2.5 * scale, height: 10 * scale, background: 'linear-gradient(180deg,#1f2937,#05070c)' }} />
          <span className="absolute rounded-[1px]" style={{ left: 13 * scale, bottom: 0, width: 2.5 * scale, height: 10 * scale, background: 'linear-gradient(180deg,#1f2937,#05070c)' }} />
          <span
            className="absolute left-0 top-0 h-[5.5px] w-full rounded-[2px]"
            style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${color} 78%, white), color-mix(in srgb, ${color} 42%, black))`, boxShadow: '0 2px 5px rgba(0,0,0,.55)' }}
          />
          <span className="absolute top-[5.5px] h-[4px] w-[3px] rounded-[1px] bg-[#0b0e14]" style={{ left: -1 * scale }} />
          <span className="absolute top-[5.5px] h-[4px] w-[3px] rounded-[1px] bg-[#0b0e14]" style={{ right: -1 * scale }} />
        </span>
        {/* front splitter + canards */}
        <span className="absolute rounded-[1px]" style={{ left: 78 * scale, top: 19.5 * scale, width: 12 * scale, height: 3 * scale, background: 'linear-gradient(180deg,#1f2937,#020409)' }} />
        <span className="absolute rounded-[1px] bg-black/70" style={{ left: 74 * scale, top: 16 * scale, width: 6 * scale, height: 2 * scale, transform: 'rotate(-18deg)' }} />
        {/* headlight + DRL */}
        <span
          className="absolute rounded-full"
          style={{ left: 81 * scale, top: 12.5 * scale, width: 5.5 * scale, height: 4.5 * scale, background: '#fefce8', boxShadow: '0 0 10px 3px rgba(254,252,232,.75)' }}
        />
        <span className="absolute rounded-full bg-white/80" style={{ left: 76 * scale, top: 15.5 * scale, width: 7 * scale, height: 1.6 * scale, boxShadow: '0 0 6px rgba(255,255,255,.6)' }} />
        {/* full-width taillight bar */}
        <span
          className="absolute rounded-full"
          style={{ left: 1 * scale, top: 13 * scale, width: 9 * scale, height: 4 * scale, background: 'linear-gradient(90deg,#7f1d1d,#ef4444)', boxShadow: '0 0 10px 3px rgba(239,68,68,.7)' }}
        />
        {/* wheels with fenders */}
        {([19, 63] as const).map((x) => (
          <span key={x}>
            <span
              className="absolute rounded-t-full bg-black/55"
              style={{ left: (x - 3) * scale, top: 10 * scale, width: 22 * scale, height: 12 * scale, clipPath: 'ellipse(50% 100% at 50% 100%)' }}
            />
            <span
              className="absolute rounded-full"
              style={{
                left: x * scale, top: 13.5 * scale, width: 16 * scale, height: 16 * scale,
                background: 'radial-gradient(circle, #04060b 0 30%, #232b3b 31% 62%, #0a0d14 63% 100%)',
                border: '1px solid rgba(255,255,255,.32)',
                boxShadow: '0 3px 6px rgba(0,0,0,.65)',
              }}
            >
              <span
                className="absolute rounded-full"
                style={{
                  inset: 3 * scale,
                  background: 'conic-gradient(#e2e8f0 0 14%, #0b0e14 0 34%, #e2e8f0 0 54%, #0b0e14 0 74%, #e2e8f0 0)',
                  animation: moving ? 'wheelspin .32s linear infinite' : 'none',
                }}
              />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ width: 4.5 * scale, height: 4.5 * scale, background: color, boxShadow: `0 0 6px ${color}` }} />
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}
