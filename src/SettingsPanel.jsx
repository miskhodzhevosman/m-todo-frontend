import { useEffect } from 'react';
import { CloseIcon } from './Icons';
import { useTheme } from './useTheme';
import { URGENCIES } from './constants';
import CategoryManager from './CategoryManager';

export default function SettingsPanel({
  open,
  onClose,
  filter,
  onFilterChange,
  urgencyFilter,
  onUrgencyChange,
  categoryFilter,
  onCategoryChange,
  categories,
  onCategoriesChange,
}) {
  const { preference, setTheme } = useTheme();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const themes = [
    { value: null, label: 'Системная', icon: '🖥' },
    { value: 'light', label: 'Светлая', icon: '☀️' },
    { value: 'dark', label: 'Тёмная', icon: '🌙' },
  ];

  const filters = [
    { value: 'all', label: 'Все' },
    { value: 'active', label: 'Активные' },
    { value: 'done', label: 'Выполненные' },
  ];

  return (
    <>
      <div className={`overlay drawer-overlay ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="modal-header">
          <h2>Настройки</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Закрыть">
            <CloseIcon />
          </button>
        </div>

        <div className="drawer-body">
          <section className="settings-section">
            <h3>Тема</h3>
            <div className="segmented">
              {themes.map((t) => (
                <button
                  key={String(t.value)}
                  className={preference === t.value ? 'active' : ''}
                  onClick={() => setTheme(t.value)}
                >
                  <span>{t.icon}</span> {t.label}
                </button>
              ))}
            </div>
          </section>

          <section className="settings-section">
            <h3>Статус</h3>
            <div className="segmented">
              {filters.map((f) => (
                <button
                  key={f.value}
                  className={filter === f.value ? 'active' : ''}
                  onClick={() => onFilterChange(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </section>

          <section className="settings-section">
            <h3>Срочность</h3>
            <div className="segmented wrap">
              <button
                className={urgencyFilter === '' ? 'active' : ''}
                onClick={() => onUrgencyChange('')}
              >
                Любая
              </button>
              {URGENCIES.map((u) => (
                <button
                  key={u.value}
                  className={urgencyFilter === u.value ? 'active' : ''}
                  onClick={() => onUrgencyChange(u.value)}
                >
                  {u.emoji} {u.label}
                </button>
              ))}
            </div>
          </section>

          <section className="settings-section">
            <h3>Категория</h3>
            <select
              className="full-select"
              value={categoryFilter ?? ''}
              onChange={(e) =>
                onCategoryChange(e.target.value === '' ? null : Number(e.target.value))
              }
            >
              <option value="">Все категории</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </section>

          <section className="settings-section">
            <h3>Категории</h3>
            <CategoryManager categories={categories} onChange={onCategoriesChange} />
          </section>
        </div>
      </aside>
    </>
  );
}
