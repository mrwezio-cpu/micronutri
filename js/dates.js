// Date come chiavi locali "AAAA-MM-GG" (niente fusi orari di mezzo).

export function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key, n) {
  const d = parseKey(key);
  d.setDate(d.getDate() + n);
  return dateKey(d);
}

export function dayLabel(key, today = dateKey()) {
  if (key === today) return 'Oggi';
  if (key === addDays(today, -1)) return 'Ieri';
  return parseKey(key).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });
}
