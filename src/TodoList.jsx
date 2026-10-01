import TodoItem from './TodoItem';

export default function TodoList({ todos, onToggle, onDelete }) {
  if (!todos.length) return <p className="empty">Пока пусто 🗒️</p>;

  return (
    <ul className="todo-list">
      {todos.map((t) => (
        <TodoItem key={t.id} todo={t} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  );
}
