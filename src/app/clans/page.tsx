import InfoPage from '@/components/site/InfoPage';

export default function ClansPage() {
  return (
    <InfoPage kicker="COMPETE // CLANS" title={<>RACE AS<br />A CLAN<span className="text-acid">.</span></>} intro="Tag your crew and climb together. Clans are honor-based — wear the tag, defend it live.">
      <p><strong className="text-white">Create one.</strong> Pick a 2–4 letter tag (e.g. NITRO becomes [NTR]), add it to your driver name, and race the same rooms together.</p>
      <p><strong className="text-white">Clan nights.</strong> Book a weekly room, share one invite link in your group chat, run 5 back-to-back races, post the standings.</p>
      <p><strong className="text-white">Get listed.</strong> Active clans (4+ racers, weekly rooms) get featured — mail <span className="font-mono text-acid">events@hotkeys.gg</span>.</p>
    </InfoPage>
  );
}
