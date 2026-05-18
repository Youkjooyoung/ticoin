import { create } from 'zustand';

const STORAGE_KEY = 'ticoin.theme';
const VALID = new Set(['light', 'dark', 'system']);

function readStored() {
  if (typeof window === 'undefined') return 'system';
  const v = window.localStorage.getItem(STORAGE_KEY);
  return VALID.has(v) ? v : 'system';
}

function systemPrefersDark() {
  if (typeof window === 'undefined' || !window.matchMedia) return true;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(mode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const isDark = mode === 'dark' || (mode === 'system' && systemPrefersDark());
  root.classList.toggle('dark', isDark);
  root.style.colorScheme = isDark ? 'dark' : 'light';
}

applyTheme(readStored());

export const useThemeStore = create((set, get) => ({
  mode: readStored(),
  hydrated: false,

  hydrate: () => {
    const mode = readStored();
    applyTheme(mode);
    set({ mode, hydrated: true });

    if (typeof window !== 'undefined' && window.matchMedia) {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const onChange = () => {
        if (get().mode === 'system') applyTheme('system');
      };
      if (mql.addEventListener) mql.addEventListener('change', onChange);
      else if (mql.addListener) mql.addListener(onChange);
    }
  },

  setMode: (mode) => {
    if (!VALID.has(mode)) return;
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, mode);
    applyTheme(mode);
    set({ mode });
  },

  toggle: () => {
    const { mode } = get();
    const next = mode === 'dark' ? 'light' : 'dark';
    get().setMode(next);
  },

  isDark: () => {
    const { mode } = get();
    return mode === 'dark' || (mode === 'system' && systemPrefersDark());
  },
}));
