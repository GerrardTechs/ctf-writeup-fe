import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface ThemeStore {
  theme: Theme;
  toggle: () => void;
  init: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'dark',

  init: () => {
    const saved = localStorage.getItem('theme') as Theme | null;
    const theme = saved ?? 'dark';
    set({ theme });
    applyTheme(theme);
  },

  toggle: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    set({ theme: next });
    applyTheme(next);
  },
}));

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.remove('dark');
    root.classList.add('light');
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
  }
}