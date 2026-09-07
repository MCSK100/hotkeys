import InfoPage from '@/components/site/InfoPage';

export default function AboutPage() {
  return (
    <InfoPage kicker="STUDIO // ABOUT" title={<>BUILT FOR<br />FAST HANDS<span className="text-acid">.</span></>} intro="HotKeys Night Circuit is a typing race arena: solo sprint training plus live multiplayer rooms where every keystroke moves your car.">
      <p><strong className="text-white">Solo practice.</strong> 3, 5 and 10 minute timed sprints with endless passages, live WPM and accuracy tracking, and personal bests stored on your device.</p>
      <p><strong className="text-white">Multiplayer.</strong> Create a room, share the invite link, pick a car, and race the same passage against friends with a 15-second lobby countdown.</p>
      <p><strong className="text-white">Free play.</strong> No account needed — set a driver name and you are on the grid.</p>
    </InfoPage>
  );
}
