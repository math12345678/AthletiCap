import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#08090E',
        'bg-secondary': '#10131C',
        'bg-elevated': '#1A1F2E',
        'border-color': '#2A3040',
        'border-bright': '#3D4A60',
        gold: '#F0A500',
        'gold-dim': '#8A6000',
        teal: '#0FB8A8',
        red: '#E8544A',
        green: '#2DD09A',
        yellow: '#F0C040',
        'text-primary': '#EDF0F7',
        'text-secondary': '#8A93A8',
        'text-muted': '#525C6F',
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'syne': ['Syne', 'sans-serif'],
        'mono': ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
