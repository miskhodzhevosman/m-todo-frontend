import { useTheme } from './useTheme';

export default function ThemeToggle() {
  const { preference, setTheme } = useTheme();

  const options = [
    { value: null, label: '🖥 Системная' },
    { value: 'light', label: '☀️ Светлая' },
    { value: 'dark', label: '🌙 Тёмная' },
  ];

  return (
    <div className="theme-toggle">
      {options.map((o) => (
        <button
          key={String(o.value)}
          className={preference === o.value ? 'active' : ''}
          onClick={() => setTheme(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
