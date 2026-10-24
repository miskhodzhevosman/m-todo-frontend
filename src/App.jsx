import { useEffect, useState } from 'react';
import { api } from './api';
import TodoList from './TodoList';
import AddTodoModal from './AddTodoModal';
import EditTodoModal from './EditTodoModal';
import SettingsPanel from './SettingsPanel';
import { PlusIcon, GearIcon } from './Icons';
import { useTheme } from './useTheme';

export default function App() {
  useTheme();

  const [todos, setTodos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filter, setFilter] = useState('active');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // ---- категории грузим один раз ----
  useEffect(() => {
    api.listCategories().then(setCategories).catch((e) => setError(e.message));
  }, []);

  // ---- todos грузим при изменении фильтров ----
  async function load() {
    setLoading(true);
    setError(null);
    try {
      const filters = {
        completed: filter === 'all' ? undefined : filter === 'done',
        urgency: urgencyFilter || undefined,
        category_id: categoryFilter ?? undefined,
      };
      setTodos(await api.list(filters));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filter, urgencyFilter, categoryFilter]);

  async function handleCreate(data) {
    try {
      const created = await api.create(data);
      // если задача не проходит текущие фильтры — просто не показываем её сразу
      const matchesFilters =
        (filter === 'all' || (filter === 'active' && !created.completed)) &&
        (!urgencyFilter || created.urgency === urgencyFilter) &&
        (categoryFilter == null || created.category_id === categoryFilter);
      if (matchesFilters) setTodos((prev) => [created, ...prev]);
      setAddOpen(false);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleToggle(todo) {
    try {
      const updated = await api.update(todo.id, { completed: !todo.completed });
      if (filter === 'all') {
        setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
      } else {
        setTodos((prev) => prev.filter((t) => t.id !== todo.id));
      }
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

  async function handleSaveEdit(id, data) {
    try {
      const updated = await api.update(id, data);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setEditing(null);
    } catch (e) {
      setError(e.message);
    }
  }

  const activeCount = todos.filter((t) => !t.completed).length;

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Todo</h1>
          {!loading && (
            <p className="subtitle">
              {activeCount > 0
                ? `${activeCount} активных`
                : todos.length > 0
                ? 'Все выполнено 🎉'
                : 'Ничего не запланировано'}
            </p>
          )}
        </div>
        <button className="icon-btn" onClick={() => setSettingsOpen(true)} aria-label="Настройки">
          <GearIcon />
        </button>
      </header>

      {error && (
        <div className="error">
          {error}
          <button className="link" onClick={() => setError(null)}>скрыть</button>
        </div>
      )}

      {loading ? (
        <p className="empty">Загрузка…</p>
      ) : (
        <TodoList
          todos={todos}
          filter={filter}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onEdit={setEditing}
        />
      )}

      <button className="fab" onClick={() => setAddOpen(true)} aria-label="Добавить задачу">
        <PlusIcon />
      </button>

      <AddTodoModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreate={handleCreate}
        categories={categories}
      />

      <EditTodoModal
        todo={editing}
        onClose={() => setEditing(null)}
        onSave={handleSaveEdit}
        categories={categories}
      />

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        filter={filter}
        onFilterChange={setFilter}
        urgencyFilter={urgencyFilter}
        onUrgencyChange={setUrgencyFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categories={categories}
        onCategoriesChange={setCategories}
      />
    </div>
  );
}
