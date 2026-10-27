// Motore di calcolo: apporti giornalieri e settimanali, valutazione rispetto agli obiettivi,
// consigli alimentari. Nessuna dipendenza dal DOM: è testabile con node --test.

import { FOODS, FOOD_BY_ID, FOOD_GROUPS, inSeason } from './data/foods.js';
import { NUTRIENTS, TARGET_KEYS, getTargets, UL } from './data/nutrients.js';
import { SUPPLEMENTS, SUN, SALT, WATER, allowedAnimal, allows, freqPerDay, waterMinerals } from './data/profile.js';
import { addDays, parseKey } from './dates.js';

export const KEYS = NUTRIENTS.map(n => n.key);
export const SOURCES = ['diario', 'profilo', 'integratori', 'altro'];

const COOK_LOSS = { vitC: 0.7, folati: 0.75 };
const COUNTED_GROUPS = ['fv', 'integrali', 'secca', 'legumi', 'foglia', 'crucifere', 'bosco'];

const zero = () => Object.fromEntries(KEYS.map(k => [k, 0]));

function addInto(acc, obj, mult = 1) {
  for (const k in obj) if (k in acc) acc[k] += obj[k] * mult;
  return acc;
}

export function foodContribution(food, portions = 1) {
  const grams = food.g * portions;
  const out = {};
  for (const [k, v] of Object.entries(food.n)) {
    let val = (v * grams) / 100;
    if (food.cook && COOK_LOSS[k]) val *= COOK_LOSS[k];
    if (food.bio && food.bio[k] != null) val *= food.bio[k];
    out[k] = val;
  }
  return out;
}

export function groupContribution(food, portions = 1) {
  const grams = food.g * portions;
  const g = {};
  if (food.fv) g.fv = grams * food.fv;
  if (food.groups.includes('integrali')) g.integrali = grams;
  if (food.groups.includes('secca')) g.secca = grams;
  for (const k of ['legumi', 'foglia', 'crucifere', 'bosco']) if (food.groups.includes(k)) g[k] = portions;
  return g;
}

function emptyGroups() {
  const g = Object.fromEntries(COUNTED_GROUPS.map(k => [k, 0]));
  g.plants = new Set();
  return g;
}

// Apporto medio giornaliero da carne, pesce, uova e latticini dichiarati nel profilo.
export function animalBreakdown(profile) {
  return allowedAnimal(profile)
    .map(a => {
      const gramsPerDay = freqPerDay(profile, a) * a.g;
      return { key: a.key, label: a.label, c: addInto(zero(), a.n, gramsPerDay / 100) };
    })
    .filter(a => Object.values(a.c).some(v => v > 0));
}

export function supplementTotals(profile) {
  const out = zero();
  for (const s of SUPPLEMENTS) {
    const dose = Number(profile.integratori?.[s.key]) || 0;
    if (dose > 0) addInto(out, s.n(dose));
  }
  return out;
}

export function isSunSeason(key) {
  const m = parseKey(key).getMonth();
  return m >= 3 && m <= 8; // aprile–settembre
}

export function baseline(profile, key) {
  const profilo = zero();
  for (const a of animalBreakdown(profile)) addInto(profilo, a.c);
  const integratori = supplementTotals(profile);
  const altro = zero();
  const water = waterMinerals(profile);
  altro.calcio += water.calcio;
  altro.magnesio += water.magnesio;
  const salt = SALT.find(s => s.key === profile.sale);
  if (salt) altro.iodio += salt.iodio;
  if (isSunSeason(key)) {
    const sun = SUN.find(s => s.key === profile.sole);
    if (sun) altro.vitD += sun.vitD * (profile.eta >= 70 ? 0.5 : 1);
  }
  return { profilo, integratori, altro };
}

export function computeDay(state, key) {
  const entries = state.logs[key] || [];
  const diario = zero();
  const groups = emptyGroups();
  const items = [];
  for (const e of entries) {
    const food = FOOD_BY_ID[e.id];
    if (!food || !(e.p > 0)) continue;
    const c = foodContribution(food, e.p);
    addInto(diario, c);
    items.push({ food, portions: e.p, grams: food.g * e.p, c });
    const gc = groupContribution(food, e.p);
    for (const k in gc) groups[k] += gc[k];
    if (food.plant) groups.plants.add(food.id);
  }
  const sources = { diario, ...baseline(state.profile, key) };
  const totals = zero();
  for (const s of SOURCES) addInto(totals, sources[s]);
  return { key, logged: items.length > 0, items, sources, totals, groups };
}

// Media sui giorni registrati negli ultimi `days` giorni (fino a endKey compreso).
export function computeWeek(state, endKey, days = 7) {
  const dayResults = [];
  for (let i = days - 1; i >= 0; i--) dayResults.push(computeDay(state, addDays(endKey, -i)));
  const logged = dayResults.filter(d => d.logged);
  const n = logged.length;
  const sources = Object.fromEntries(SOURCES.map(s => [s, zero()]));
  const groups = emptyGroups();
  const byFood = new Map();
  for (const d of logged) {
    for (const s of SOURCES) addInto(sources[s], d.sources[s], 1 / n);
    for (const k of COUNTED_GROUPS) groups[k] += d.groups[k];
    d.groups.plants.forEach(p => groups.plants.add(p));
    for (const it of d.items) {
      const cur = byFood.get(it.food.id) || { food: it.food, portions: 0, grams: 0, c: zero() };
      cur.portions += it.portions;
      cur.grams += it.grams;
      addInto(cur.c, it.c, 1 / n);
      byFood.set(it.food.id, cur);
    }
  }
  const totals = zero();
  for (const s of SOURCES) addInto(totals, sources[s]);
  return { loggedDays: n, days: dayResults, sources, totals, groups, items: [...byFood.values()] };
}

export function statusOf(pct) {
  return pct >= 100 ? 'ok' : pct >= 70 ? 'quasi' : 'basso';
}

// status: 'ok' | 'quasi' | 'basso' per i fabbisogni; 'rif' per i riferimenti; 'info' senza obiettivo.
export function evaluate(totals, targets, supplements = {}) {
  return NUTRIENTS.map(n => {
    const value = totals[n.key] || 0;
    const target = n.kind === 'info' ? null : targets[n.key];
    const pct = target ? (value / target) * 100 : 0;
    const ul = UL[n.key] || null;
    const checked = ul?.scope === 'integratori' ? supplements[n.key] || 0 : value;
    const status = n.kind === 'target' ? statusOf(pct) : n.kind === 'riferimento' ? 'rif' : 'info';
    return { ...n, value, target, pct, status, ul, over: !!ul && checked > ul.value };
  });
}

export const countReached = evals => evals.filter(e => e.kind === 'target' && e.status === 'ok').length;

// daily: gruppi del giorno (o somma della settimana) diviso dailyDays; week: somma 7 giorni.
export function evaluateGroups({ daily, dailyDays, week, weekDays }) {
  const wd = weekDays || 7;
  return FOOD_GROUPS.map(g => {
    let value, target;
    if (g.kind === 'daily') {
      value = dailyDays ? daily[g.key] / dailyDays : 0;
      target = g.target;
    } else {
      value = g.key === 'varieta' ? week.plants.size : week[g.key];
      const scaled = (g.target * wd) / 7;
      target = g.key === 'varieta' ? Math.ceil(scaled) : Math.max(0.5, Math.round(scaled * 2) / 2);
    }
    const pct = (value / target) * 100;
    return { ...g, value, target, pct, status: statusOf(pct), scaled: g.kind === 'weekly' && wd < 7 };
  });
}

// ---------- Consigli ----------

// Pesi nei consigli: 1 per i fabbisogni, salvo eccezioni; i composti non essenziali pesano poco
// (consigliamo alimenti vari, non la caccia a una molecola). 0 = non considerato.
// B12, vitamina D, EPA/DHA e iodio i vegetali non li coprono: se ne occupano i consigli testuali.
const RECO_WEIGHTS = {
  b12: 0, vitD: 0, epadha: 0, iodio: 0,
  fibre: 1.5,
  betaglucani: 0.4, polifenoli: 0.3, luteina: 0.2, licopene: 0.15,
};
const recoWeight = k => RECO_WEIGHTS[k] ?? (TARGET_KEYS.includes(k) ? 1 : 0);
const GROUP_WEIGHTS = { fv: 1.2, legumi: 1, integrali: 1, secca: 0.8, foglia: 0.6, crucifere: 0.6, bosco: 0.4 };
const MIN_SCORE = 0.15;
const OUT_OF_SEASON = 0.3;

function groupGaps(mode, day, week) {
  const gaps = {};
  const wd = Math.max(1, week.loggedDays);
  for (const g of FOOD_GROUPS) {
    if (g.key === 'varieta') continue;
    if (g.kind === 'daily') {
      const current = mode === 'giorno' ? day.groups[g.key] : week.groups[g.key] / wd;
      gaps[g.key] = { gap: Math.max(0, g.target - current), norm: g.target };
    } else {
      const projected = (week.groups[g.key] / wd) * 7;
      const short = Math.max(0, g.target - projected);
      gaps[g.key] = { gap: short > 0 ? (mode === 'giorno' ? 1 : Math.min(2, short)) : 0, norm: 1 };
    }
  }
  return gaps;
}

// Selezione greedy: a ogni passo l'alimento (1 porzione) che copre di più le lacune residue,
// pesando nutrienti e gruppi protettivi. Esclude ciò che porterebbe oltre un UL.
export function recommend(state, key, mode = 'giorno', limit = 6) {
  const targets = getTargets(state.profile);
  const day = computeDay(state, key);
  const week = computeWeek(state, key);
  const base = mode === 'settimana' && week.loggedDays ? week.totals : day.totals;
  const gaps = {};
  for (const k of KEYS) if (recoWeight(k) > 0 && targets[k]) gaps[k] = Math.max(0, targets[k] - base[k]);
  const gGaps = groupGaps(mode, day, week);
  const running = { ...base };
  const picks = [];
  const perCategory = {};
  const month = parseKey(key).getMonth() + 1;

  for (let i = 0; i < limit; i++) {
    let best = null;
    for (const f of FOODS) {
      if (!f.reco || picks.some(p => p.food.id === f.id)) continue;
      const c = foodContribution(f, 1);
      const exceeds = Object.entries(UL).some(([k, u]) => u.scope !== 'integratori' && c[k] && running[k] + c[k] > u.value);
      if (exceeds) continue;
      const gc = groupContribution(f, 1);
      let score = 0;
      for (const k in gaps) if (gaps[k] > 0 && c[k]) score += (recoWeight(k) * Math.min(gaps[k], c[k])) / targets[k];
      for (const k in gGaps) if (gGaps[k].gap > 0 && gc[k]) score += (GROUP_WEIGHTS[k] * Math.min(gGaps[k].gap, gc[k])) / gGaps[k].norm;
      score *= f.reco;
      if (!inSeason(f, month)) score *= OUT_OF_SEASON;
      if ((perCategory[f.cat] || 0) >= 2) score *= 0.5;
      if (!best || score > best.score) best = { food: f, score, c, gc };
    }
    if (!best || best.score < MIN_SCORE) break;

    const gains = Object.keys(gaps)
      .filter(k => gaps[k] > 0 && best.c[k])
      .map(k => ({ key: k, pct: (Math.min(gaps[k], best.c[k]) / targets[k]) * 100 }))
      .filter(g => g.pct >= 5)
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 4);
    const groupGains = Object.keys(gGaps)
      .filter(k => gGaps[k].gap > 0 && best.gc[k])
      .map(k => ({ key: k, value: Math.min(gGaps[k].gap, best.gc[k]) }));

    picks.push({ food: best.food, grams: best.food.g, score: best.score, gains, groupGains });
    for (const k in gaps) gaps[k] = Math.max(0, gaps[k] - (best.c[k] || 0));
    for (const k in gGaps) gGaps[k].gap = Math.max(0, gGaps[k].gap - (best.gc[k] || 0));
    addInto(running, best.c);
    perCategory[best.food.cat] = (perCategory[best.food.cat] || 0) + 1;
  }

  const count = t => TARGET_KEYS.filter(k => t[k] >= targets[k]).length;
  return { mode, picks, before: count(base), after: count(running), total: TARGET_KEYS.length };
}

// Consigli testuali per i nutrienti critici e per il profilo (non risolvibili con un alimento).
export function adviceCards(state, key, evals, week) {
  const p = state.profile;
  const ev = Object.fromEntries(evals.map(e => [e.key, e]));
  const supp = p.integratori || {};
  const cards = [];
  const winter = !isSunSeason(key);

  if (p.dieta === 'vegano' && !(supp.b12 > 0)) {
    cards.push({
      level: 'alta', title: 'Vitamina B12: serve un integratore',
      text: 'Nella dieta vegana la B12 non si ottiene in quantità sufficiente dagli alimenti vegetali: tutte le principali società scientifiche raccomandano un integratore (dosaggi comuni: 25–100 µg al giorno oppure 2000 µg una volta a settimana). Parlane con il medico o il farmacista.',
    });
  } else if (ev.b12.status === 'basso') {
    cards.push({
      level: 'alta', title: 'Vitamina B12 bassa',
      text: 'L\'apporto stimato è basso. Le fonti sono uova, latticini, pesce, carne e alimenti arricchiti (bevande vegetali, lievito alimentare). Se il consumo resta basso valuta con il medico esami del sangue e un integratore.',
    });
  }
  if (p.eta >= 50 && p.dieta !== 'vegano' && !(supp.b12 > 0)) {
    cards.push({
      level: 'info', title: 'B12 dopo i 50 anni',
      text: 'Con l\'età l\'assorbimento della B12 dal cibo può ridursi (gastrite atrofica, farmaci come metformina e inibitori di pompa protonica). Se rientri in questi casi chiedi al medico un controllo dei livelli.',
    });
  }

  if (ev.vitD.status !== 'ok') {
    cards.push(winter
      ? {
        level: 'alta', title: 'Vitamina D in inverno',
        text: 'Da ottobre a marzo in Italia la pelle ne produce pochissima e con il cibo è difficile arrivare al fabbisogno. Le fonti alimentari migliori sono pesce grasso, uova e funghi esposti a raggi UV. L\'integrazione è spesso indicata in inverno: valutala con il medico, anche in base al dosaggio della 25-OH-vitamina D.',
      }
      : {
        level: 'media', title: 'Vitamina D: il sole conta più del cibo',
        text: 'Tra aprile e settembre 15–20 minuti al giorno di sole su braccia e gambe, nelle ore centrali e senza scottarsi, coprono gran parte del fabbisogno. Aggiorna nel profilo il tempo che passi all\'aperto.',
      });
  }

  if (ev.epadha.status !== 'ok') {
    cards.push(allows(p, 'pesce')
      ? {
        level: 'media', title: 'Omega-3 EPA e DHA',
        text: 'Punta a 2 porzioni di pesce a settimana, di cui almeno una di pesce grasso (sardine, alici, sgombro, salmone): sono le fonti più ricche. Le specie piccole come alici e sardine contengono meno mercurio. Le capsule di omega-3 non hanno un beneficio preventivo dimostrato per tutti; le dosi alte (per i trigliceridi) solo su indicazione medica.',
      }
      : {
        level: 'media', title: 'Omega-3 in una dieta senza pesce',
        text: 'I vegetali forniscono ALA (noci, semi di lino macinati, chia), che però si converte poco in EPA e DHA. Assicurati l\'ALA ogni giorno e valuta con il medico un integratore di olio di microalghe, la fonte vegetale di DHA ed EPA.',
      });
  }

  if (ev.iodio.status === 'basso' || (ev.iodio.status !== 'ok' && p.sale !== 'sempre')) {
    cards.push({
      level: 'media', title: 'Iodio',
      text: p.sale === 'sempre'
        ? 'Anche con il sale iodato l\'apporto stimato resta sotto l\'obiettivo: latticini, uova e pesce sono le altre fonti principali. In gravidanza e allattamento può servire un integratore: chiedi al medico.'
        : 'Usa sale iodato al posto di quello comune: è la strategia di prevenzione raccomandata in Italia (legge 55/2005). Poco sale (meno di 5 g al giorno) ma iodato.',
    });
  }

  if (ev.calcio.status === 'basso') {
    const water = waterMinerals(p);
    const calcica = WATER.find(w => w.key === 'calcica');
    const litri = water.litri || 1.5;
    const gain = Math.round((calcica.calcio - water.perL.calcio) * litri / 10) * 10;
    const waterTip = water.perL.calcio < 150 && gain > 0
      ? `Bevendo un'acqua ricca di calcio (circa ${calcica.calcio} mg/L) al posto della tua, con ${String(litri).replace('.', ',')} litri al giorno aggiungeresti circa ${gain} mg di calcio. `
      : '';
    cards.push({
      level: 'media', title: 'Calcio',
      text: `${waterTip}Altre fonti oltre ai latticini: cavoli e cime di rapa, tofu preparato con calcio, bevande vegetali arricchite, mandorle e sesamo.`,
    });
  }

  if (ev.ferro.status !== 'ok' && (p.sesso === 'F' || p.dieta === 'vegetariano' || p.dieta === 'vegano')) {
    cards.push({
      level: 'info', title: 'Come assorbire più ferro',
      text: 'Abbina ai pasti con legumi e verdure una fonte di vitamina C (peperoni, agrumi, kiwi, prezzemolo) e sposta tè e caffè lontano dai pasti. Con stanchezza persistente, ciclo abbondante o donazioni di sangue chiedi al medico di controllare emocromo e ferritina: il ferro può aiutare anche con riserve basse ed emoglobina normale, ma non va preso senza esami.',
    });
  }

  if (ev.colina.status === 'basso') {
    cards.push({
      level: 'info', title: 'Colina',
      text: allows(p, 'uova')
        ? 'Le uova sono la fonte più ricca (circa 150 mg l\'una); seguono pesce, carne, soia, legumi, quinoa e cavolfiore. Raggiungere il fabbisogno conta per fegato e muscoli; andare oltre non migliora la memoria.'
        : 'Nella dieta vegana le fonti migliori sono soia (edamame, tofu), legumi, quinoa, frutta secca, semi e cavolfiore. Raggiungere il fabbisogno conta per fegato e muscoli; andare oltre non migliora la memoria.',
    });
  }

  if (p.forza && !(supp.creatina > 0)) {
    const veg = p.dieta === 'vegetariano' || p.dieta === 'vegano';
    cards.push({
      level: 'info', title: 'Creatina e allenamento di forza',
      text: `Per chi si allena contro resistenza la creatina monoidrato (3–5 g al giorno, senza fase di carico) è uno degli integratori con le prove più solide su forza e potenza, anche senza carenza.${veg ? ' Chi non mangia carne e pesce ha riserve più basse e di solito risponde di più.' : ''} Può far aumentare il peso di 1–2 kg (acqua). Con malattie renali parlane prima con il medico.`,
    });
  }

  if (supp.citicolina > 0) {
    cards.push({
      level: 'info', title: 'Citicolina e memoria',
      text: 'Nel 2024 l\'EFSA ha concluso che non è dimostrato un effetto della citicolina sul mantenimento o miglioramento della memoria. Uno studio su 100 persone di 50–85 anni (500 mg/die per 12 settimane) ha visto un miglioramento della sola memoria episodica. Non è certamente inefficace, ma non è un beneficio affidabile, soprattutto in chi è giovane e sano.',
    });
  }

  const fegato = allowedAnimal(p).find(a => a.key === 'fegato');
  if (fegato && freqPerDay(p, fegato) > 0 && p.sesso === 'F' && (p.condizione === 'gravidanza' || p.condizione === 'cerco')) {
    cards.push({
      level: 'alta', title: 'Fegato e gravidanza',
      text: 'Il fegato contiene moltissima vitamina A preformata (retinolo), che in eccesso può nuocere al feto: in gravidanza, e se la cerchi, è consigliato evitarlo. Parlane con il ginecologo.',
    });
  }

  if (p.condizione === 'cerco' || p.condizione === 'gravidanza') {
    cards.push({
      level: 'alta', title: 'Acido folico',
      text: 'A chi cerca una gravidanza è raccomandato un integratore di 400 µg di acido folico al giorno da almeno un mese prima del concepimento fino alla fine del primo trimestre: la sola dieta non basta a prevenire i difetti del tubo neurale. Concorda tutto con il medico o il ginecologo.',
    });
  }

  if (allows(p, 'carne')) {
    const perWeek = key => Math.round(freqPerDay(p, allowedAnimal(p).find(a => a.key === key)) * 700) / 100;
    const salumi = perWeek('salumi');
    const rossa = perWeek('rossa');
    if (salumi >= 2) {
      cards.push({
        level: 'media', title: 'Carni lavorate',
        text: 'Salumi, würstel e carni conservate sono classificati dall\'IARC come cancerogeni (Gruppo 1, tumore del colon-retto). Il World Cancer Research Fund raccomanda di mangiarne il meno possibile: prova a sostituirli con legumi, uova o pesce.',
      });
    }
    if (rossa >= 4) {
      cards.push({
        level: 'info', title: 'Carne rossa',
        text: 'Il World Cancer Research Fund suggerisce di non superare 350–500 g di carne rossa cotta a settimana (circa 3 porzioni). Puoi sostituire le porzioni in più con legumi o pesce.',
      });
    }
  }

  if (p.fumo) {
    cards.push({
      level: 'media', title: 'Fumo e antiossidanti',
      text: 'Il fumo aumenta il fabbisogno di vitamina C (+35 mg, già incluso nei tuoi obiettivi). Evita invece integratori di beta-carotene: negli studi ATBC e CARET hanno aumentato il rischio di tumore al polmone nei fumatori. Per smettere: Telefono Verde contro il Fumo dell\'ISS, 800 554 088.',
    });
  }

  if (week.items.some(i => i.food.id === 'vino')) {
    cards.push({
      level: 'info', title: 'Vino e polifenoli',
      text: 'Il vino contiene polifenoli, ma l\'alcol è cancerogeno (IARC Gruppo 1) anche a dosi moderate: non è consigliato bere per motivi di salute. Gli stessi polifenoli si trovano in uva, frutti di bosco, cacao e tè.',
    });
  }

  for (const e of evals) {
    if (e.over) {
      cards.push({
        level: 'alta', title: `${e.name} oltre il limite massimo`,
        text: `L'apporto stimato supera il livello massimo tollerabile (${e.ul.value} ${e.unit}, ${e.ul.src}). Di solito succede con integratori o alimenti molto concentrati: rivedili con il medico.`,
      });
    }
  }

  const order = { alta: 0, media: 1, info: 2 };
  return cards.sort((a, b) => order[a.level] - order[b.level]);
}

