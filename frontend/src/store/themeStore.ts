import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'sentinel_theme';

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  if (saved && ['light', 'dark', 'system'].includes(saved)) {
    return saved;
  }
  return 'light';
};

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyThemeToDOM = (theme: ThemeMode): 'light' | 'dark' => {
  if (typeof document === 'undefined') return 'light';
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  const root = document.documentElement;

  if (resolved === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
    root.setAttribute('data-theme', 'light');
  }

  return resolved;
};

export const useThemeStore = create<ThemeState>((set, get) => {
  const initialTheme = getInitialTheme();
  const initialResolved = applyThemeToDOM(initialTheme);

  // Listen for system changes if system theme is selected
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      const current = get().theme;
      if (current === 'system') {
        const resolved = applyThemeToDOM('system');
        set({ resolvedTheme: resolved });
      }
    });
  }

  return {
    theme: initialTheme,
    resolvedTheme: initialResolved,
    setTheme: (newTheme: ThemeMode) => {
      localStorage.setItem(STORAGE_KEY, newTheme);
      const resolved = applyThemeToDOM(newTheme);
      set({ theme: newTheme, resolvedTheme: resolved });
    },
    toggleTheme: () => {
      const current = get().resolvedTheme;
      const nextTheme: ThemeMode = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, nextTheme);
      const resolved = applyThemeToDOM(nextTheme);
      set({ theme: nextTheme, resolvedTheme: resolved });
    },
  };
});
