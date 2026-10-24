import { useState } from 'react';
import { api } from './api';
import { CATEGORY_COLORS } from './constants';
import { CloseIcon } from './Icons';

export default function CategoryManager({ categories, onChange }) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(CATEGORY_COLORS[0]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [error, setError] = useState(null);

  async function handleCreate(e) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    try {
      const created = await api.createCategory({ name, color: newColor });
      onChange([...categories, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName('');
      setNewColor(CATEGORY_COLORS[0]);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleSaveEdit(id) {
    const name = editName.trim();
    if (!name) return;
    try {
      const updated = await api.updateCategory(id, { name, color: editColor });
      onChange(categories.map((c) => (c.id === id ? updated : c)));
      setEditingId(null);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Удалить категорию? Задачи останутся без категории.')) return;
    try {
      await api.removeCategory(id);
      onChange(categories.filter((c) => c.id !== id));
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="category-manager">
      {error && <div className="error small">{error}</div>}

      <ul className="category-list">
        {categories.map((c) =>
          editingId === c.id ? (
            <li key={c.id} className="category-item editing">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={50}
                autoFocus
              />
              <div className="color-row">
                {CATEGORY_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    className={`swatch ${editColor === col ? 'active' : ''}`}
                    style={{ background: col }}
                    onClick={() => setEditColor(col)}
                  />
                ))}
              </div>
              <div className="row-actions">
                <button className="btn ghost small" onClick={() => setEditingId(null)}>
                  Отмена
                </button>
                <button className="btn primary small" onClick={() => handleSaveEdit(c.id)}>
                  ОК
                </button>
              </div>
            </li>
          ) : (
            <li key={c.id} className="category-item">
              <span className="dot" style={{ background: c.color }} />
              <span className="name">{c.name}</span>
              <button
                className="icon-btn small"
                onClick={() => {
                  setEditingId(c.id);
                  setEditName(c.name);
                  setEditColor(c.color);
                }}
                aria-label="Переименовать"
              >
                ✎
              </button>
              <button
                className="icon-btn small danger"
                onClick={() => handleDelete(c.id)}
                aria-label="Удалить"
              >
                <CloseIcon />
              </button>
            </li>
          )
        )}
      </ul>

      <form className="category-create" onSubmit={handleCreate}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Новая категория"
          maxLength={50}
        />
        <div className="color-row">
          {CATEGORY_COLORS.map((col) => (
            <button
              key={col}
              type="button"
              className={`swatch ${newColor === col ? 'active' : ''}`}
              style={{ background: col }}
              onClick={() => setNewColor(col)}
            />
          ))}
        </div>
        <button className="btn primary small" type="submit" disabled={!newName.trim()}>
          Добавить
        </button>
      </form>
    </div>
  );
}
