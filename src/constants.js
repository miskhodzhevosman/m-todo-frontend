export const URGENCIES = [
  { value: 'low',      label: 'Низкая',      color: '#22c55e', emoji: '🌿' },
  { value: 'medium',   label: 'Средняя',     color: '#3b82f6', emoji: '🔵' },
  { value: 'high',     label: 'Высокая',     color: '#f59e0b', emoji: '⚠️' },
  { value: 'critical', label: 'Критичная',   color: '#ef4444', emoji: '🔥' },
];

export const URGENCY_MAP = Object.fromEntries(
  URGENCIES.map((u) => [u.value, u])
);

export const CATEGORY_COLORS = [
  '#6366f1', '#3b82f6', '#06b6d4', '#10b981',
  '#22c55e', '#eab308', '#f59e0b', '#ef4444',
  '#ec4899', '#8b5cf6', '#64748b', '#0f172a',
];
