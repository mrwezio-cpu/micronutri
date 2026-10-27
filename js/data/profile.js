// Stima "di fondo" dal profilo: carne, pesce, uova e latticini non si registrano ogni giorno,
// si chiede una frequenza (al giorno, a settimana, ogni 2 settimane, al mese) e la si converte
// in apporto medio giornaliero.
// Valori per 100 g (cotto per carne e pesce), arrotondati: USDA FoodData Central e tabelle CREA.

export const PERIODS = [
  { key: 'giorno', label: 'al giorno', short: 'die', days: 1 },
  { key: 'settimana', label: 'a settimana', short: 'sett.', days: 7 },
  { key: '2settimane', label: 'ogni 2 settimane', short: '2 sett.', days: 14 },
  { key: 'mese', label: 'al mese', short: 'mese', days: 30 },
];

export const DIETS = [
  { key: 'onnivoro', label: 'Onnivora', desc: 'Mangio di tutto', allow: ['carne', 'pesce', 'uova', 'latticini'], freq: { rossa: 2, bianca: 2, salumi: 2, pescegrasso: 1, pescemagro: 1, uova: 3, latte: 1, formaggi: 3 } },
  { key: 'flessitariano', label: 'Flessitariana', desc: 'Soprattutto vegetale, carne ogni tanto', allow: ['carne', 'pesce', 'uova', 'latticini'], freq: { rossa: 1, bianca: 1, salumi: 1, pescegrasso: 1, pescemagro: 1, uova: 3, latte: 1, formaggi: 3 } },
  { key: 'pescetariano', label: 'Pescetariana', desc: 'Niente carne, sì pesce', allow: ['pesce', 'uova', 'latticini'], freq: { pescegrasso: 2, pescemagro: 1, uova: 3, latte: 1, formaggi: 3 } },
  { key: 'vegetariano', label: 'Vegetariana', desc: 'Niente carne né pesce, sì uova e latticini', allow: ['uova', 'latticini'], freq: { uova: 4, latte: 1, formaggi: 4 } },
  { key: 'vegano', label: 'Vegana', desc: 'Solo alimenti vegetali', allow: [], freq: {} },
];

// per: periodo proposto di default (l'utente può cambiarlo).
export const ANIMAL = [
  {
    key: 'rossa', kind: 'carne', label: 'Carne rossa', hint: 'manzo, maiale, agnello · 100 g', g: 100, per: 'settimana',
    n: { vitD: 0.1, vitE: 0.3, vitK: 1.5, b1: 0.35, b2: 0.2, b6: 0.45, folati: 7, b12: 1.9, colina: 105, calcio: 12, ferro: 2.2, magnesio: 23, potassio: 330, zinco: 5, selenio: 30, iodio: 3, creatina: 0.4 },
  },
  {
    key: 'bianca', kind: 'carne', label: 'Carne bianca', hint: 'pollo, tacchino, coniglio · 100 g', g: 100, per: 'settimana',
    n: { vitA: 10, vitD: 0.1, vitE: 0.3, vitK: 2.4, b1: 0.07, b2: 0.18, b6: 0.6, folati: 5, b12: 0.35, colina: 80, calcio: 14, ferro: 1, magnesio: 28, potassio: 280, zinco: 1.6, selenio: 27, iodio: 3, creatina: 0.35 },
  },
  {
    key: 'salumi', kind: 'carne', label: 'Salumi e carni lavorate', hint: 'prosciutto, salame, würstel · 50 g', g: 50, per: 'settimana',
    n: { vitD: 0.5, b1: 0.6, b2: 0.2, b6: 0.4, b12: 0.8, colina: 70, calcio: 10, ferro: 1, magnesio: 20, potassio: 300, zinco: 2.5, selenio: 15, iodio: 3, creatina: 0.25 },
  },
  {
    key: 'fegato', kind: 'carne', label: 'Fegato e frattaglie', hint: 'di manzo, vitello o pollo · 100 g', g: 100, per: 'mese',
    n: { vitA: 6000, vitD: 1, vitE: 0.5, vitK: 3, b1: 0.2, b2: 2.5, b6: 0.9, folati: 350, b12: 45, colina: 420, calcio: 8, ferro: 8.5, magnesio: 21, potassio: 300, zinco: 4.5, selenio: 50, iodio: 5, creatina: 0.05 },
  },
  {
    key: 'pescegrasso', kind: 'pesce', label: 'Pesce grasso', hint: 'salmone, sgombro, sardine, alici · 150 g', g: 150, per: 'settimana',
    n: { vitA: 50, vitD: 10, vitE: 1.5, b1: 0.1, b2: 0.25, b6: 0.6, folati: 10, b12: 5, colina: 90, calcio: 40, ferro: 1.2, magnesio: 30, potassio: 380, zinco: 0.8, selenio: 40, iodio: 30, epadha: 1600, creatina: 0.45 },
  },
  {
    key: 'pescemagro', kind: 'pesce', label: 'Pesce magro e frutti di mare', hint: 'merluzzo, orata, branzino, molluschi · 150 g', g: 150, per: 'settimana',
    n: { vitA: 15, vitD: 2, vitE: 0.8, b1: 0.08, b2: 0.08, b6: 0.35, folati: 10, b12: 2, colina: 80, calcio: 25, ferro: 0.6, magnesio: 30, potassio: 400, zinco: 0.8, selenio: 35, iodio: 60, epadha: 400, creatina: 0.3 },
  },
  {
    key: 'uova', kind: 'uova', label: 'Uova', hint: 'numero di uova', g: 50, per: 'settimana', unit: 'uova',
    n: { vitA: 160, vitD: 2, vitE: 1.05, vitK: 0.3, b1: 0.04, b2: 0.46, b6: 0.17, folati: 47, b12: 0.89, colina: 294, calcio: 56, ferro: 1.75, magnesio: 12, potassio: 138, zinco: 1.29, selenio: 30.7, iodio: 50, luteina: 503 },
  },
  {
    key: 'latte', kind: 'latticini', label: 'Latte e yogurt', hint: '1 bicchiere di latte o 1 vasetto di yogurt', g: 150, per: 'giorno', step: 0.5,
    n: { vitA: 40, vitD: 0.1, b1: 0.04, b2: 0.17, b6: 0.04, folati: 6, b12: 0.45, colina: 15, calcio: 120, ferro: 0.05, magnesio: 11, potassio: 150, zinco: 0.4, selenio: 2, iodio: 20, creatina: 0.01 },
  },
  {
    key: 'formaggi', kind: 'latticini', label: 'Formaggi', hint: '50 g stagionato o 100 g fresco', g: 50, per: 'settimana',
    n: { vitA: 250, vitD: 0.3, vitE: 0.5, vitK: 2.5, b1: 0.03, b2: 0.35, b6: 0.08, folati: 15, b12: 1.5, colina: 16, calcio: 700, ferro: 0.5, magnesio: 30, potassio: 100, zinco: 3.5, selenio: 15, iodio: 30 },
  },
];

// Multivitaminico tipo "100% NRV" (valori nutritivi di riferimento UE).
const MULTI = { vitA: 800, vitC: 80, vitD: 5, vitE: 12, vitK: 75, b1: 1.1, b2: 1.4, b6: 1.4, folati: 340, b12: 2.5, calcio: 120, ferro: 14, magnesio: 56, zinco: 10, selenio: 55, iodio: 150 };
const scale = (obj, k) => Object.fromEntries(Object.entries(obj).map(([key, v]) => [key, v * k]));

export const SUPPLEMENTS = [
  { key: 'b12', group: 'vitamine', label: 'Vitamina B12', unit: 'µg/die', dose: 50, n: d => ({ b12: d }), hint: 'Se la prendi una volta a settimana (es. 2000 µg), inserisci la dose divisa per 7.' },
  { key: 'vitD', group: 'vitamine', label: 'Vitamina D', unit: 'µg/die', dose: 25, n: d => ({ vitD: d }), hint: '1000 UI = 25 µg. Per dosi settimanali o mensili inserisci la media giornaliera.' },
  { key: 'omega3', group: 'vitamine', label: 'Omega-3 (pesce o alghe)', unit: 'mg EPA+DHA/die', dose: 500, n: d => ({ epadha: d }) },
  { key: 'folico', group: 'vitamine', label: 'Acido folico', unit: 'µg/die', dose: 400, n: d => ({ folati: d * 1.7 }), hint: '1 µg di acido folico equivale a 1,7 µg di folati alimentari (DFE).' },
  { key: 'ferro', group: 'vitamine', label: 'Ferro', unit: 'mg/die', dose: 20, n: d => ({ ferro: d }) },
  { key: 'calcio', group: 'vitamine', label: 'Calcio', unit: 'mg/die', dose: 500, n: d => ({ calcio: d }) },
  { key: 'iodio', group: 'vitamine', label: 'Iodio', unit: 'µg/die', dose: 150, n: d => ({ iodio: d }) },
  { key: 'magnesio', group: 'vitamine', label: 'Magnesio', unit: 'mg/die', dose: 200, n: d => ({ magnesio: d }) },
  { key: 'multi', group: 'vitamine', label: 'Multivitaminico-minerale', unit: 'compresse/die', dose: 1, n: d => scale(MULTI, d), hint: 'Calcolato come un prodotto al 100% dei valori di riferimento UE: controlla l\'etichetta del tuo.' },
  { key: 'creatina', group: 'altri', label: 'Creatina monoidrato', unit: 'g/die', dose: 3, n: d => ({ creatina: d }) },
  { key: 'citicolina', group: 'altri', label: 'Citicolina (CDP-colina)', unit: 'mg/die', dose: 500, n: d => ({ colina: d * 0.2 }), hint: 'Contata come fonte di colina (circa il 20% del peso). Per la memoria le prove sono insufficienti.' },
  { key: 'psillio', group: 'altri', label: 'Psillio', unit: 'g/die', dose: 5, n: d => ({ fibre: d * 0.8 }), hint: 'Contato nelle fibre. Va preso con molta acqua e lontano dai farmaci.' },
];

// Vitamina D da sintesi cutanea, solo aprile–settembre (stima prudente, dimezzata dopo i 70 anni).
export const SUN = [
  { key: 'poco', label: 'Meno di 10 minuti', vitD: 0 },
  { key: 'medio', label: '10–20 minuti', vitD: 5 },
  { key: 'molto', label: 'Più di 20 minuti', vitD: 10 },
];

// Sale iodato: 30 mg di iodio per kg (legge 55/2005); ~2,5 g di sale aggiunto al giorno.
export const SALT = [
  { key: 'sempre', label: 'Sì, sempre', iodio: 75 },
  { key: 'avolte', label: 'A volte', iodio: 35 },
  { key: 'no', label: 'No / non so', iodio: 0 },
];

// Calcio e magnesio in mg/L. Valori tipici: quelli reali sono in etichetta (o dal gestore per il rubinetto).
// Il calcio dell'acqua si assorbe come quello del latte.
export const WATER = [
  { key: 'minima', label: 'Minimamente mineralizzata', desc: 'residuo fisso sotto 50 mg/L', calcio: 10, magnesio: 2 },
  { key: 'oligo', label: 'Oligominerale', desc: 'residuo fisso 50–500 mg/L, la più comune', calcio: 35, magnesio: 8 },
  { key: 'calcica', label: 'Ricca di calcio', desc: 'calcio oltre 150 mg/L in etichetta', calcio: 300, magnesio: 20 },
  { key: 'rubinetto', label: 'Del rubinetto', desc: 'media indicativa: i valori veri li dà il gestore', calcio: 70, magnesio: 15 },
  { key: 'etichetta', label: 'Inserisco i valori dell\'etichetta', desc: 'calcio e magnesio in mg/L' },
];

export const CONDITIONS = [
  { key: 'nessuna', label: 'Nessuna' },
  { key: 'cerco', label: 'Cerco una gravidanza' },
  { key: 'gravidanza', label: 'Gravidanza' },
  { key: 'allattamento', label: 'Allattamento' },
];

export function dietOf(profile) {
  return DIETS.find(d => d.key === profile.dieta) || DIETS[0];
}

export function allowedAnimal(profile) {
  const allow = dietOf(profile).allow;
  return ANIMAL.filter(a => allow.includes(a.kind));
}

export function allows(profile, kind) {
  return dietOf(profile).allow.includes(kind);
}

// Frequenze del profilo come { n, per }. I profili salvati prima avevano solo il numero.
export function freqOf(profile, a) {
  const f = profile.freq?.[a.key];
  if (f && typeof f === 'object') return { n: Number(f.n) || 0, per: PERIODS.some(p => p.key === f.per) ? f.per : a.per };
  return { n: Number(f) || 0, per: a.per };
}

export function freqPerDay(profile, a) {
  const { n, per } = freqOf(profile, a);
  return n / PERIODS.find(p => p.key === per).days;
}

export function dietFreq(dietKey) {
  const diet = DIETS.find(d => d.key === dietKey) || DIETS[0];
  return Object.fromEntries(ANIMAL.map(a => [a.key, { n: diet.freq[a.key] || 0, per: a.per }]));
}

export function waterMinerals(profile) {
  const w = profile.acqua || {};
  const litri = Number(w.litri) || 0;
  const type = WATER.find(x => x.key === w.tipo);
  const perL = type?.key === 'etichetta' || !type
    ? { calcio: Number(w.calcio) || 0, magnesio: Number(w.magnesio) || 0 }
    : { calcio: type.calcio, magnesio: type.magnesio };
  return { calcio: perL.calcio * litri, magnesio: perL.magnesio * litri, perL, litri };
}

export function defaultProfile() {
  return {
    sesso: 'F',
    eta: 40,
    condizione: 'nessuna',
    fumo: false,
    forza: false,
    dieta: 'onnivoro',
    freq: dietFreq('onnivoro'),
    sole: 'medio',
    sale: 'sempre',
    acqua: { litri: 1.5, tipo: 'oligo', calcio: 35, magnesio: 8 },
    integratori: {},
  };
}

// Completa i profili creati con versioni precedenti dell'app.
export function normalizeProfile(p) {
  if (!p) return p;
  const base = defaultProfile();
  const out = { ...base, ...p, acqua: { ...base.acqua, ...(p.acqua || {}) }, integratori: { ...(p.integratori || {}) } };
  out.freq = Object.fromEntries(ANIMAL.map(a => [a.key, freqOf(p, a)]));
  return out;
}
