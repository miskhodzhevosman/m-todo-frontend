import { useEffect, useState } from 'react';

const STORAGE_KEY = 'theme'; // 'light' | 'dark' | null

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getInitialPreference() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === 'light' || saved === 'dark' ? saved : null;
}

export function useTheme() {
  const [preference, setPreference] = useState(getInitialPreference); // null | 'light' | 'dark'
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  // следим за системной темой
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setSystemTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // итоговая тема
  const theme = preference ?? systemTheme;

  // применяем к <html>
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // сохраняем выбор (или чистим, если null → «системная»)
  function setTheme(next) {
    if (next === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, next);
    }
    setPreference(next);
  }

  return { theme, preference, setTheme };
}
