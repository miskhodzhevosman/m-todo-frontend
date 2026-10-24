import { useEffect, useRef, useState } from 'react';
import { CloseIcon } from './Icons';
import { URGENCIES } from './constants';

export default function AddTodoModal({ open, onClose, onCreate, categories }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('medium');
  const [dueAt, setDueAt] = useState('');           // для <input type="datetime-local">
  const [categoryId, setCategoryId] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  function submit(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    onCreate({
      title: t,
      description: description.trim() || null,
      urgency,
      due_at: dueAt ? new Date(dueAt).toISOString() : null,
      category_id: categoryId === '' ? null : Number(categoryId),
    });
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Новая задача" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Новая задача</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Закрыть">
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={submit} className="modal-body">
          <label>
            <span>Название</span>
            <input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Что нужно сделать?"
              maxLength={200}
            />
          </label>

          <label>
            <span>Описание <em>(необязательно)</em></span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Детали, ссылки, заметки…"
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
            <span>Категория <em>(необязательно)</em></span>
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
              Добавить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
