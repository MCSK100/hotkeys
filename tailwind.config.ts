import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        void: '#050609',
        carbon: '#080A0F',
        asphalt: '#0D1017',
        line: 'rgba(255,255,255,0.08)',
        acid: '#00E5FF',
        'acid-dim': '#00B3CC',
        bone: '#F2F3EF',
        smoke: '#9BA1AB',
        danger: '#FF3D2E',
      },
      fontFamily: {
        display: ['"Bebas Neue"', '"Oswald"', 'sans-serif'],
        tech: ['Rajdhani', '"Space Grotesk"', 'sans-serif'],
        body: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: { widest2: '0.32em' },
    },
  },
  plugins: [],
};

export default config;
