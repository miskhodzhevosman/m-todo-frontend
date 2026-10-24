import TodoItem from './TodoItem';

export default function TodoList({ todos, filter, onToggle, onDelete, onEdit }) {
  if (!todos.length) {
    const text =
      filter === 'done'
        ? 'Ничего не выполнено'
        : filter === 'active'
        ? 'Нет активных задач'
        : 'Пока пусто. Нажми «+», чтобы добавить первую задачу.';
    return (
      <div className="empty-state">
        <div className="empty-emoji">🗒️</div>
        <p>{text}</p>
      </div>
    );
  }

  // группируем: сначала задачи с категорией, потом без, категории по алфавиту
  const groups = new Map();
  for (const t of todos) {
    const key = t.category ? `cat:${t.category.id}` : 'none';
    if (!groups.has(key)) {
      groups.set(key, {
        title: t.category?.name || 'Без категории',
        color: t.category?.color || '#9aa3af',
        items: [],
      });
    }
    groups.get(key).items.push(t);
  }

  const ordered = [...groups.values()].sort((a, b) => {
    if (a.title === 'Без категории') return 1;
    if (b.title === 'Без категории') return -1;
    return a.title.localeCompare(b.title, 'ru');
  });

  return (
    <div className="todo-groups">
      {ordered.map((g) => (
        <section key={g.title} className="todo-group">
          <h3 className="group-title">
            <span className="dot" style={{ background: g.color }} />
            {g.title}
            <span className="count">{g.items.length}</span>
          </h3>
          <ul className="todo-list">
            {g.items.map((t) => (
              <TodoItem
                key={t.id}
                todo={t}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
