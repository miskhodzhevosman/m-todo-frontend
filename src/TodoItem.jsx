export default function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={todo.completed ? 'done' : ''}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo)}
      />
      <div className="content">
        <div className="title">{todo.title}</div>
        {todo.description && <div className="desc">{todo.description}</div>}
      </div>
      <button className="delete" onClick={() => onDelete(todo.id)}>
        ✕
      </button>
    </li>
  );
}
