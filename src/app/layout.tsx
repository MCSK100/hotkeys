import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://hottkeys.vercel.app'),
  title: 'HotKeys — Free Typing Test & Multiplayer Typing Race',
  description: 'Test and improve your typing speed with HotKeys. Practice WPM and accuracy solo, or join a multiplayer typing race and compete with friends in real time.',
  keywords: ['typing test', 'typing speed test', 'typing practice', 'WPM test', 'typing race', 'multiplayer typing game', 'online typing test', 'typing speed game', 'typing accuracy test', 'free typing test'],
  icons: { icon: '/hotkeyslogo.png' },
  alternates: { canonical: 'https://hottkeys.vercel.app/' },
  openGraph: {
    title: 'HotKeys — Free Typing Test & Multiplayer Typing Race',
    description: 'Practice your WPM and accuracy, then race real players live. HotKeys turns typing practice into a high-speed multiplayer race.',
    url: 'https://hottkeys.vercel.app/',
    siteName: 'HotKeys',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'HotKeys — Free Typing Test & Multiplayer Typing Race' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HotKeys — Free Typing Test & Multiplayer Typing Race',
    description: 'Improve your WPM, practice your accuracy, and race real players live.',
    images: ['https://hottkeys.vercel.app/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-void text-bone antialiased">{children}</body>
    </html>
  );
}
