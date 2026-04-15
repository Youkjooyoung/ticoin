/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0B0B0F',
          elev: '#13131A',
          soft: '#1A1A24',
        },
        border: {
          DEFAULT: '#23232E',
          strong: '#2D2D3A',
        },
        brand: {
          DEFAULT: '#8B5CF6',
          dark: '#7C3AED',
          light: '#A78BFA',
          soft: '#1E1B3A',
        },
        up: '#10B981',
        down: '#EF4444',
        text: {
          1: '#F5F5F7',
          2: '#A1A1AA',
          3: '#71717A',
          4: '#52525B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Pretendard', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(139, 92, 246, 0.15)',
      },
    },
  },
  plugins: [],
};
