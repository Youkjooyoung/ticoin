/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'rgb(var(--bg) / <alpha-value>)',
          elev: 'rgb(var(--bg-elev) / <alpha-value>)',
          soft: 'rgb(var(--bg-soft) / <alpha-value>)',
        },
        surface: {
          1: 'rgb(var(--surface-1) / <alpha-value>)',
          2: 'rgb(var(--surface-2) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'rgb(var(--border) / <alpha-value>)',
          strong: 'rgb(var(--border-strong) / <alpha-value>)',
        },
        brand: {
          DEFAULT: 'rgb(var(--brand) / <alpha-value>)',
          dark: 'rgb(var(--brand-dark) / <alpha-value>)',
          light: 'rgb(var(--brand-light) / <alpha-value>)',
          soft: 'rgb(var(--brand-soft) / <alpha-value>)',
        },
        sky: {
          DEFAULT: 'rgb(var(--sky) / <alpha-value>)',
          soft: 'rgb(var(--sky-soft) / <alpha-value>)',
        },
        up: 'rgb(var(--up) / <alpha-value>)',
        down: 'rgb(var(--down) / <alpha-value>)',
        text: {
          1: 'rgb(var(--text-1) / <alpha-value>)',
          2: 'rgb(var(--text-2) / <alpha-value>)',
          3: 'rgb(var(--text-3) / <alpha-value>)',
          4: 'rgb(var(--text-4) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Pretendard', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(139, 92, 246, 0.2)',
        'glow-sky': '0 0 40px rgba(56, 189, 248, 0.25)',
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.06)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, rgb(var(--accent-start)) 0%, rgb(var(--accent-end)) 100%)',
        'radial-ambient':
          'radial-gradient(circle at 20% 10%, rgb(var(--accent-start) / 0.10) 0%, transparent 50%), radial-gradient(circle at 80% 90%, rgb(var(--accent-end) / 0.10) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
};
