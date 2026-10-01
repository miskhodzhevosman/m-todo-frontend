import { useState } from 'react';

export default function TodoForm({ onCreate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  function submit(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    onCreate({ title: t, description: description.trim() || null });
    setTitle('');
    setDescription('');
  }

  return (
    <form className="todo-form" onSubmit={submit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Что нужно сделать?"
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Описание (необязательно)"
      />
      <button type="submit">Добавить</button>
    </form>
  );
}
