import InfoPage from '@/components/site/InfoPage';

const rows: [string, string][] = [
  ['Website', 'OPERATIONAL'],
  ['Race server (ws)', 'OPERATIONAL'],
  ['Solo practice', 'OPERATIONAL'],
  ['Multiplayer rooms', 'OPERATIONAL'],
];

export default function StatusPage() {
  return (
    <InfoPage kicker="PLAY // STATUS" title={<>TRACK<br />STATUS<span className="text-acid">.</span></>} intro="Live health of the Night Circuit. All systems nominal.">
      <div className="border border-white/10">
        {rows.map(([s, st]) => (
          <div key={s} className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 last:border-0">
            <span className="font-tech font-bold tracking-[0.08em] text-white">{s}</span>
            <span className="flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-emerald-300">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />{st}
            </span>
          </div>
        ))}
      </div>
      <p>Multiplayer shows CONNECTING instead of LIVE? The socket server needs <span className="font-mono text-acid">npm run server</span> running on port 3001.</p>
    </InfoPage>
  );
}
