// Promemoria del check-in serale.
//
// Una web app senza server può mostrare notifiche solo mentre è aperta o in background recente:
// per un promemoria affidabile ad app chiusa offriamo anche un evento ricorrente da calendario (.ics),
// che funziona su qualsiasi telefono. Le notifiche push vere richiedono la versione nativa o un server push.

let timer = null;

export function permission() {
  return 'Notification' in window ? Notification.permission : 'unsupported';
}

export async function requestPermission() {
  if (!('Notification' in window)) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

export async function show(title = 'Com\'è andata oggi?', body = 'Registra frutta, verdura, legumi e cereali: ti dico cosa hai coperto e cosa manca.') {
  if (permission() !== 'granted') return false;
  const options = { body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'checkin', data: { url: './#/checkin' } };
  try {
    const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
    if (reg) await reg.showNotification(title, options);
    else new Notification(title, options);
    return true;
  } catch {
    return false;
  }
}

export function cancel() {
  clearTimeout(timer);
  timer = null;
}

// shouldNotify() viene valutata al momento: niente notifica se il check-in di oggi è già fatto.
export function schedule(time, shouldNotify) {
  cancel();
  const [h, m] = time.split(':').map(Number);
  const now = new Date();
  const next = new Date(now);
  next.setHours(h, m, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  timer = setTimeout(async () => {
    if (shouldNotify()) await show();
    schedule(time, shouldNotify);
  }, Math.min(next - now, 2 ** 31 - 1));
}

const icsText = s => s.replace(/\\/g, '\\\\').replace(/[,;]/g, m => '\\' + m).replace(/\n/g, '\\n');
const stamp = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

export function downloadIcs(time, appUrl) {
  const [h, m] = time.split(':');
  const now = new Date();
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const url = `${appUrl}#/checkin`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MicroNutri//Promemoria//IT',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:micronutri-checkin-${Date.now()}@micronutri`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART:${ymd}T${h}${m}00`,
    'DURATION:PT5M',
    'RRULE:FREQ=DAILY',
    `SUMMARY:${icsText('MicroNutri · check-in serale')}`,
    `DESCRIPTION:${icsText(`Registra frutta, verdura, legumi e cereali di oggi: ${url}`)}`,
    `URL:${url}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${icsText('Cosa hai mangiato oggi? Fai il check-in su MicroNutri')}`,
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  const blob = new Blob([lines.join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'micronutri-promemoria.ics';
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
