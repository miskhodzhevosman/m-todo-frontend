import { useEffect, useState } from 'react';
import { CloseIcon } from './Icons';
import { URGENCIES } from './constants';

// ISO → "YYYY-MM-DDTHH:MM" для <input type="datetime-local">
function toLocalInputValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditTodoModal({ todo, onClose, onSave, categories }) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || '');
  const [urgency, setUrgency] = useState(todo.urgency);
  const [dueAt, setDueAt] = useState(toLocalInputValue(todo.due_at));
  const [categoryId, setCategoryId] = useState(todo.category_id ?? '');

  useEffect(() => {
    if (!todo) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [todo, onClose]);

  if (!todo) return null;

  function submit(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    onSave(todo.id, {
      title: t,
      description: description.trim() || null,
      urgency,
      due_at: dueAt ? new Date(dueAt).toISOString() : null,
      category_id: categoryId === '' ? null : Number(categoryId),
    });
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Редактировать задачу" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Редактировать</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Закрыть">
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={submit} className="modal-body">
          <label>
            <span>Название</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
          </label>

          <label>
            <span>Описание</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </label>

          <div className="row-2">
            <label>
              <span>Срочность</span>
              <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                {URGENCIES.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.emoji} {u.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Дедлайн</span>
              <input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
            </label>
          </div>

          <label>
            <span>Категория</span>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">— Без категории —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          <div className="modal-actions">
            <button type="button" className="btn ghost" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn primary" disabled={!title.trim()}>
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
