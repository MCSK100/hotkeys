export default function SeoContent() {
  return (
    <section className="border-t border-white/[0.07] bg-void py-16 md:py-20">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <p className="font-mono text-[10px] tracking-[0.4em] text-acid">HOTKEYS — FREE ONLINE TYPING TEST</p>
        <h2 className="mt-2 max-w-3xl font-display text-4xl leading-[0.95] text-white md:text-6xl">Free Online Typing Test & Typing Practice</h2>
        <p className="mt-5 max-w-3xl text-[15px] leading-7 text-white/65">Improve your typing speed with free online typing practice. Test your WPM and accuracy with focused 3, 5, or 10 minute typing sprints. When you are ready, create a multiplayer race and compete against friends in real time.</p>
        <ul className="mt-8 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Typing Speed Test', 'Measure WPM with timed sprints and clean accuracy tracking.'],
            ['WPM Test', 'Lock a rhythm, hold speed, and chase your best average WPM.'],
            ['Typing Accuracy Test', 'Every keystroke is throttle — clean keys move the car.'],
            ['Typing Practice', 'Train solo in 3, 5 and 10 minute sessions with no bots.'],
            ['Multiplayer Typing Race', 'Create a room, share a link, and race the same passage live.'],
            ['Free Typing Game', 'Typing practice turned into a high-speed night-circuit race.'],
          ].map(([t, d]) => (
            <li key={t} className="bg-void p-5">
              <h3 className="font-tech text-sm font-bold tracking-[0.15em] text-white">{t}</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">{d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
