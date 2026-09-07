import InfoPage from '@/components/site/InfoPage';

export default function TournamentsPage() {
  return (
    <InfoPage kicker="COMPETE // TOURNAMENTS" title={<>WEEKLY<br />SPRINTS<span className="text-acid">.</span></>} intro="Same rooms you already use — with brackets, points, and bragging rights.">
      <p><strong className="text-white">Format.</strong> Every Sunday: open qualifiers in private rooms, top 8 advance to single-elimination finals. Passage is identical for all racers in a room.</p>
      <p><strong className="text-white">Scoring.</strong> Finish position sets points (12-10-8-7-6-5-4-3-2-1), ties broken by higher WPM, then accuracy.</p>
      <p><strong className="text-white">Enter.</strong> Mail <span className="font-mono text-acid">events@hotkeys.gg</span> with your driver name and clan (if any) before Friday midnight.</p>
    </InfoPage>
  );
}
