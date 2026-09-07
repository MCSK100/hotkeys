import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HotKeys // Night Circuit — Own The Streets',
  description: 'HotKeys Night Circuit. Push your limits. Race the city. A cinematic competitive typing-racing experience.',
  icons: { icon: '/hotkeyslogo.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-void text-bone antialiased">{children}</body>
    </html>
  );
}
