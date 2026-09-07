import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://hottkeys.vercel.app'),
  title: {
    default: 'HotKeys — Free Typing Test, WPM Test & Multiplayer Typing Race',
    template: '%s | HotKeys',
  },
  description: 'HotKeys is a free online typing test. Check your typing speed (WPM), improve accuracy with 3/5/10-min practice, or race friends live in multiplayer typing races.',
  keywords: ['typing test', 'free typing test', 'online typing test', 'typing speed test', 'wpm test', 'typing practice', 'typing accuracy test', 'typing race', 'multiplayer typing race', 'typing game', 'typing speed game', 'keyboard speed test', 'improve typing speed', 'typeracer alternative', 'monkeytype alternative', '10fastfingers alternative'],
  authors: [{ name: 'HotKeys' }],
  creator: 'HotKeys',
  publisher: 'HotKeys',
  robots: { index: true, follow: true },
  verification: { google: 'YZvT9bPEPhwpHJj7hWqTqiz8aU9ifX1IiMLTCpB4P78' },
  themeColor: '#08090c',
  icons: { icon: '/hotkeyslogo.png', apple: '/hotkeyslogo.png' },
  alternates: { canonical: 'https://hottkeys.vercel.app/' },
  openGraph: {
    title: 'HotKeys — Free Typing Test, WPM Test & Multiplayer Typing Race',
    description: 'Check your WPM, practice accuracy solo, then race real players live. Free online typing test + multiplayer typing game.',
    url: 'https://hottkeys.vercel.app/',
    siteName: 'HotKeys',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'HotKeys — Free Typing Test, WPM Test & Multiplayer Typing Race' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HotKeys — Free Typing Test, WPM Test & Multiplayer Typing Race',
    description: 'Check your WPM, practice accuracy, and race real players live.',
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
