import InfoPage from '@/components/site/InfoPage';

const roles = [
  ['Frontend Engineer (React)', 'Race UI, typing engine, real-time lanes.'],
  ['Game Designer', 'Modes, balancing, season formats.'],
  ['Community Manager', 'Tournaments, clans, Discord events.'],
];

export default function CareersPage() {
  return (
    <InfoPage kicker="STUDIO // CAREERS" title={<>JOIN THE<br />PIT CREW<span className="text-acid">.</span></>} intro="Small team, fast laps. We hire racers who type fast and ship faster.">
      <div className="space-y-2">
        {roles.map(([t, d]) => (
          <div key={t} className="border border-white/10 bg-white/[0.02] px-4 py-3">
            <p className="font-tech font-bold tracking-[0.08em] text-white">{t}</p>
            <p className="text-sm text-white/55">{d}</p>
          </div>
        ))}
      </div>
      <p>Send your best WPM screenshot plus work to <span className="font-mono text-acid">crew@hotkeys.gg</span> — subject line: the role you want.</p>
    </InfoPage>
  );
}
