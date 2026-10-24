import { useEffect, useState } from 'react';
import AuthScreen from './AuthScreen';
import { api } from './api';
import TodoList from './TodoList';
import AddTodoModal from './AddTodoModal';
import EditTodoModal from './EditTodoModal';
import SettingsPanel from './SettingsPanel';
import { PlusIcon, GearIcon } from './Icons';
import { useTheme } from './useTheme';

export default function App() {
  useTheme();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    let active = true;
    api.me().then((value) => { if (active) setUser(value); }).catch(() => {}).finally(() => { if (active) setChecking(false); });
    const expired = () => setUser(null);
    window.addEventListener('auth-expired', expired);
    return () => { active = false; window.removeEventListener('auth-expired', expired); };
  }, []);
  if (checking) return <main className="auth-page" aria-busy="true">Загрузка…</main>;
  if (!user) return <AuthScreen onAuthenticated={setUser} />;
  return <Workspace key={user.id} user={user} onLogout={() => setUser(null)} />;
}

function Workspace({ user, onLogout }) {

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

  useEffect(() => {
    let active = true;
    const filters = {
        completed: filter === 'all' ? undefined : filter === 'done',
        urgency: urgencyFilter || undefined,
        category_id: categoryFilter ?? undefined,
    };
    api.list(filters).then((items) => { if (active) setTodos(items); })
      .catch((e) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
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
  function changeFilter(value) { if (value !== filter) { setLoading(true); setFilter(value); } }
  async function logout() {
    try { await api.logout(); onLogout(); } catch (e) { setError(e.message); }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Todo</h1>
          <p className="account-name">{user.username}</p>
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

      <nav className="segmented task-tabs" aria-label="Статус задач">
        {[['active', 'Активные'], ['all', 'Все'], ['done', 'Выполненные']].map(([value, label]) => (
          <button key={value} className={filter === value ? 'active' : ''} aria-pressed={filter === value}
            onClick={() => changeFilter(value)}>{label}</button>
        ))}
      </nav>

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

      {addOpen && <AddTodoModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreate={handleCreate}
        categories={categories}
      />}

      {editing && <EditTodoModal
        key={editing.id}
        todo={editing}
        onClose={() => setEditing(null)}
        onSave={handleSaveEdit}
        categories={categories}
      />}

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        filter={filter}
        onFilterChange={changeFilter}
        urgencyFilter={urgencyFilter}
        onUrgencyChange={setUrgencyFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categories={categories}
        onCategoriesChange={setCategories}
        user={user}
        onLogout={logout}
      />
    </div>
  );
}
