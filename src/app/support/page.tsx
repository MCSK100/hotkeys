import InfoPage from '@/components/site/InfoPage';

const faqs: [string, string][] = [
  ['How do I race friends?', 'Open Multiplayer, set your name, pick a car, hit Create Room, then Copy Invite Link and send it. They open the link, set their name and car, and hit Join Grid.'],
  ['It says CONNECTING forever.', 'The live race server (npm run server) may be offline. Solo practice always works; multiplayer needs the socket server on ws://localhost:3001.'],
  ['The race restarted mid-type!', 'Fixed: races now start once per lobby round. If it still happens, rejoin with the same invite link.'],
  ['Can I change my car mid-race?', 'Cars lock when you join the grid so every driver keeps their identity for the whole race.'],
  ['Where are my stats?', 'Solo bests live on your device (AVG / BEST / RACES on the practice screen).'],
];

export default function SupportPage() {
  return (
    <InfoPage kicker="PLAY // SUPPORT" title={<>PIT<br />SUPPORT<span className="text-acid">.</span></>} intro="Quick fixes for the most common grid problems.">
      <div className="space-y-2">
        {faqs.map(([q, a]) => (
          <div key={q} className="border border-white/10 bg-white/[0.02] px-4 py-3">
            <p className="font-tech font-bold tracking-[0.06em] text-white">{q}</p>
            <p className="mt-1 text-sm text-white/55">{a}</p>
          </div>
        ))}
      </div>
      <p>Still stuck? Mail <span className="font-mono text-acid">support@hotkeys.gg</span> with your room code.</p>
    </InfoPage>
  );
}
