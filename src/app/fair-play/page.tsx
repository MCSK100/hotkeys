import InfoPage from '@/components/site/InfoPage';

export default function FairPlayPage() {
  return (
    <InfoPage kicker="COMPETE // FAIR PLAY" title={<>CLEAN<br />RACING<span className="text-acid">.</span></>} intro="Type it yourself or do not race. Simple.">
      <p><strong className="text-white">Banned.</strong> Paste-typing, auto-typers, macros, edited clients, and deliberately crashing other rooms.</p>
      <p><strong className="text-white">Enforcement.</strong> Suspicious results (inhuman consistency, impossible bursts) are voided from tournaments; repeat offenders are room-banned by hosts.</p>
      <p><strong className="text-white">Report.</strong> Send the room code, driver name and time to <span className="font-mono text-acid">support@hotkeys.gg</span>.</p>
    </InfoPage>
  );
}
