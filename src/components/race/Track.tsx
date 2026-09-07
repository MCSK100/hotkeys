'use client';

import Car3D from './Car3D';

export type WeatherId = 'rain' | 'desert' | 'forest' | 'mountain';

export const WEATHER_IDS: WeatherId[] = ['rain', 'desert', 'forest', 'mountain'];

export function isWeather(v: string): v is WeatherId {
  return (WEATHER_IDS as string[]).includes(v);
}

export interface WeatherCfg {
  id: WeatherId;
  name: string;
  sky: string;
  asphalt: [string, string, string];
  dash: string;
  rumbleA: string;
  rumbleB: string;
  sun: string;
  sunGlow: string;
  haze: string;
  far: 'city' | 'dunes' | 'treeline' | 'peaks';
  near: ('lamp' | 'sign' | 'cactus' | 'rock' | 'pine' | 'pineLg')[];
  tint: string;
  // New dynamic effect properties
  roadSheen: number;        // 0-1, wet road reflection intensity
  ambientTemp: number;      // -1 (cool/blue) to 1 (warm/orange)
  cloudSpeed: number;       // 0-1, cloud movement speed
  lightningChance: number;  // 0-1, probability of lightning flash
  fogDensity: number;       // 0-1, atmospheric fog density
  windStrength: number;     // 0-1, wind effect on particles
  depthLayers: number;      // 2-4, number of parallax depth layers
}

export const WEATHERS: Record<WeatherId, WeatherCfg> = {
  rain: {
    id: 'rain', name: 'NEON RAIN',
    sky: 'linear-gradient(180deg,#030509 0%,#0a1226 52%,#101c3a 78%,#0a1226 100%)',
    asphalt: ['#232c42', '#121828', '#090d17'],
    dash: '#d9f99d',
    rumbleA: '#b91c1c', rumbleB: '#e2e8f0',
    sun: '#e2e8f0', sunGlow: 'rgba(226,232,240,.35)',
    haze: 'linear-gradient(180deg, transparent 30%, rgba(120,150,200,.10) 70%, rgba(120,150,200,.16))',
    far: 'city', near: ['lamp', 'sign', 'lamp', 'sign', 'lamp', 'sign', 'lamp', 'sign', 'lamp', 'sign', 'lamp', 'sign'],
    tint: 'linear-gradient(115deg, transparent 20%, rgba(160,200,255,.10) 42%, rgba(160,200,255,.02) 55%, transparent 75%)',
    // Realistic rain properties
    roadSheen: 0.7,           // Wet road reflections
    ambientTemp: -0.4,        // Cool blue tint
    cloudSpeed: 0.3,          // Slow moving clouds
    lightningChance: 0.15,    // Occasional lightning
    fogDensity: 0.4,          // Moderate fog
    windStrength: 0.6,        // Strong wind for rain
    depthLayers: 3,           // Good depth
  },
  desert: {
    id: 'desert', name: 'DUST BOWL',
    sky: 'linear-gradient(180deg,#160b2e 0%,#6d2450 42%,#d9622b 68%,#f2a950 88%,#c96a2e 100%)',
    asphalt: ['#46405a', '#2b2540', '#171324'],
    dash: '#fcd9a0',
    rumbleA: '#f5f5f5', rumbleB: '#b45309',
    sun: '#ffe3b3', sunGlow: 'rgba(255,150,50,.65)',
    haze: 'linear-gradient(180deg, transparent 40%, rgba(242,169,80,.14) 75%, rgba(242,169,80,.20))',
    far: 'dunes', near: ['cactus', 'rock', 'cactus', 'rock', 'cactus', 'rock', 'cactus', 'rock', 'cactus', 'rock', 'cactus', 'rock'],
    tint: 'linear-gradient(180deg, rgba(242,169,80,.10), transparent 45%)',
    // Realistic desert properties
    roadSheen: 0.1,           // Dry dusty road
    ambientTemp: 0.8,         // Warm orange tint
    cloudSpeed: 0.1,          // Almost no clouds
    lightningChance: 0.0,     // No lightning
    fogDensity: 0.2,          // Light dust haze
    windStrength: 0.8,        // Strong wind for dust
    depthLayers: 2,           // Flat desert landscape
  },
  forest: {
    id: 'forest', name: 'PINE FOREST',
    sky: 'linear-gradient(180deg,#010503 0%,#07130c 55%,#0d2415 82%,#07130c 100%)',
    asphalt: ['#1a2129', '#0e1319', '#06090d'],
    dash: '#bbf7d0',
    rumbleA: '#e2e8f0', rumbleB: '#166534',
    sun: '#e2e8f0', sunGlow: 'rgba(226,232,240,.28)',
    haze: 'linear-gradient(180deg, transparent 45%, rgba(180,220,190,.08) 80%, rgba(180,220,190,.13))',
    far: 'treeline', near: ['pine', 'pineLg', 'pine', 'pineLg', 'pine', 'pineLg', 'pine', 'pineLg', 'pine', 'pineLg', 'pine', 'pineLg'],
    tint: 'linear-gradient(180deg, rgba(20,60,35,.14), transparent 50%)',
    // Realistic forest properties
    roadSheen: 0.2,           // Slightly damp forest floor
    ambientTemp: -0.2,        // Cool green tint
    cloudSpeed: 0.15,         // Slow moving mist
    lightningChance: 0.05,    // Rare lightning
    fogDensity: 0.6,          // Dense forest fog
    windStrength: 0.3,        // Gentle wind
    depthLayers: 4,           // Maximum depth for forest
  },
  mountain: {
    id: 'mountain', name: 'SNOW PASS',
    sky: 'linear-gradient(180deg,#040814 0%,#14243f 52%,#33537a 80%,#1c2c4a 100%)',
    asphalt: ['#2b3346', '#171e2e', '#0b0f1a'],
    dash: '#e0f2fe',
    rumbleA: '#ef4444', rumbleB: '#f8fafc',
    sun: '#f8fafc', sunGlow: 'rgba(248,250,252,.4)',
    haze: 'linear-gradient(180deg, transparent 35%, rgba(200,220,245,.12) 72%, rgba(200,220,245,.18))',
    far: 'peaks', near: ['pine', 'rock', 'pineLg', 'rock', 'pine', 'rock', 'pineLg', 'rock', 'pine', 'rock', 'pineLg', 'rock'],
    tint: 'linear-gradient(180deg, rgba(220,235,250,.08), transparent 40%)',
    // Realistic mountain properties
    roadSheen: 0.5,           // Icy/snowy road
    ambientTemp: -0.6,        // Very cold blue tint
    cloudSpeed: 0.4,          // Fast moving clouds
    lightningChance: 0.02,    // Very rare lightning
    fogDensity: 0.5,          // Moderate mountain mist
    windStrength: 0.7,        // Strong mountain wind
    depthLayers: 3,           // Good mountain depth
  },
};

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`;

const SIGN_COLORS = ['#C6FF00', '#22d3ee', '#f0f', '#fb923c'];

function NearItem({ kind, index }: { kind: WeatherCfg['near'][number]; index: number }) {
  const left = { left: `${(index * 100) / 12}%` };
  if (kind === 'pine' || kind === 'pineLg') {
    const s = kind === 'pineLg' ? 1.3 : 0.92;
    return (
      <span className="absolute bottom-[34px]" style={{ ...left, width: 26 * s, height: 50 * s }}>
        <span className="absolute bottom-0 left-1/2 h-[9px] w-[5px] -translate-x-1/2 bg-[#2e2016]" />
        <span className="absolute bottom-[6px] left-0 h-[24px] w-full bg-gradient-to-b from-[#1a6b3c] to-[#0b3d22]" style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }} />
        <span className="absolute bottom-[21px] left-[15%] h-[19px] w-[70%] bg-gradient-to-b from-[#22a355] to-[#0f552f]" style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }} />
      </span>
    );
  }
  if (kind === 'cactus') {
    return (
      <span className="absolute bottom-[34px] h-[44px] w-[22px]" style={left}>
        <span className="absolute bottom-0 left-1/2 h-full w-[9px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#1d4d38] via-[#37946e] to-[#1d4d38]" />
        <span className="absolute bottom-[12px] left-[1px] h-[16px] w-[7px] rounded-full bg-gradient-to-r from-[#1d4d38] to-[#37946e]" />
        <span className="absolute bottom-[20px] right-[1px] h-[19px] w-[7px] rounded-full bg-gradient-to-r from-[#37946e] to-[#1d4d38]" />
      </span>
    );
  }
  if (kind === 'rock') {
    return (
      <span className="absolute bottom-[34px] h-[16px] w-[32px]" style={left}>
        <span className="absolute inset-0 bg-gradient-to-b from-[#4b5468] to-[#202633]" style={{ clipPath: 'polygon(6% 100%, 28% 22%, 60% 0, 88% 38%, 100% 100%)' }} />
      </span>
    );
  }
  if (kind === 'lamp') {
    return (
      <span className="absolute bottom-[34px] h-[56px] w-[20px]" style={left}>
        <span className="absolute bottom-0 left-1/2 h-full w-[3px] -translate-x-1/2 bg-gradient-to-r from-black via-[#334155] to-black" />
        <span className="absolute left-[5px] top-[2px] h-[5px] w-[5px] rounded-full bg-[#fefce8]" style={{ boxShadow: '0 0 9px 3px rgba(254,252,232,.45)' }} />
        <span className="absolute left-[0px] top-[8px] h-[24px] w-[20px]" style={{ background: 'linear-gradient(180deg, rgba(254,252,232,.14), transparent)', clipPath: 'polygon(35% 0, 65% 0, 100% 100%, 0 100%)' }} />
      </span>
    );
  }
  const c = SIGN_COLORS[index % SIGN_COLORS.length];
  return (
    <span className="absolute bottom-[34px] h-[50px] w-[28px]" style={left}>
      <span className="absolute bottom-0 left-1/2 h-[24px] w-[4px] -translate-x-1/2 bg-gradient-to-r from-black via-[#475569] to-black" />
      <span className="absolute left-0 top-0 flex h-[22px] w-full items-center justify-center rounded-[3px] border bg-[#05070c] font-mono text-[9px] font-bold"
        style={{ borderColor: c, color: c, boxShadow: `0 0 8px ${c}55`, textShadow: `0 0 5px ${c}` }}>
        {index % 3 === 0 ? 'HK' : index % 3 === 1 ? '24' : '⚡'}
      </span>
    </span>
  );
}

function FarLayer({ kind, progress }: { kind: WeatherCfg['far']; progress: number }) {
  const shift = `translateX(${(-progress * 42).toFixed(2)}%)`;
  const anim = { transform: shift, transition: 'transform .25s linear' };
  if (kind === 'city') {
    return (
      <div className="absolute inset-x-0 bottom-[36px] top-[26px] overflow-hidden">
        <div className="absolute bottom-0 h-[52px] w-[220%] opacity-90" style={{
          ...anim,
          background: 'repeating-linear-gradient(90deg,#070b16 0 30px,transparent 30px 46px,#090e1c 46px 82px,transparent 82px 100px)',
        }} />
        <div className="absolute bottom-[6px] h-[40px] w-[220%] opacity-30" style={{
          ...anim,
          background: 'repeating-linear-gradient(90deg,transparent 0 12px,rgba(198,255,0,.45) 12px 14px,transparent 14px 40px,rgba(34,211,238,.45) 40px 42px,transparent 42px 76px,rgba(148,163,184,.4) 76px 78px,transparent 78px 110px)',
        }} />
        <div className="absolute bottom-[48px] left-0 h-px w-full bg-slate-400/25" />
      </div>
    );
  }
  if (kind === 'dunes') {
    return (
      <div className="absolute inset-x-0 bottom-[36px] top-[28px] overflow-hidden">
        <div className="absolute bottom-[-26px] left-[-10%] h-[76px] w-[130%] rounded-[50%] bg-[#57284a]" style={{ ...anim }} />
        <div className="absolute bottom-[-38px] left-[-10%] h-[76px] w-[130%] rounded-[50%] bg-[#3a1b3a]" />
      </div>
    );
  }
  if (kind === 'treeline') {
    return (
      <div className="absolute inset-x-0 bottom-[36px] top-[24px] overflow-hidden">
        <div className="absolute bottom-0 h-[58px] w-[220%] opacity-95" style={{
          ...anim,
          background: 'repeating-conic-gradient(from 0deg at 50% 100%, #06130c 0 6deg, #0d2b18 6deg 7deg, transparent 7deg 12deg)',
        }} />
      </div>
    );
  }
  return (
    <div className="absolute inset-x-0 bottom-[36px] top-[22px] overflow-hidden">
      <div className="absolute bottom-0 h-[70px] w-[220%]" style={{
        ...anim,
        background: 'linear-gradient(180deg,#e8f1fc 0%,#93a9cc 20%,#42557a 42%,#1a2540 100%)',
        clipPath: 'polygon(0 100%, 4% 55%, 9% 78%, 15% 30%, 21% 62%, 28% 18%, 35% 60%, 42% 38%, 50% 75%, 57% 25%, 64% 58%, 71% 35%, 78% 70%, 85% 40%, 92% 65%, 100% 50%, 100% 100%)',
      }} />
    </div>
  );
}

export type RaceLaneRacer = {
  id: string; name: string; color: string;
  progress: number; wpm: number; you: boolean; finished: boolean;
};

export function RaceLane({ racer, pos, racing, weather }: { racer: RaceLaneRacer; pos: number; racing: boolean; weather: WeatherCfg }) {
  const p = Math.min(1, Math.max(0, racer.progress));
  const moving = racing && !racer.finished && p > 0;
  const [top, mid, bot] = weather.asphalt;
  
  // Calculate ambient color temperature
  const ambientColor = weather.ambientTemp > 0 
    ? `rgba(255,${Math.round(150 - weather.ambientTemp * 50)},${Math.round(50 - weather.ambientTemp * 30)},${Math.abs(weather.ambientTemp) * 0.08})`
    : `rgba(${Math.round(50 + weather.ambientTemp * 30)},${Math.round(100 + weather.ambientTemp * 50)},255,${Math.abs(weather.ambientTemp) * 0.08})`;
  
  return (
    <div className={`relative h-[100px] overflow-hidden border ${racer.you ? 'border-acid/60' : 'border-white/10'}`} style={{ background: weather.sky }}>
      {/* Ambient color grading overlay */}
      <div className="absolute inset-0 z-[6] pointer-events-none" style={{ background: ambientColor }} />
      {/* celestial + haze */}
      <span className="absolute right-[7%] top-[6px] h-[15px] w-[15px] rounded-full"
        style={{ background: weather.sun, boxShadow: `0 0 22px 7px ${weather.sunGlow}` }} />
      <span className="absolute inset-x-0 top-[24px] h-[26px]" style={{ background: weather.haze }} />
      
      {/* Dynamic clouds */}
      {weather.cloudSpeed > 0 && (
        <div className="absolute inset-x-0 top-[10px] h-[20px] overflow-hidden">
          {[0.2, 0.5, 0.8].map((offset, i) => (
            <div key={i} className="absolute h-[8px] rounded-full bg-white/5" style={{
              left: `${(offset * 100 + (p * weather.cloudSpeed * 50)).toFixed(1)}%`,
              top: `${i * 6}px`,
              width: `${30 + i * 15}px`,
              opacity: 0.3 - i * 0.1,
            }} />
          ))}
        </div>
      )}
      
      {/* Lightning flash for rain */}
      {weather.lightningChance > 0 && (
        <div className="absolute inset-0 bg-white/0" style={{
          animation: `lightning ${3 + weather.lightningChance * 10}s infinite`,
          animationDelay: `${weather.lightningChance * 5}s`,
        }} />
      )}
      
      {/* Atmospheric fog layers */}
      {weather.fogDensity > 0 && (
        <>
          <div className="absolute inset-x-0 bottom-[38px] h-[15px]" style={{
            background: `linear-gradient(180deg, transparent 0%, rgba(200,220,240,${weather.fogDensity * 0.15}) 100%)`,
          }} />
          <div className="absolute inset-x-0 bottom-[53px] h-[10px]" style={{
            background: `linear-gradient(180deg, transparent 0%, rgba(200,220,240,${weather.fogDensity * 0.08}) 100%)`,
          }} />
        </>
      )}
      <FarLayer kind={weather.far} progress={p} />
      {/* near scenery */}
      <div className="absolute inset-y-0 left-0 w-[400%]" style={{ transform: `translateX(${(-p * 75).toFixed(2)}%)`, transition: 'transform .25s linear' }}>
        {weather.near.map((kind, i) => <NearItem key={i} kind={kind} index={i} />)}
      </div>
      {/* road */}
      <div className="absolute inset-x-0 bottom-0" style={{ height: 38 }}>
        <div className="h-[4px] w-full opacity-90" style={{ background: `repeating-linear-gradient(90deg, ${weather.rumbleA} 0 14px, ${weather.rumbleB} 14px 28px)` }} />
        <div className="relative h-[30px] w-full" style={{ background: `linear-gradient(180deg, ${top} 0%, ${mid} 45%, ${bot} 100%)` }}>
          <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: NOISE, backgroundSize: '120px 120px' }} />
          <div className="absolute inset-0" style={{ background: weather.tint }} />
          
          {/* Weather-specific road textures */}
          {weather.roadSheen > 0.3 && (
            <div className="absolute inset-0" style={{
              background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,${weather.roadSheen * 0.15}) 50%, transparent 100%)`,
              backgroundSize: '200px 30px',
              backgroundPositionX: `${(-p * 800).toFixed(0)}px`,
              transition: 'background-position .25s linear',
            }} />
          )}
          
          {/* Road surface details */}
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent 0 2px, rgba(0,0,0,0.03) 2px 4px)`,
            backgroundSize: '4px 30px',
          }} />
          
          <div className="absolute inset-x-0 top-[12px] h-[4px]" style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent 0 26px, ${weather.dash} 26px 48px)`,
            backgroundPositionX: `${(-p * 1800).toFixed(0)}px`,
            transition: 'background-position .25s linear',
            opacity: 0.9,
          }} />
          <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
          
          {/* Wet road reflection for rain */}
          {weather.roadSheen > 0.5 && (
            <div className="absolute inset-0" style={{
              background: `linear-gradient(180deg, transparent 0%, rgba(200,220,255,${weather.roadSheen * 0.1}) 100%)`,
              mixBlendMode: 'overlay',
            }} />
          )}
        </div>
        <div className="h-[4px] w-full opacity-90" style={{ background: `repeating-linear-gradient(90deg, ${weather.rumbleA} 0 14px, ${weather.rumbleB} 14px 28px)` }} />
      </div>
      {/* car — wheels sit on road surface */}
      <span className="absolute bottom-[10px]" style={{ left: `calc(${(p * 80).toFixed(2)}%)`, transition: 'left .25s linear' }}>
        <Car3D color={racer.color} moving={moving} you={racer.you} />
      </span>
      {racer.finished && (
        <span className="absolute right-2 top-9 z-[7] bg-acid px-1.5 py-0.5 font-mono text-[9px] font-bold text-black">FINISH</span>
      )}
      {/* labels */}
      <span className="absolute left-2 top-2 z-[7] flex items-center gap-2">
        <span className={`flex h-6 w-6 items-center justify-center font-display text-sm ${pos === 1 ? 'bg-acid text-black' : 'bg-black/60 text-white/80'}`}>0{pos}</span>
        <span className="bg-black/55 px-2 py-1 font-tech text-[12px] font-bold tracking-[0.08em] text-white backdrop-blur-sm">
          {racer.name} <span className="font-mono text-[10px] font-normal text-white/50">{racer.wpm} WPM</span>
        </span>
      </span>
      <span className="absolute right-2 top-2 z-[7] bg-black/55 px-2 py-1 font-mono text-[11px] text-white/80 backdrop-blur-sm">{Math.round(p * 100)}%</span>
    </div>
  );
}

export function WeatherPicker({ value, onChange, small }: { value: WeatherId; onChange: (w: WeatherId) => void; small?: boolean }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {!small && <span className="mr-1 font-mono text-[10px] tracking-[0.3em] text-smoke">WEATHER</span>}
      {WEATHER_IDS.map((id) => (
        <button key={id} onClick={() => onChange(id)} title={WEATHERS[id].name}
          className={`border font-mono tracking-[0.15em] ${small ? 'px-2.5 py-1.5 text-[10px]' : 'px-4 py-2 text-xs'} ${value === id ? 'border-acid bg-acid/10 text-acid' : 'border-white/15 text-white/60 hover:border-white/40'}`}>
          {WEATHERS[id].name}
        </button>
      ))}
    </span>
  );
}
