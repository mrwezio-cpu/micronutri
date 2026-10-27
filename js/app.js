import { load, save, defaultState, isValidBackup } from './store.js';
import { dateKey, addDays, dayLabel } from './dates.js';
import { FOODS, FOOD_BY_ID, CATEGORIES } from './data/foods.js';
import { NUTRIENT_GROUPS, NUTRIENT_BY_KEY, EVIDENCE, getTargets } from './data/nutrients.js';
import { ANIMAL, SUPPLEMENTS, DIETS, SUN, SALT, CONDITIONS, defaultProfile, dietOf, allowedAnimal } from './data/profile.js';
import { computeDay, computeWeek, evaluate, evaluateGroups, recommend, adviceCards, animalBreakdown } from './engine.js';
import * as notify from './notifications.js';

let state = load();

const ui = {
  date: dateKey(),
  cat: 'frutta',
  search: '',
  anMode: 'giorno',
  coMode: 'giorno',
  open: null, // riga espansa in Analisi
  step: 0, // passo del profilo guidato
  ck: 0, // passo del check-in
  draft: null,
  lastRoute: null,
};

const app = document.getElementById('app');
const tabbar = document.getElementById('tabbar');

// ---------- utilità ----------

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmt = (v, dp = 0) => Number(v || 0).toLocaleString('it-IT', { maximumFractionDigits: dp });
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const plural = (n, one, many) => (n === 1 ? one : many);

function fmtPortion(p) {
  const whole = Math.floor(p);
  const half = p - whole >= 0.5;
  if (!whole) return half ? '½' : '0';
  return `${whole}${half ? '½' : ''}`;
}

function persist() {
  if (!save(state)) toast('Impossibile salvare: spazio del browser non disponibile');
}

let toastTimer;
function toast(msg) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.append(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

function download(name, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

const ICONS = {
  diario: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6.5A1.5 1.5 0 0 1 5 19.5z"/><path d="M12 8.5v6M9 11.5h6"/>',
  analisi: '<path d="M5 20V11M12 20V5M19 20v-6"/>',
  consigli: '<path d="M12 21c4.5-1.6 7-5.3 7-10.5V4.5C13 4.5 8 6 6.3 11.4"/><path d="M5 21c1.5-5 4.5-8.5 9-10.5"/>',
  profilo: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
};
const icon = (name, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;

// ---------- routing ----------

const VIEWS = { oggi: viewOggi, checkin: viewCheckin, analisi: viewAnalisi, consigli: viewConsigli, profilo: viewProfilo, info: viewInfo, benvenuto: viewBenvenuto };
const TABS = [
  { route: 'oggi', label: 'Diario', icon: 'diario' },
  { route: 'analisi', label: 'Analisi', icon: 'analisi' },
  { route: 'consigli', label: 'Consigli', icon: 'consigli' },
  { route: 'profilo', label: 'Profilo', icon: 'profilo' },
];

const route = () => location.hash.replace(/^#\/?/, '').split('?')[0] || 'oggi';

function render() {
  let name = route();
  if (!state.profile && name !== 'benvenuto' && name !== 'info') {
    location.replace('#/benvenuto');
    return;
  }
  if (!VIEWS[name]) name = 'oggi';
  if (name === 'benvenuto' && !ui.draft) {
    ui.draft = structuredClone(state.profile || defaultProfile());
    ui.step = state.profile ? 1 : 0;
  }
  if (name === 'checkin' && ui.lastRoute !== 'checkin') ui.ck = 0;
  app.innerHTML = VIEWS[name]();
  const fullscreen = name === 'benvenuto' || name === 'checkin';
  tabbar.hidden = fullscreen;
  document.body.classList.toggle('no-tabs', fullscreen);
  tabbar.innerHTML = TABS.map(t => `
    <a href="#/${t.route}" class="tab ${name === t.route ? 'on' : ''}" ${name === t.route ? 'aria-current="page"' : ''}>
      ${icon(t.icon)}<span>${t.label}</span>
    </a>`).join('');
  if (ui.lastRoute !== name) {
    window.scrollTo(0, 0);
    ui.lastRoute = name;
  }
}

// ---------- componenti ----------

function pageHead(title, sub = '', right = '') {
  return `<header class="head"><div><h1>${title}</h1>${sub ? `<p class="sub">${sub}</p>` : ''}</div>${right}</header>`;
}

function segmented(action, current, options) {
  return `<div class="seg" role="tablist">${options.map(([value, label]) => `
    <button role="tab" aria-selected="${current === value}" class="${current === value ? 'on' : ''}" data-action="${action}" data-mode="${value}">${label}</button>`).join('')}</div>`;
}

function ring(label, pctValue, main, sub) {
  const pct = Math.max(0, Math.min(1, pctValue));
  const r = 27;
  const c = 2 * Math.PI * r;
  return `<div class="ring">
    <div class="ring-chart">
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle class="ring-bg" cx="32" cy="32" r="${r}"/>
        <circle class="ring-fg ${pct >= 1 ? 'done' : ''}" cx="32" cy="32" r="${r}" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${(c * (1 - pct)).toFixed(2)}"/>
      </svg>
      <span class="ring-pct">${main}</span>
    </div>
    <div class="ring-label">${label}</div>
    <div class="ring-sub">${sub}</div>
  </div>`;
}

const STATUS_LABEL = { ok: 'Raggiunto', quasi: 'Quasi', basso: 'Basso' };

function badge(e) {
  if (e.over) return `<span class="badge st-over">Oltre UL</span>`;
  return `<span class="badge st-${e.status}" title="${STATUS_LABEL[e.status]}">${fmt(Math.min(e.pct, 999))}%</span>`;
}

const SOURCE_META = [
  { key: 'diario', label: 'Diario (vegetali registrati)' },
  { key: 'profilo', label: 'Carne, pesce, uova, latticini (stima dal profilo)' },
  { key: 'integratori', label: 'Integratori' },
  { key: 'altro', label: 'Sale iodato e sole (stima)' },
];

function sourceBar(key, target, sources) {
  let used = 0;
  const segs = SOURCE_META.map(s => {
    const w = Math.min(((sources[s.key][key] || 0) / target) * 100, 100 - used);
    used += Math.max(0, w);
    return w > 0.3 ? `<span class="segm src-${s.key}" style="width:${w.toFixed(2)}%"></span>` : '';
  }).join('');
  return `<div class="bar" aria-hidden="true">${segs}</div>`;
}

function plainBar(pct, status) {
  return `<div class="bar" aria-hidden="true"><span class="segm st-fill-${status}" style="width:${Math.min(100, pct).toFixed(2)}%"></span></div>`;
}

function evidenceTag(level) {
  return `<span class="ev ev-${level}" title="${esc(EVIDENCE[level].desc)}">${EVIDENCE[level].label}</span>`;
}

// ---------- Diario ----------

function foodRow(f, p) {
  const unit = f.unit;
  return `<div class="food ${p ? 'has' : ''}">
    <div class="food-main">
      <div class="food-name">${esc(f.name)}</div>
      <div class="food-portion">${esc(f.portion)} · ${f.g} ${unit}${p && p !== 1 ? ` · <b>${fmt(f.g * p)} ${unit}</b>` : ''}</div>
      ${f.note ? `<div class="food-note">${esc(f.note)}</div>` : ''}
    </div>
    <div class="stepper">
      <button class="step" data-action="dec" data-id="${f.id}" aria-label="Togli mezza porzione: ${esc(f.name)}" ${p ? '' : 'disabled'}>−</button>
      <span class="qty">${fmtPortion(p)}</span>
      <button class="step plus" data-action="inc" data-id="${f.id}" aria-label="Aggiungi una porzione: ${esc(f.name)}">+</button>
    </div>
  </div>`;
}

function foodList(onlyCat = null) {
  const q = norm(ui.search.trim());
  let list;
  if (onlyCat) list = FOODS.filter(f => f.cat === onlyCat);
  else if (q) list = FOODS.filter(f => norm(`${f.name} ${f.alias}`).includes(q));
  else list = FOODS.filter(f => f.cat === ui.cat);
  if (!list.length) return `<p class="empty">Nessun alimento trovato. Prova un altro nome o scegli una categoria.</p>`;
  const log = state.logs[ui.date] || [];
  return list.map(f => foodRow(f, log.find(e => e.id === f.id)?.p || 0)).join('');
}

function changePortion(id, delta) {
  const list = state.logs[ui.date] ? [...state.logs[ui.date]] : [];
  const i = list.findIndex(e => e.id === id);
  const next = Math.max(0, Math.min(10, (i >= 0 ? list[i].p : 0) + delta));
  if (i >= 0) list[i] = { id, p: next };
  else if (next > 0) list.push({ id, p: next });
  const clean = list.filter(e => e.p > 0);
  if (clean.length) state.logs[ui.date] = clean;
  else delete state.logs[ui.date];
  persist();
}

function reminderDue() {
  const [h, m] = state.settings.reminderTime.split(':').map(Number);
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes() >= h * 60 + m;
}

function viewOggi() {
  const key = ui.date;
  const today = dateKey();
  const day = computeDay(state, key);
  const targets = getTargets(state.profile);
  const evals = evaluate(day.totals, targets, day.sources.integratori);
  const reached = evals.filter(e => e.status === 'ok').length;

  const dateNav = `<div class="datenav">
    <button class="icon-btn" data-action="date-prev" aria-label="Giorno precedente">‹</button>
    <button class="date-label" data-action="date-today" title="Torna a oggi">${esc(dayLabel(key))}</button>
    <button class="icon-btn" data-action="date-next" aria-label="Giorno successivo" ${key >= today ? 'disabled' : ''}>›</button>
  </div>`;

  const banner = key === today && !day.logged && reminderDue()
    ? `<a class="banner" href="#/checkin">${icon('bell')}<div><b>È l'ora del check-in</b><span>Cosa hai mangiato oggi? Ci vuole un minuto.</span></div><span class="chev">›</span></a>`
    : '';

  const logged = day.items.length
    ? `<section class="card">
        <div class="card-head"><h2>Registrato ${key === today ? 'oggi' : esc(dayLabel(key).toLowerCase())}</h2><span class="muted small">${day.items.length} ${plural(day.items.length, 'alimento', 'alimenti')}</span></div>
        <ul class="logged">${day.items.map(it => `
          <li><span><span class="li-icon" aria-hidden="true">${CATEGORIES.find(c => c.key === it.food.cat).icon}</span>${esc(it.food.name)}</span>
            <span class="muted">${fmtPortion(it.portions)} ${plural(it.portions, 'porz.', 'porz.')} · ${fmt(it.grams)} ${it.food.unit}</span>
            <button class="x" data-action="remove" data-id="${it.food.id}" aria-label="Rimuovi ${esc(it.food.name)}">×</button></li>`).join('')}
        </ul>
        <a class="btn ghost block" href="#/analisi">Vedi cosa hai coperto ›</a>
      </section>`
    : '';

  return `
    ${pageHead('Diario', 'Vegetali, legumi, cereali e semi', dateNav)}
    ${banner}
    <section class="summary">
      ${ring('Frutta e verdura', day.groups.fv / 400, fmt(Math.min(999, (day.groups.fv / 400) * 100)) + '%', `${fmt(day.groups.fv)} / 400 g`)}
      ${ring('Fibre', day.totals.fibre / targets.fibre, fmt(Math.min(999, (day.totals.fibre / targets.fibre) * 100)) + '%', `${fmt(day.totals.fibre, 1)} / ${targets.fibre} g`)}
      ${ring('Obiettivi', reached / evals.length, `${reached}`, `su ${evals.length} nutrienti`)}
    </section>
    <a class="btn primary block checkin-cta" href="#/checkin">Check-in guidato · 6 domande</a>
    <section class="card picker">
      <label class="search">${icon('search')}<input id="search" type="search" placeholder="Cerca un alimento…" value="${esc(ui.search)}" autocomplete="off" aria-label="Cerca un alimento"></label>
      <div class="cats" role="tablist">${CATEGORIES.map(c => `
        <button role="tab" aria-selected="${!ui.search && ui.cat === c.key}" class="cat ${!ui.search && ui.cat === c.key ? 'on' : ''}" data-action="cat" data-cat="${c.key}">${c.icon} ${esc(c.short || c.label)}</button>`).join('')}
      </div>
      <p class="hint">Il primo + aggiunge una porzione, i successivi mezza.</p>
      <div id="foodlist" class="foodlist">${foodList()}</div>
    </section>
    ${logged}`;
}

function viewCheckin() {
  const c = CATEGORIES[ui.ck];
  const last = ui.ck === CATEGORIES.length - 1;
  const count = (state.logs[ui.date] || []).filter(e => FOOD_BY_ID[e.id]?.cat === c.key).length;
  return `
    ${pageHead('Check-in', `${esc(dayLabel(ui.date))} · ${ui.ck + 1} di ${CATEGORIES.length}`, `<a class="icon-btn" href="#/oggi" aria-label="Chiudi il check-in">×</a>`)}
    <div class="dots" aria-hidden="true">${CATEGORIES.map((_, i) => `<span class="${i <= ui.ck ? 'on' : ''}"></span>`).join('')}</div>
    <section class="card">
      <h2 class="ck-q"><span>${c.icon}</span> ${esc(c.q)}</h2>
      <p class="hint">Il primo + aggiunge una porzione, i successivi mezza. Se non ne hai mangiato, vai avanti.</p>
      <div class="foodlist">${foodList(c.key)}</div>
    </section>
    <div class="sticky-nav">
      <button class="btn ghost" data-action="ck-prev" ${ui.ck === 0 ? 'disabled' : ''}>Indietro</button>
      <button class="btn primary" data-action="ck-next">${last ? 'Vedi il risultato' : count ? 'Avanti' : 'Niente, avanti'}</button>
    </div>`;
}

// ---------- Analisi ----------

function nutrientDetail(e, data) {
  const div = e.div || 1;
  const sources = SOURCE_META
    .map(s => ({ ...s, v: data.sources[s.key][e.key] || 0 }))
    .filter(s => s.v > 0.0005);
  const foods = data.items
    .map(it => ({ name: it.food.name, v: it.c[e.key] || 0 }))
    .filter(x => x.v > 0)
    .sort((a, b) => b.v - a.v)
    .slice(0, 4);
  const animal = animalBreakdown(state.profile)
    .map(a => ({ name: a.label, v: a.c[e.key] || 0 }))
    .filter(x => x.v > 0)
    .sort((a, b) => b.v - a.v)
    .slice(0, 3);
  const list = arr => arr.map(x => `${esc(x.name)} ${fmt(x.v / div, e.dp)}`).join(' · ');
  return `<div class="ndetail">
    <p>${esc(e.info)}</p>
    ${e.over ? `<p class="warn">Supera il livello massimo tollerabile: ${fmt(e.ul.value)} ${e.unit} (${esc(e.ul.src)}).</p>` : ''}
    ${sources.length ? `<dl class="kv">${sources.map(s => `<dt><span class="dot src-${s.key}"></span>${s.label}</dt><dd>${fmt(s.v / div, e.dp)} ${e.unit}</dd>`).join('')}</dl>` : ''}
    ${foods.length ? `<p class="small"><b>Dal diario:</b> ${list(foods)}</p>` : ''}
    ${animal.length ? `<p class="small"><b>Dal profilo:</b> ${list(animal)}</p>` : ''}
    <p class="ref">${evidenceTag(e.evidence)} <span>${esc(e.ref)}</span></p>
  </div>`;
}

function nutrientRow(e, data) {
  const open = ui.open === e.key;
  const div = e.div || 1;
  return `<div class="nrow ${open ? 'open' : ''}">
    <button class="nrow-btn" data-action="toggle" data-key="${e.key}" aria-expanded="${open}">
      <span class="nname">${esc(e.name)}</span>
      <span class="nval">${fmt(e.value / div, e.dp)} <small>/ ${fmt(e.target / div, e.dp)} ${e.unit}</small></span>
      ${badge(e)}
    </button>
    ${sourceBar(e.key, e.target, data.sources)}
    ${open ? nutrientDetail(e, data) : ''}
  </div>`;
}

function groupRow(g, scopeLabel) {
  const key = `g-${g.key}`;
  const open = ui.open === key;
  const unit = g.kind === 'daily' ? `${g.unit}/die` : g.unit === 'porzioni' ? plural(g.target, 'porzione', 'porzioni') : g.unit;
  return `<div class="nrow ${open ? 'open' : ''}">
    <button class="nrow-btn" data-action="toggle" data-key="${key}" aria-expanded="${open}">
      <span class="nname">${esc(g.label)} <small class="muted">${scopeLabel(g)}</small></span>
      <span class="nval">${fmt(g.value, g.kind === 'daily' ? 0 : 1)} <small>/ ${fmt(g.target, 1)} ${unit}</small></span>
      <span class="badge st-${g.status}">${fmt(Math.min(g.pct, 999))}%</span>
    </button>
    ${plainBar(g.pct, g.status)}
    ${open ? `<div class="ndetail"><p>${esc(g.info)}</p>${g.scaled ? '<p class="small muted">Obiettivo ridotto in proporzione ai giorni registrati.</p>' : ''}<p class="ref">${evidenceTag(g.evidence)} <span>${esc(g.ref)}</span></p></div>` : ''}
  </div>`;
}

function viewAnalisi() {
  const week = ui.anMode === 'settimana';
  const targets = getTargets(state.profile);
  const wk = computeWeek(state, ui.date);
  const data = week ? wk : computeDay(state, ui.date);
  const evals = evaluate(data.totals, targets, data.sources.integratori);
  const groups = evaluateGroups(week
    ? { daily: wk.groups, dailyDays: wk.loggedDays, week: wk.groups, weekDays: wk.loggedDays }
    : { daily: data.groups, dailyDays: 1, week: wk.groups, weekDays: wk.loggedDays });
  const counts = { ok: 0, quasi: 0, basso: 0 };
  evals.forEach(e => counts[e.status]++);
  const low = evals.filter(e => e.status === 'basso');

  const sub = week
    ? wk.loggedDays ? `Media di ${wk.loggedDays} ${plural(wk.loggedDays, 'giorno registrato', 'giorni registrati')} su 7` : 'Nessun giorno registrato negli ultimi 7'
    : esc(dayLabel(ui.date));
  const emptyNote = (week ? !wk.loggedDays : !data.logged)
    ? `<div class="note">Nessun vegetale registrato: vedi solo la stima dal profilo (carne, pesce, latticini, integratori). <a href="#/checkin">Fai il check-in ›</a></div>`
    : '';
  const scopeLabel = g => (g.kind === 'weekly' ? '· 7 gg' : week ? '· media' : '');

  return `
    ${pageHead('Analisi', sub)}
    ${segmented('an-mode', ui.anMode, [['giorno', 'Giorno'], ['settimana', 'Ultimi 7 giorni']])}
    ${emptyNote}
    <section class="card score">
      <div class="score-main"><b>${counts.ok}</b><span>/ ${evals.length}</span></div>
      <div class="score-text">
        <div>obiettivi raggiunti</div>
        <div class="score-pills"><span class="pill st-quasi">${counts.quasi} quasi</span><span class="pill st-basso">${counts.basso} bassi</span></div>
      </div>
    </section>
    ${low.length ? `<div class="lowlist"><span class="muted small">Da migliorare:</span> ${low.map(e => `<span class="chip">${esc(e.short)}</span>`).join('')} <a class="small" href="#/consigli">Cosa mangiare ›</a></div>` : ''}
    <div class="legend">${SOURCE_META.map(s => `<span><i class="dot src-${s.key}"></i>${s.key === 'profilo' ? 'Profilo' : s.key === 'altro' ? 'Sale/sole' : s.label.split(' (')[0]}</span>`).join('')}</div>
    ${NUTRIENT_GROUPS.map(g => `
      <section class="card">
        <h2>${g.label}</h2>
        ${g.intro ? `<p class="intro">${esc(g.intro)}</p>` : ''}
        ${evals.filter(e => e.group === g.key).map(e => nutrientRow(e, data)).join('')}
      </section>`).join('')}
    <section class="card">
      <h2>Gruppi alimentari protettivi</h2>
      <p class="intro">Le evidenze più solide riguardano gli alimenti interi, non le singole molecole.</p>
      ${groups.map(g => groupRow(g, scopeLabel)).join('')}
    </section>
    <p class="disclaimer">Il valore di riferimento (PRI) copre il fabbisogno del 97,5% delle persone: stare sotto non significa essere carenti, ma più ci si allontana più aumenta la probabilità di non coprire il proprio fabbisogno. Conta la media nel tempo, non il singolo giorno. <a href="#/info">Metodo e fonti</a></p>`;
}

// ---------- Consigli ----------

const GROUP_GAIN_LABEL = { fv: v => `+${fmt(v)} g frutta e verdura`, integrali: () => 'Cereali integrali', secca: () => 'Frutta secca', legumi: () => 'Legumi', foglia: () => 'Foglia verde', crucifere: () => 'Crucifere', bosco: () => 'Frutti di bosco' };

function pickRow(p, canEat) {
  const cat = CATEGORIES.find(c => c.key === p.food.cat);
  return `<div class="pick">
    <div class="pick-icon" aria-hidden="true">${cat.icon}</div>
    <div class="pick-body">
      <div class="pick-name">${esc(p.food.name)}</div>
      <div class="pick-portion">${esc(p.food.portion)} · ${p.food.g} ${p.food.unit}</div>
    </div>
    ${canEat ? `<button class="btn small" data-action="eat" data-id="${p.food.id}" aria-label="Segna come mangiato: ${esc(p.food.name)}">Mangiato</button>` : '<span></span>'}
    <div class="gains">
      ${p.gains.map(g => `<span class="gain">${esc(NUTRIENT_BY_KEY[g.key].short)} +${fmt(g.pct)}%</span>`).join('')}
      ${p.groupGains.map(g => `<span class="gain grp">${esc(GROUP_GAIN_LABEL[g.key](g.value))}</span>`).join('')}
    </div>
  </div>`;
}

function viewConsigli() {
  const week = ui.coMode === 'settimana';
  const targets = getTargets(state.profile);
  const day = computeDay(state, ui.date);
  const wk = computeWeek(state, ui.date);
  const rec = recommend(state, ui.date, week ? 'settimana' : 'giorno');
  const evals = evaluate((week && wk.loggedDays ? wk : day).totals, targets, day.sources.integratori);
  const cards = adviceCards(state, ui.date, evals, wk);
  const isToday = ui.date === dateKey();

  const sub = week ? 'In base alla media degli ultimi 7 giorni' : isToday ? 'Per completare la giornata' : `Per completare: ${esc(dayLabel(ui.date).toLowerCase())}`;
  const picks = rec.picks.length
    ? `<section class="card">
        <h2>${week ? 'Da mangiare più spesso' : 'Cosa aggiungere'}</h2>
        <p class="intro">${week
          ? `Inseriscili nei prossimi giorni. Aggiunti a una giornata media passeresti da <b>${rec.before}</b> a <b>${rec.after}</b> obiettivi su ${rec.total}.`
          : `Ora sei a <b>${rec.before}</b> obiettivi su ${rec.total}: con questi alimenti arriveresti a <b>${rec.after}</b>.`}</p>
        ${rec.picks.map(p => pickRow(p, !week)).join('')}
        <p class="small muted">Le percentuali indicano quanto della lacuna di ciascun nutriente copre una porzione.</p>
      </section>`
    : `<section class="card done"><h2>Ottimo lavoro</h2><p>Con gli alimenti vegetali hai già coperto quasi tutti gli obiettivi raggiungibili. Guarda sotto i consigli per il tuo profilo.</p></section>`;

  return `
    ${pageHead('Consigli', sub)}
    ${segmented('co-mode', ui.coMode, [['giorno', 'Giorno'], ['settimana', 'Settimana']])}
    ${picks}
    ${cards.length ? `<h2 class="section-title">Per il tuo profilo</h2>${cards.map(c => `
      <article class="advice lvl-${c.level}"><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></article>`).join('')}` : ''}
    <p class="disclaimer">Consigli generali di prevenzione basati su linee guida e letteratura scientifica: non sostituiscono il parere del medico o del dietista, in particolare in caso di malattie, gravidanza o farmaci.</p>`;
}

// ---------- Profilo ----------

function profileSummary(p) {
  const diet = dietOf(p);
  const freq = allowedAnimal(p)
    .filter(a => Number(p.freq?.[a.key]) > 0)
    .map(a => `${a.label} ${fmt(p.freq[a.key], 1)}/${a.per === 'giorno' ? 'die' : 'sett.'}`);
  const supp = SUPPLEMENTS.filter(s => p.integratori?.[s.key] > 0).map(s => `${s.label} ${fmt(p.integratori[s.key], 1)} ${s.unit}`);
  const cond = p.sesso === 'F' && p.condizione !== 'nessuna' ? CONDITIONS.find(c => c.key === p.condizione)?.label : '';
  const rows = [
    ['Chi sei', `${p.sesso === 'F' ? 'Donna' : 'Uomo'}, ${p.eta} anni${cond ? ` · ${cond}` : ''}${p.fumo ? ' · fumatore' : ''}`],
    ['Alimentazione', diet.label],
    ['Frequenze', freq.join(' · ') || 'Nessun alimento animale'],
    ['Sole (apr–set)', SUN.find(s => s.key === p.sole)?.label],
    ['Sale iodato', SALT.find(s => s.key === p.sale)?.label],
    ['Integratori', supp.join(' · ') || 'Nessuno'],
  ];
  return `<dl class="profile-dl">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`;
}

function reminderCard() {
  const perm = notify.permission();
  const active = state.settings.notifications && perm === 'granted';
  const status = perm === 'unsupported'
    ? 'Questo browser non supporta le notifiche: usa il promemoria nel calendario.'
    : perm === 'denied'
      ? 'Notifiche bloccate nelle impostazioni del browser: usa il promemoria nel calendario.'
      : active ? 'Notifiche attive mentre l\'app è aperta o in background.' : 'Notifiche non attive.';
  return `<section class="card">
    <h2>Promemoria serale</h2>
    <div class="field inline">
      <label for="reminder">Orario del check-in</label>
      <input id="reminder" type="time" value="${esc(state.settings.reminderTime)}" data-setting="reminderTime">
    </div>
    <p class="small muted">${status}</p>
    <div class="btn-row">
      ${active
        ? `<button class="btn ghost" data-action="notif-test">Prova notifica</button><button class="btn ghost" data-action="notif-off">Disattiva</button>`
        : perm === 'default' ? `<button class="btn primary" data-action="notif-on">${icon('bell')} Attiva notifiche</button>` : ''}
      <button class="btn ghost" data-action="ics">Aggiungi al calendario</button>
    </div>
    <p class="small muted">Il promemoria nel calendario (.ics) ti avvisa ogni giorno all'orario scelto anche ad app chiusa, su iPhone e Android.</p>
  </section>`;
}

function viewProfilo() {
  const days = Object.keys(state.logs).length;
  return `
    ${pageHead('Profilo')}
    <section class="card">
      <div class="card-head"><h2>I tuoi dati</h2><button class="btn small ghost" data-action="edit-profile">Modifica</button></div>
      ${profileSummary(state.profile)}
    </section>
    ${reminderCard()}
    <section class="card">
      <h2>Dati</h2>
      <p class="small muted">Tutto resta su questo dispositivo: ${days} ${plural(days, 'giorno registrato', 'giorni registrati')}. Esporta un backup per spostarli su un altro dispositivo.</p>
      <div class="btn-row">
        <button class="btn ghost" data-action="export">Esporta backup</button>
        <button class="btn ghost" data-action="import">Importa backup</button>
        <button class="btn ghost danger" data-action="reset">Cancella tutto</button>
      </div>
      <input type="file" id="import-file" accept="application/json,.json" hidden>
    </section>
    <a class="card link-card" href="#/info"><div><h2>Metodo, fonti e limiti</h2><p class="small muted">Da dove vengono obiettivi, dati e consigli</p></div><span class="chev">›</span></a>
    <p class="disclaimer">MicroNutri è uno strumento educativo di prevenzione. Le stime sono approssimate e non sostituiscono esami, diagnosi o il parere di un professionista sanitario.</p>`;
}

// ---------- Metodo e fonti ----------

function viewInfo() {
  return `
    ${pageHead('Metodo e fonti', '', `<a class="icon-btn" href="${state.profile ? '#/profilo' : '#/benvenuto'}" aria-label="Indietro">‹</a>`)}
    <article class="card prose">
      <h2>Come funziona la stima</h2>
      <p>Ogni giorno registri solo gli alimenti vegetali: frutta, verdura, legumi, cereali, frutta secca e semi, più olio, cacao, tè e caffè. Carne, pesce, uova e latticini li stimiamo dalle frequenze settimanali del profilo, perché variano poco e chiederli ogni giorno sarebbe faticoso. A questi si aggiungono integratori, sale iodato e, da aprile a settembre, una stima prudente della vitamina D prodotta al sole.</p>
      <p>Nel calcolo: per le verdure di solito cotte la vitamina C è ridotta del 30% e i folati del 25%; il calcio di spinaci e bietole è conteggiato al 20% per via degli ossalati; le patate non contano come porzione di frutta e verdura e la frutta essiccata vale tre volte il suo peso.</p>

      <h2>Obiettivi</h2>
      <p>Vitamine e minerali seguono i <b>LARN 2014</b> della Società Italiana di Nutrizione Umana (PRI o AI per adulti), adattati a sesso, età, gravidanza e allattamento. Per chi segue una dieta vegetariana o vegana l'obiettivo del ferro è moltiplicato per 1,8 e quello dello zinco per 1,5, come indicato dall'Institute of Medicine per la minore biodisponibilità. Per chi fuma la vitamina C sale di 35 mg.</p>
      <p>Il PRI è pensato per coprire il fabbisogno di quasi tutta la popolazione (97,5%): è un obiettivo prudente, non una soglia di carenza. Per questo conviene guardare soprattutto la media degli ultimi 7 giorni.</p>
      <p>Non monitoriamo niacina, acido pantotenico, biotina, fosforo, rame e manganese: la carenza è rarissima con qualsiasi dieta.</p>

      <h2>Livelli di evidenza</h2>
      <p>${evidenceTag('ref')} fabbisogno ufficiale (LARN, EFSA, IOM).</p>
      <p>${evidenceTag('mod')} obiettivo da meta-analisi o grandi studi di coorte (frutta e verdura, cereali integrali, legumi, frutta secca, polifenoli).</p>
      <p>${evidenceTag('lim')} obiettivo indicativo da studi osservazionali o con dati di composizione incerti (luteina, licopene, varietà vegetale, crucifere, frutti di bosco).</p>

      <h2>Antiossidanti: cibi sì, integratori no</h2>
      <p>Le associazioni positive riguardano frutta, verdura, legumi e cereali integrali. Gli studi randomizzati sugli integratori di antiossidanti non hanno mostrato benefici sulla mortalità (revisione Cochrane, Bjelakovic 2012) e il beta-carotene ha aumentato il tumore al polmone nei fumatori (studi ATBC e CARET). L'app quindi non consiglia mai integratori antiossidanti.</p>

      <h2>Dati sugli alimenti</h2>
      <p>Composizione da USDA FoodData Central e tabelle CREA, arrotondata. I polifenoli vengono da Phenol-Explorer e sono la stima più incerta: considerali ordini di grandezza. Il contenuto reale varia con varietà, stagione, conservazione e cottura.</p>

      <h2>Limiti</h2>
      <p>È uno strumento educativo, non un dispositivo medico. Non diagnostica carenze: per quello servono esami del sangue e un medico. Se hai malattie, sei in gravidanza o assumi farmaci (ad esempio anticoagulanti, per i quali la vitamina K conta), confrontati con un professionista prima di cambiare alimentazione o integratori.</p>

      <h2>Bibliografia essenziale</h2>
      <ul class="refs">
        <li>SINU. LARN – Livelli di Assunzione di Riferimento di Nutrienti ed energia, IV revisione, 2014.</li>
        <li>EFSA. Dietary Reference Values for nutrients, Summary report, 2017 (e aggiornamenti su selenio 2023 e ferro 2024).</li>
        <li>Institute of Medicine. Dietary Reference Intakes for Vitamin A, K, … Iron, Zinc, 2001.</li>
        <li>CREA. Linee guida per una sana alimentazione, 2018.</li>
        <li>Aune D. et al. Fruit and vegetable intake and the risk of cardiovascular disease, total cancer and all-cause mortality. Int J Epidemiol 2017.</li>
        <li>Aune D. et al. Whole grain consumption and risk of cardiovascular disease, cancer, and all cause mortality. BMJ 2016.</li>
        <li>Reynolds A. et al. Carbohydrate quality and human health: a series of systematic reviews and meta-analyses. Lancet 2019.</li>
        <li>Estruch R. et al. Primary prevention of cardiovascular disease with a Mediterranean diet supplemented with extra-virgin olive oil or nuts (PREDIMED). NEJM 2018.</li>
        <li>Tresserra-Rimbau A. et al. Polyphenol intake and mortality risk: a re-analysis of the PREDIMED trial. BMC Med 2014.</li>
        <li>Bondonno N.P. et al. Flavonoid intake is associated with lower mortality in the Danish Diet Cancer and Health Cohort. Nat Commun 2019.</li>
        <li>Morris M.C. et al. MIND diet associated with reduced incidence of Alzheimer's disease. Alzheimers Dement 2015.</li>
        <li>Bjelakovic G. et al. Antioxidant supplements for prevention of mortality. Cochrane Database Syst Rev 2012.</li>
        <li>IARC Monographs vol. 114. Red meat and processed meat, 2018.</li>
        <li>McDonald D. et al. American Gut: an open platform for citizen science microbiome research. mSystems 2018.</li>
        <li>Rothwell J.A. et al. Phenol-Explorer 3.0. Database (Oxford) 2013.</li>
      </ul>
    </article>`;
}

// ---------- Profilo guidato ----------

function opt(field, value, label, desc = '') {
  const on = JSON.stringify(ui.draft[field]) === JSON.stringify(value);
  return `<button class="opt ${on ? 'on' : ''}" aria-pressed="${on}" data-action="ob-set" data-field="${field}" data-value='${esc(JSON.stringify(value))}'>
    <b>${esc(label)}</b>${desc ? `<span>${esc(desc)}</span>` : ''}</button>`;
}

function obWelcome() {
  return `<div class="welcome">
    <div class="logo" aria-hidden="true"><img src="icons/icon.svg" alt="" width="72" height="72"></div>
    <h1>MicroNutri</h1>
    <p class="lead">Vitamine, minerali, fibre e composti protettivi di frutta, verdura, legumi e cereali, con obiettivi basati sulle evidenze scientifiche.</p>
    <ul class="features">
      <li><b>Un check-in al giorno.</b> La sera ti chiediamo cosa hai mangiato: bastano pochi tocchi.</li>
      <li><b>Cosa hai coperto e cosa manca.</b> 23 nutrienti e 8 gruppi alimentari protettivi, oggi e in media settimanale.</li>
      <li><b>Cosa mangiare.</b> Gli alimenti e le porzioni che colmano le tue lacune.</li>
    </ul>
    <p class="note">Prima qualche domanda su di te: serve a stimare fabbisogni e apporti di carne, pesce e latticini senza chiederteli ogni giorno. I dati restano sul tuo dispositivo.</p>
  </div>`;
}

const showCondition = d => d.sesso === 'F' && Number(d.eta) < 56;

function obChi(d) {
  return `<h2>Chi sei</h2>
    <p class="intro">I fabbisogni cambiano con sesso, età e condizioni particolari.</p>
    <div class="field"><span class="label">Sesso biologico</span><div class="opts two">${opt('sesso', 'F', 'Donna')}${opt('sesso', 'M', 'Uomo')}</div></div>
    <div class="field"><label class="label" for="eta">Età</label><input id="eta" type="number" inputmode="numeric" min="18" max="110" value="${esc(d.eta)}" data-bind="eta"></div>
    <div class="field" id="cond-field" ${showCondition(d) ? '' : 'hidden'}><span class="label">Condizione</span><div class="opts two">${CONDITIONS.map(c => opt('condizione', c.key, c.label)).join('')}</div></div>
    <div class="field"><span class="label">Fumi?</span><div class="opts two">${opt('fumo', false, 'No')}${opt('fumo', true, 'Sì')}</div></div>`;
}

function freqRow(a, value) {
  const step = a.step || 1;
  const unit = a.per === 'giorno' ? 'al giorno' : a.unit ? `${a.unit}/sett.` : 'a settimana';
  return `<div class="freq">
    <div><div class="freq-name">${esc(a.label)}</div><div class="freq-hint">${esc(a.hint)}</div></div>
    <div class="stepper">
      <button class="step" data-action="freq" data-key="${a.key}" data-d="${-step}" aria-label="Meno ${esc(a.label)}" ${value > 0 ? '' : 'disabled'}>−</button>
      <span class="qty">${fmt(value, 1)}<small>${unit}</small></span>
      <button class="step plus" data-action="freq" data-key="${a.key}" data-d="${step}" aria-label="Più ${esc(a.label)}">+</button>
    </div>
  </div>`;
}

function obDieta(d) {
  const animals = allowedAnimal(d);
  return `<h2>Come mangi</h2>
    <p class="intro">Carne, pesce, uova e latticini non te li chiederemo ogni giorno: ci basta una stima della settimana tipo.</p>
    <div class="opts">${DIETS.map(x => opt('dieta', x.key, x.label, x.desc)).join('')}</div>
    ${animals.length ? `<div class="field"><span class="label">Quante porzioni in una settimana tipo?</span>${animals.map(a => freqRow(a, Number(d.freq[a.key]) || 0)).join('')}</div>` : '<p class="note">Con una dieta vegana fai particolare attenzione a B12, vitamina D, calcio, iodio, omega-3, ferro e zinco: l\'app li evidenzierà.</p>'}`;
}

function obExtra(d) {
  return `<h2>Sole e integratori</h2>
    <div class="field"><span class="label">Da aprile a settembre, quanto tempo passi al sole con braccia o gambe scoperte nelle ore centrali?</span>
      <div class="opts">${SUN.map(s => opt('sole', s.key, s.label)).join('')}</div></div>
    <div class="field"><span class="label">Usi sale iodato?</span><div class="opts">${SALT.map(s => opt('sale', s.key, s.label)).join('')}</div></div>
    <div class="field"><span class="label">Integratori che prendi regolarmente</span>
      ${SUPPLEMENTS.map(s => {
        const on = d.integratori[s.key] > 0;
        return `<div class="supp ${on ? 'on' : ''}">
          <label class="check"><input type="checkbox" data-supp-toggle="${s.key}" ${on ? 'checked' : ''}> ${esc(s.label)}</label>
          ${on ? `<div class="supp-dose"><input type="number" inputmode="decimal" min="0" step="any" value="${esc(d.integratori[s.key])}" data-supp="${s.key}" aria-label="Dose ${esc(s.label)}"><span>${esc(s.unit)}</span></div>${s.hint ? `<p class="small muted">${esc(s.hint)}</p>` : ''}` : ''}
        </div>`;
      }).join('')}
    </div>`;
}

function obPromemoria() {
  const perm = notify.permission();
  return `<h2>Promemoria</h2>
    <p class="intro">Ogni sera ti ricordiamo di fare il check-in: frutta, verdura, legumi, cereali e semi della giornata.</p>
    <div class="field"><label class="label" for="reminder">Orario</label><input id="reminder" type="time" value="${esc(state.settings.reminderTime)}" data-setting="reminderTime"></div>
    <div class="btn-row">
      ${perm === 'default' ? `<button class="btn primary" data-action="notif-on">${icon('bell')} Attiva notifiche</button>` : ''}
      ${perm === 'granted' && state.settings.notifications ? '<span class="pill st-ok">Notifiche attive</span>' : ''}
      <button class="btn ghost" data-action="ics">Aggiungi al calendario</button>
    </div>
    ${perm === 'denied' ? '<p class="small muted">Le notifiche sono bloccate nelle impostazioni di questo browser.</p>' : ''}
    ${perm === 'unsupported' ? '<p class="small muted">Questo browser non supporta le notifiche web. Su iPhone servono iOS 16.4+ e l\'app aggiunta alla schermata Home.</p>' : ''}
    <p class="small muted">Senza un server le notifiche web arrivano solo con l'app aperta o in background. Il promemoria nel calendario funziona sempre, anche ad app chiusa.</p>`;
}

function viewBenvenuto() {
  const d = ui.draft;
  const editing = !!state.profile;
  const steps = [obWelcome, obChi, obDieta, obExtra, obPromemoria];
  const lastStep = steps.length - 1;
  const progress = ui.step > 0
    ? `<div class="dots" aria-hidden="true">${steps.slice(1).map((_, i) => `<span class="${i + 1 <= ui.step ? 'on' : ''}"></span>`).join('')}</div>`
    : '';
  const nav = ui.step === 0
    ? `<div class="sticky-nav"><button class="btn primary block" data-action="ob-next">Iniziamo</button></div>`
    : `<div class="sticky-nav">
        <button class="btn ghost" data-action="${editing && ui.step === 1 ? 'ob-cancel' : 'ob-prev'}">${editing && ui.step === 1 ? 'Annulla' : 'Indietro'}</button>
        <button class="btn primary" data-action="${ui.step === lastStep ? 'ob-finish' : 'ob-next'}">${ui.step === lastStep ? (editing ? 'Salva' : 'Inizia') : 'Avanti'}</button>
      </div>`;
  return `<div class="ob">${progress}<section class="card ob-body">${steps[ui.step](d)}</section>${nav}</div>`;
}

// ---------- azioni ----------

function reschedule() {
  if (state.settings.notifications && notify.permission() === 'granted') {
    notify.schedule(state.settings.reminderTime, () => !(state.logs[dateKey()] || []).length);
  } else {
    notify.cancel();
  }
}

async function enableNotifications() {
  const res = await notify.requestPermission();
  if (res === 'granted') {
    state.settings.notifications = true;
    persist();
    reschedule();
    toast('Promemoria attivato');
  } else if (res === 'unsupported') {
    toast('Notifiche non supportate qui: usa il promemoria nel calendario');
  } else {
    toast('Permesso non concesso: usa il promemoria nel calendario');
  }
}

const actions = {
  'date-prev': () => { ui.date = addDays(ui.date, -1); },
  'date-next': () => { if (ui.date < dateKey()) ui.date = addDays(ui.date, 1); },
  'date-today': () => { ui.date = dateKey(); },
  cat: el => { ui.cat = el.dataset.cat; ui.search = ''; },
  // Il primo + vale una porzione intera, i successivi mezza.
  inc: el => changePortion(el.dataset.id, (state.logs[ui.date] || []).some(e => e.id === el.dataset.id) ? 0.5 : 1),
  dec: el => changePortion(el.dataset.id, -0.5),
  remove: el => changePortion(el.dataset.id, -99),
  eat: el => {
    changePortion(el.dataset.id, 1);
    toast(`${FOOD_BY_ID[el.dataset.id].name}: aggiunto al diario`);
  },
  'an-mode': el => { ui.anMode = el.dataset.mode; ui.open = null; },
  'co-mode': el => { ui.coMode = el.dataset.mode; },
  toggle: el => { ui.open = ui.open === el.dataset.key ? null : el.dataset.key; },
  'ck-prev': () => { if (ui.ck > 0) { ui.ck--; window.scrollTo(0, 0); } },
  'ck-next': () => {
    if (ui.ck < CATEGORIES.length - 1) {
      ui.ck++;
      window.scrollTo(0, 0);
      return;
    }
    ui.anMode = 'giorno';
    location.hash = '#/analisi';
    return false;
  },

  'ob-set': el => {
    const field = el.dataset.field;
    const value = JSON.parse(el.dataset.value);
    ui.draft[field] = value;
    if (field === 'dieta') ui.draft.freq = { ...dietOf(ui.draft).freq };
    if (field === 'sesso' && value === 'M') ui.draft.condizione = 'nessuna';
  },
  freq: el => {
    const a = ANIMAL.find(x => x.key === el.dataset.key);
    const cur = Number(ui.draft.freq[a.key]) || 0;
    ui.draft.freq[a.key] = Math.max(0, Math.min(a.max || 21, cur + Number(el.dataset.d)));
  },
  'ob-next': () => {
    if (ui.step === 1) {
      const eta = Number(ui.draft.eta);
      if (!(eta >= 18 && eta <= 110)) {
        toast('L\'app è pensata per adulti: inserisci un\'età tra 18 e 110 anni');
        return false;
      }
    }
    ui.step++;
    window.scrollTo(0, 0);
  },
  'ob-prev': () => { ui.step = Math.max(0, ui.step - 1); window.scrollTo(0, 0); },
  'ob-cancel': () => { ui.draft = null; location.hash = '#/profilo'; return false; },
  'ob-finish': () => {
    const d = ui.draft;
    if (!showCondition(d)) d.condizione = 'nessuna';
    state.profile = d;
    ui.draft = null;
    persist();
    reschedule();
    location.hash = '#/oggi';
    return false;
  },
  'edit-profile': () => { ui.draft = null; location.hash = '#/benvenuto'; return false; },

  'notif-on': () => enableNotifications(),
  'notif-off': () => { state.settings.notifications = false; persist(); reschedule(); toast('Notifiche disattivate'); },
  'notif-test': async () => { if (!(await notify.show())) toast('Impossibile mostrare la notifica'); return false; },
  ics: () => { notify.downloadIcs(state.settings.reminderTime, location.href.split('#')[0]); return false; },
  export: () => {
    download(`micronutri-backup-${dateKey()}.json`, JSON.stringify(state, null, 2), 'application/json');
    return false;
  },
  import: () => { document.getElementById('import-file').click(); return false; },
  reset: () => {
    if (!confirm('Cancellare profilo, diario e impostazioni da questo dispositivo? L\'operazione non si può annullare.')) return false;
    state = defaultState();
    persist();
    notify.cancel();
    ui.draft = null;
    location.hash = '#/benvenuto';
    return false;
  },
};

app.addEventListener('click', async e => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const fn = actions[el.dataset.action];
  if (!fn) return;
  e.preventDefault();
  const res = await fn(el);
  if (res !== false) render();
});

// I campi di testo aggiornano lo stato senza ridisegnare la pagina: un ridisegno al "change"
// (che scatta quando si tocca un bottone) farebbe perdere quel tocco.
app.addEventListener('input', e => {
  const el = e.target;
  if (el.id === 'search') {
    ui.search = el.value;
    document.getElementById('foodlist').innerHTML = foodList();
    document.querySelectorAll('.cat').forEach(b => b.classList.toggle('on', !ui.search && b.dataset.cat === ui.cat));
  } else if (el.dataset.bind) {
    ui.draft[el.dataset.bind] = el.type === 'number' ? Number(el.value) : el.value;
    const cond = document.getElementById('cond-field');
    if (cond) cond.hidden = !showCondition(ui.draft);
  }
});

app.addEventListener('change', async e => {
  const el = e.target;
  if (el.dataset.suppToggle) {
    const s = SUPPLEMENTS.find(x => x.key === el.dataset.suppToggle);
    if (el.checked) ui.draft.integratori[s.key] = s.dose;
    else delete ui.draft.integratori[s.key];
    render();
  } else if (el.dataset.supp) {
    const v = Math.max(0, Number(el.value) || 0);
    if (v > 0) ui.draft.integratori[el.dataset.supp] = v;
    else delete ui.draft.integratori[el.dataset.supp];
  } else if (el.dataset.setting) {
    state.settings[el.dataset.setting] = el.value;
    persist();
    reschedule();
  } else if (el.id === 'import-file' && el.files[0]) {
    try {
      const data = JSON.parse(await el.files[0].text());
      if (!isValidBackup(data)) throw new Error('formato');
      if (!confirm('Sostituire i dati attuali con quelli del backup?')) return;
      state = { ...defaultState(), ...data, settings: { ...defaultState().settings, ...(data.settings || {}) } };
      persist();
      reschedule();
      toast('Backup importato');
      location.hash = state.profile ? '#/oggi' : '#/benvenuto';
      render();
    } catch {
      toast('File non valido: serve un backup esportato da MicroNutri');
    }
  }
});

window.addEventListener('hashchange', render);

// Al ritorno sull'app dopo mezzanotte il diario passa al nuovo giorno.
let lastToday = dateKey();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  const now = dateKey();
  if (now !== lastToday) {
    if (ui.date === lastToday) ui.date = now;
    lastToday = now;
    render();
  }
});

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

render();
reschedule();
