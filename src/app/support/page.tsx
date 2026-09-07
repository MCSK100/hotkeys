import InfoPage from '@/components/site/InfoPage';

const faqs: [string, string][] = [
  ['How do I race friends?', 'Open Multiplayer, set your name, pick a car, hit Create Room, then Copy Invite Link and send it. They open the link, set their name and car, and hit Join Grid.'],
  ['It says CONNECTING forever.', 'Multiplayer needs the race server (NEXT_PUBLIC_WS_URL). On Vercel set it to your Render URL wss://…onrender.com. Free Render sleeps — first join can take ~50s.'],
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
