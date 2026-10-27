import { useState } from 'react';
import { api } from './api';

export default function AuthScreen({ onAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await api.login({ username, password });
      onAuthenticated(user);
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-logo" aria-hidden="true">✓</div>
        <h1>С возвращением</h1>
        <p className="subtitle">Ваши задачи — в одном месте, на любом устройстве.</p>
        <form className="modal-body auth-form" onSubmit={submit}>
          <label>
            <span>Имя пользователя</span>
            <input name="username" autoComplete="username" autoCapitalize="none" spellCheck={false}
              required minLength={3} maxLength={32} pattern="[a-zA-Z0-9_][a-zA-Z0-9_.\-]{2,31}"
              title="3–32 символа: латинские буквы, цифры, _, . и -"
              value={username} onChange={(event) => setUsername(event.target.value)} />
          </label>
          <label>
            <span>Пароль</span>
            <input name="password" type="password" autoComplete="current-password"
              required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error && <div className="error" role="alert">{error}</div>}
          <button className="btn primary" disabled={busy} type="submit">
            {busy ? 'Подождите…' : 'Войти'}
          </button>
        </form>
      </section>
    </main>
  );
}
