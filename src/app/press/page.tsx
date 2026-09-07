import InfoPage from '@/components/site/InfoPage';

export default function PressPage() {
  return (
    <InfoPage kicker="STUDIO // PRESS" title={<>PRESS<br />KIT<span className="text-acid">.</span></>} intro="Covering HotKeys? Everything you need in one pit stop.">
      <p><strong className="text-white">What it is.</strong> HotKeys Night Circuit — a browser typing race game with solo sprint training and link-invite multiplayer rooms.</p>
      <p><strong className="text-white">Facts.</strong> Free to play, no account required, runs in any modern browser, keyboard required.</p>
      <p><strong className="text-white">Contact.</strong> Interview and asset requests: <span className="font-mono text-acid">press@hotkeys.gg</span>. Please credit “HotKeys Studio (fan concept)”.</p>
    </InfoPage>
  );
}
