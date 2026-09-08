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
  sub: string;
  sky: string;
  ground: string;
  silhouette: string;
  accent: string;
  far: 'city' | 'dunes' | 'treeline' | 'peaks';
  near: ('lamp' | 'pine' | 'rock' | 'cactus')[];
}

export const WEATHERS: Record<WeatherId, WeatherCfg> = {
  rain: {
    id: 'rain', name: 'Overcast', sub: 'Light rain',
    sky: 'linear-gradient(180deg,#0d1320 0%,#141c2e 60%,#1a2438 100%)',
    ground: '#0e1420',
    silhouette: '#1e2a44',
    accent: '#93a4c4',
    far: 'city', near: ['lamp', 'lamp', 'lamp', 'lamp', 'lamp', 'lamp', 'lamp', 'lamp', 'lamp', 'lamp', 'lamp', 'lamp'],
  },
  desert: {
    id: 'desert', name: 'Golden Hour', sub: 'Dry & clear',
    sky: 'linear-gradient(180deg,#16120e 0%,#221a13 60%,#2e2318 100%)',
    ground: '#191410',
    silhouette: '#2e241a',
    accent: '#c9a87a',
    far: 'dunes', near: ['cactus', 'rock', 'cactus', 'rock', 'cactus', 'rock', 'cactus', 'rock', 'cactus', 'rock', 'cactus', 'rock'],
  },
  forest: {
    id: 'forest', name: 'Forest', sub: 'Cool mist',
    sky: 'linear-gradient(180deg,#0b1410 0%,#122019 60%,#182b21 100%)',
    ground: '#0e1713',
    silhouette: '#1d3327',
    accent: '#7ba48e',
    far: 'treeline', near: ['pine', 'pine', 'rock', 'pine', 'pine', 'rock', 'pine', 'pine', 'rock', 'pine', 'pine', 'rock'],
  },
  mountain: {
    id: 'mountain', name: 'Alpine', sub: 'Light snow',
    sky: 'linear-gradient(180deg,#0c1322 0%,#16213a 60%,#203252 100%)',
    ground: '#101827',
    silhouette: '#2a3d63',
    accent: '#a9c0e8',
    far: 'peaks', near: ['pine', 'rock', 'pine', 'rock', 'pine', 'rock', 'pine', 'rock', 'pine', 'rock', 'pine', 'rock'],
  },
};

function NearItem({ kind, index }: { kind: WeatherCfg['near'][number]; index: number }) {
  const left = { left: `${(index * 100) / 12}%` };
  if (kind === 'pine') {
    return (
      <span className="absolute bottom-[38px] opacity-70" style={{ ...left, width: 22, height: 42 }}>
        <span className="absolute bottom-0 left-1/2 h-[8px] w-[4px] -translate-x-1/2 bg-[#241d14]" />
        <span className="absolute bottom-[6px] left-0 h-[20px] w-full bg-[#1d3a2a]" style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }} />
        <span className="absolute bottom-[19px] left-[16%] h-[15px] w-[68%] bg-[#26492f]" style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }} />
      </span>
    );
  }
  if (kind === 'cactus') {
    return (
      <span className="absolute bottom-[38px] h-[36px] w-[18px] opacity-60" style={left}>
        <span className="absolute bottom-0 left-1/2 h-full w-[8px] -translate-x-1/2 rounded-full bg-[#2c4a3a]" />
      </span>
    );
  }
  if (kind === 'rock') {
    return (
      <span className="absolute bottom-[38px] h-[12px] w-[26px] opacity-50" style={left}>
        <span className="absolute inset-0 bg-[#2a3140]" style={{ clipPath: 'polygon(8% 100%, 30% 25%, 62% 0, 90% 40%, 100% 100%)' }} />
      </span>
    );
  }
  return (
    <span className="absolute bottom-[38px] h-[48px] w-[16px] opacity-60" style={left}>
      <span className="absolute bottom-0 left-1/2 h-full w-[2px] -translate-x-1/2 bg-[#2a3342]" />
      <span className="absolute left-1/2 top-[2px] h-[4px] w-[4px] -translate-x-1/2 rounded-full bg-[#ffe9b8]" />
    </span>
  );
}

function FarLayer({ kind, color, progress }: { kind: WeatherCfg['far']; color: string; progress: number }) {
  const shift = `translateX(${(-progress * 30).toFixed(2)}%)`;
  if (kind === 'city') {
    return (
      <div className="absolute inset-x-0 bottom-[38px] top-[30px] overflow-hidden opacity-60">
        <div className="absolute bottom-0 h-[40px] w-[200%]" style={{
          transform: shift, transition: 'transform .3s linear',
          background: `repeating-linear-gradient(90deg,${color} 0 34px,transparent 34px 52px,${color} 52px 88px,transparent 88px 110px)`,
          opacity: 0.5,
        }} />
      </div>
    );
  }
  if (kind === 'dunes') {
    return (
      <div className="absolute inset-x-0 bottom-[38px] top-[34px] overflow-hidden opacity-70">
        <div className="absolute bottom-[-24px] left-[-10%] h-[64px] w-[120%] rounded-[50%]" style={{ background: color, transform: shift }} />
      </div>
    );
  }
  if (kind === 'treeline') {
    return (
      <div className="absolute inset-x-0 bottom-[38px] top-[30px] overflow-hidden opacity-60">
        <div className="absolute bottom-0 h-[42px] w-[200%]" style={{
          transform: shift, transition: 'transform .3s linear',
          background: `repeating-conic-gradient(from 0deg at 50% 100%, ${color} 0 5deg, transparent 5deg 11deg)`,
        }} />
      </div>
    );
  }
  return (
    <div className="absolute inset-x-0 bottom-[38px] top-[26px] overflow-hidden opacity-60">
      <div className="absolute bottom-0 h-[56px] w-[200%]" style={{
        transform: shift, transition: 'transform .3s linear',
        background: color,
        clipPath: 'polygon(0 100%, 5% 60%, 10% 80%, 16% 35%, 23% 65%, 30% 25%, 37% 62%, 44% 40%, 52% 72%, 60% 30%, 67% 60%, 74% 38%, 81% 68%, 88% 42%, 94% 64%, 100% 52%, 100% 100%)',
        opacity: 0.55,
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

  return (
    <div className="relative h-[104px] overflow-hidden rounded-xl border border-white/10 bg-[#0b0e14]" style={{ background: weather.sky }}>
      <span className="absolute inset-x-0 top-[30px] h-[18px] bg-gradient-to-b from-transparent to-black/20" />
      <FarLayer kind={weather.far} color={weather.silhouette} progress={p} />

      <div className="absolute inset-y-0 left-0 w-[400%]" style={{ transform: `translateX(${(-p * 75).toFixed(2)}%)`, transition: 'transform .3s linear' }}>
        {weather.near.map((kind, i) => <NearItem key={i} kind={kind} index={i} />)}
      </div>

      {/* Real road — black asphalt, solid edge lines, dashed white center */}
      <div className="absolute inset-x-0 bottom-0" style={{ height: 40 }}>
        <div className="relative h-full w-full bg-[#0a0b0d]">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-white/25" />
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/25" />
          <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 opacity-90" style={{
            backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,.92) 0 28px, transparent 28px 50px)',
            backgroundPositionX: `${(-p * 1800).toFixed(0)}px`,
            transition: 'background-position .3s linear',
          }} />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent" />
        </div>
      </div>

      <span className="absolute bottom-[8px]" style={{ left: `calc(${(p * 80).toFixed(2)}%)`, transition: 'left .3s linear' }}>
        <Car3D color={racer.color} moving={moving} you={racer.you} />
      </span>

      {racer.finished && (
        <span className="absolute right-2.5 top-10 rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-black">Finished</span>
      )}

      <span className="absolute left-2.5 top-2.5 flex items-center gap-2">
        <span className={`flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-[12px] font-bold ${pos === 1 ? 'bg-white text-black' : 'bg-black/60 text-white/80'}`}>0{pos}</span>
        <span className="rounded-md bg-black/60 px-2.5 py-1 text-[12px] font-semibold tracking-normal text-white backdrop-blur-sm">
          {racer.name} <span className="ml-1 text-[11px] font-normal text-white/50">{racer.wpm} wpm</span>
        </span>
      </span>
      <span className="absolute right-2.5 top-2.5 rounded-md bg-black/60 px-2 py-1 text-[11px] font-medium tabular-nums text-white/70">{Math.round(p * 100)}%</span>
    </div>
  );
}

export function WeatherPicker({ value, onChange, small, light }: { value: WeatherId; onChange: (w: WeatherId) => void; small?: boolean; light?: boolean }) {
  const active = light ? 'bg-black text-white' : 'bg-white text-black';
  const idle = light ? 'border-black/15 text-black/60 hover:border-black/40 hover:text-black' : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white';
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {!small && <span className={`mr-1 text-[11px] font-medium ${light ? 'text-black/50' : 'text-white/50'}`}>Track</span>}
      {WEATHER_IDS.map((id) => (
        <button key={id} onClick={() => onChange(id)} title={WEATHERS[id].name}
          className={`rounded-full font-medium transition ${small ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2 text-[12px]'} ${value === id ? active : `border ${idle}`}`}>
          {WEATHERS[id].name}
        </button>
      ))}
    </span>
  );
}
