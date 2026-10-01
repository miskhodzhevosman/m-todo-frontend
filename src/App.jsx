import { useEffect, useState } from 'react';
import { api } from './api';
import TodoForm from './TodoForm';
import TodoList from './TodoList';
import ThemeToggle from './ThemeToggle';
import { useTheme } from './useTheme';

export default function App() {
  useTheme(); // ← просто вызываем, чтобы тема применилась к <html>

  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  async function load() {
    setLoading(true);
    setError(null);
    try {
      const completed =
        filter === 'all' ? undefined : filter === 'done';
      setTodos(await api.list(completed));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filter]);

  async function handleCreate(data) {
    try {
      const created = await api.create(data);
      setTodos((prev) => [created, ...prev]);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleToggle(todo) {
    try {
      const updated = await api.update(todo.id, { completed: !todo.completed });
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(id) {
    try {
      await api.remove(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

    return (
    <div className="app">
      <header className="app-header">
        <h1>📝 Todo</h1>
        <ThemeToggle />
      </header>      <TodoForm onCreate={handleCreate} />

      <div className="filters">
        {['all', 'active', 'done'].map((f) => (
          <button
            key={f}
            className={filter === f ? 'active' : ''}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Все' : f === 'active' ? 'Активные' : 'Выполненные'}
          </button>
        ))}
      </div>

      {error && <div className="error">Ошибка: {error}</div>}
      {loading ? (
        <p>Загрузка…</p>
      ) : (
        <TodoList
          todos={todos}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
