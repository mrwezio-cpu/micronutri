// Persistenza locale: tutti i dati restano sul dispositivo.

const KEY = 'micronutri:v1';

export function defaultState() {
  return {
    version: 1,
    profile: null,
    logs: {}, // { 'AAAA-MM-GG': [{ id: 'mela', p: 1.5 }] } — p = porzioni
    settings: { reminderTime: '20:30', notifications: false },
  };
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const data = JSON.parse(raw);
    const base = defaultState();
    return { ...base, ...data, logs: data.logs || {}, settings: { ...base.settings, ...(data.settings || {}) } };
  } catch {
    return defaultState();
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function isValidBackup(data) {
  return !!data && typeof data === 'object' && typeof data.logs === 'object' && 'profile' in data;
}
