import InfoPage from '@/components/site/InfoPage';

export default function ContactPage() {
  return (
    <InfoPage kicker="STUDIO // CONTACT" title={<>TALK TO<br />THE CREW<span className="text-acid">.</span></>} intro="Bug reports, room issues, tournament ideas — we read everything.">
      <p><strong className="text-white">Support.</strong> <span className="font-mono text-acid">support@hotkeys.gg</span> — include your room code and what happened.</p>
      <p><strong className="text-white">Tournaments.</strong> <span className="font-mono text-acid">events@hotkeys.gg</span> — clan name, player count, preferred date.</p>
      <p><strong className="text-white">Response time.</strong> Usually within 2 race days. Faster if your WPM is over 100.</p>
    </InfoPage>
  );
}
