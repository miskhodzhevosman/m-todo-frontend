import { CheckIcon, TrashIcon, EditIcon, CalendarIcon } from './Icons';
import { URGENCY_MAP } from './constants';

function formatDue(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();

  const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  if (sameDay) return `Сегодня, ${time}`;
  if (isTomorrow) return `Завтра, ${time}`;
  return d.toLocaleString('ru-RU', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export default function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const urgency = URGENCY_MAP[todo.urgency] || URGENCY_MAP.medium;
  const isOverdue =
    todo.due_at && !todo.completed && new Date(todo.due_at) < new Date();

  return (
    <li className={`todo-item ${todo.completed ? 'done' : ''}`}>
      <button
        className="checkbox"
        onClick={() => onToggle(todo)}
        aria-label={todo.completed ? 'Вернуть в активные' : 'Отметить выполненной'}
        style={{ '--checkbox-color': urgency.color }}
      >
        {todo.completed && <CheckIcon />}
      </button>

      <div className="content">
        <div className="title-row">
          <div className="title">{todo.title}</div>
          <span
            className="urgency-dot"
            title={`Срочность: ${urgency.label}`}
            style={{ background: urgency.color }}
          />
        </div>

        {todo.description && <div className="desc">{todo.description}</div>}

        <div className="meta">
          {todo.category && (
            <span className="badge category">
              <span className="dot" style={{ background: todo.category.color }} />
              {todo.category.name}
            </span>
          )}

          {todo.due_at && (
            <span className={`badge due ${isOverdue ? 'overdue' : ''}`}>
              <CalendarIcon />
              {formatDue(todo.due_at)}
            </span>
          )}

          <span className="badge urgency" style={{ color: urgency.color, borderColor: urgency.color + '55' }}>
            {urgency.label}
          </span>
        </div>
      </div>

      <div className="actions">
        <button className="icon-btn small" onClick={() => onEdit(todo)} aria-label="Редактировать">
          <EditIcon />
        </button>
        <button className="icon-btn small danger" onClick={() => onDelete(todo.id)} aria-label="Удалить">
          <TrashIcon />
        </button>
      </div>
    </li>
  );
}
