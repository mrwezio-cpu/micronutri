// Stima "di fondo" dal profilo: carne, pesce, uova e latticini non si registrano ogni giorno,
// si chiede una frequenza settimanale e la si converte in apporto medio giornaliero.
// Valori per 100 g (cotto per carne e pesce), arrotondati: USDA FoodData Central e tabelle CREA.

export const DIETS = [
  { key: 'onnivoro', label: 'Onnivora', desc: 'Mangio di tutto', allow: ['carne', 'pesce', 'uova', 'latticini'], freq: { rossa: 2, bianca: 2, salumi: 2, pescegrasso: 1, pescemagro: 1, uova: 3, latte: 1, formaggi: 3 } },
  { key: 'flessitariano', label: 'Flessitariana', desc: 'Soprattutto vegetale, carne ogni tanto', allow: ['carne', 'pesce', 'uova', 'latticini'], freq: { rossa: 1, bianca: 1, salumi: 1, pescegrasso: 1, pescemagro: 1, uova: 3, latte: 1, formaggi: 3 } },
  { key: 'pescetariano', label: 'Pescetariana', desc: 'Niente carne, sì pesce', allow: ['pesce', 'uova', 'latticini'], freq: { pescegrasso: 2, pescemagro: 1, uova: 3, latte: 1, formaggi: 3 } },
  { key: 'vegetariano', label: 'Vegetariana', desc: 'Niente carne né pesce, sì uova e latticini', allow: ['uova', 'latticini'], freq: { uova: 4, latte: 1, formaggi: 4 } },
  { key: 'vegano', label: 'Vegana', desc: 'Solo alimenti vegetali', allow: [], freq: {} },
];

export const ANIMAL = [
  {
    key: 'rossa', kind: 'carne', label: 'Carne rossa', hint: 'manzo, maiale, agnello · 100 g', g: 100, per: 'settimana',
    n: { vitD: 0.1, vitE: 0.3, vitK: 1.5, b1: 0.35, b2: 0.2, b6: 0.45, folati: 7, b12: 1.9, calcio: 12, ferro: 2.2, magnesio: 23, potassio: 330, zinco: 5, selenio: 30, iodio: 3 },
  },
  {
    key: 'bianca', kind: 'carne', label: 'Carne bianca', hint: 'pollo, tacchino, coniglio · 100 g', g: 100, per: 'settimana',
    n: { vitA: 10, vitD: 0.1, vitE: 0.3, vitK: 2.4, b1: 0.07, b2: 0.18, b6: 0.6, folati: 5, b12: 0.35, calcio: 14, ferro: 1, magnesio: 28, potassio: 280, zinco: 1.6, selenio: 27, iodio: 3 },
  },
  {
    key: 'salumi', kind: 'carne', label: 'Salumi e carni lavorate', hint: 'prosciutto, salame, würstel · 50 g', g: 50, per: 'settimana',
    n: { vitD: 0.5, b1: 0.6, b2: 0.2, b6: 0.4, b12: 0.8, calcio: 10, ferro: 1, magnesio: 20, potassio: 300, zinco: 2.5, selenio: 15, iodio: 3 },
  },
  {
    key: 'pescegrasso', kind: 'pesce', label: 'Pesce grasso', hint: 'salmone, sgombro, sardine, alici · 150 g', g: 150, per: 'settimana',
    n: { vitA: 50, vitD: 10, vitE: 1.5, b1: 0.1, b2: 0.25, b6: 0.6, folati: 10, b12: 5, calcio: 40, ferro: 1.2, magnesio: 30, potassio: 380, zinco: 0.8, selenio: 40, iodio: 30, epadha: 1600 },
  },
  {
    key: 'pescemagro', kind: 'pesce', label: 'Pesce magro e frutti di mare', hint: 'merluzzo, orata, branzino, molluschi · 150 g', g: 150, per: 'settimana',
    n: { vitA: 15, vitD: 2, vitE: 0.8, b1: 0.08, b2: 0.08, b6: 0.35, folati: 10, b12: 2, calcio: 25, ferro: 0.6, magnesio: 30, potassio: 400, zinco: 0.8, selenio: 35, iodio: 60, epadha: 400 },
  },
  {
    key: 'uova', kind: 'uova', label: 'Uova', hint: 'numero di uova', g: 50, per: 'settimana', unit: 'uova',
    n: { vitA: 160, vitD: 2, vitE: 1.05, vitK: 0.3, b1: 0.04, b2: 0.46, b6: 0.17, folati: 47, b12: 0.89, calcio: 56, ferro: 1.75, magnesio: 12, potassio: 138, zinco: 1.29, selenio: 30.7, iodio: 50, luteina: 503 },
  },
  {
    key: 'latte', kind: 'latticini', label: 'Latte e yogurt', hint: '1 bicchiere di latte o 1 vasetto di yogurt', g: 150, per: 'giorno', step: 0.5, max: 5,
    n: { vitA: 40, vitD: 0.1, b1: 0.04, b2: 0.17, b6: 0.04, folati: 6, b12: 0.45, calcio: 120, ferro: 0.05, magnesio: 11, potassio: 150, zinco: 0.4, selenio: 2, iodio: 20 },
  },
  {
    key: 'formaggi', kind: 'latticini', label: 'Formaggi', hint: '50 g stagionato o 100 g fresco', g: 50, per: 'settimana',
    n: { vitA: 250, vitD: 0.3, vitE: 0.5, vitK: 2.5, b1: 0.03, b2: 0.35, b6: 0.08, folati: 15, b12: 1.5, calcio: 700, ferro: 0.5, magnesio: 30, potassio: 100, zinco: 3.5, selenio: 15, iodio: 30 },
  },
];

// Multivitaminico tipo "100% NRV" (valori nutritivi di riferimento UE).
const MULTI = { vitA: 800, vitC: 80, vitD: 5, vitE: 12, vitK: 75, b1: 1.1, b2: 1.4, b6: 1.4, folati: 340, b12: 2.5, calcio: 120, ferro: 14, magnesio: 56, zinco: 10, selenio: 55, iodio: 150 };
const scale = (obj, k) => Object.fromEntries(Object.entries(obj).map(([key, v]) => [key, v * k]));

export const SUPPLEMENTS = [
  { key: 'b12', label: 'Vitamina B12', unit: 'µg/die', dose: 50, n: d => ({ b12: d }), hint: 'Se la prendi una volta a settimana (es. 2000 µg), inserisci la dose divisa per 7.' },
  { key: 'vitD', label: 'Vitamina D', unit: 'µg/die', dose: 25, n: d => ({ vitD: d }), hint: '1000 UI = 25 µg. Per dosi settimanali o mensili inserisci la media giornaliera.' },
  { key: 'omega3', label: 'Omega-3 (pesce o alghe)', unit: 'mg EPA+DHA/die', dose: 500, n: d => ({ epadha: d }) },
  { key: 'folico', label: 'Acido folico', unit: 'µg/die', dose: 400, n: d => ({ folati: d * 1.7 }), hint: '1 µg di acido folico equivale a 1,7 µg di folati alimentari (DFE).' },
  { key: 'ferro', label: 'Ferro', unit: 'mg/die', dose: 20, n: d => ({ ferro: d }) },
  { key: 'calcio', label: 'Calcio', unit: 'mg/die', dose: 500, n: d => ({ calcio: d }) },
  { key: 'iodio', label: 'Iodio', unit: 'µg/die', dose: 150, n: d => ({ iodio: d }) },
  { key: 'magnesio', label: 'Magnesio', unit: 'mg/die', dose: 200, n: d => ({ magnesio: d }) },
  { key: 'multi', label: 'Multivitaminico-minerale', unit: 'compresse/die', dose: 1, n: d => scale(MULTI, d), hint: 'Calcolato come un prodotto al 100% dei valori di riferimento UE: controlla l\'etichetta del tuo.' },
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

export const CONDITIONS = [
  { key: 'nessuna', label: 'Nessuna' },
  { key: 'cerco', label: 'Cerco una gravidanza' },
  { key: 'gravidanza', label: 'Gravidanza' },
  { key: 'allattamento', label: 'Allattamento' },
];

export function defaultProfile() {
  return {
    sesso: 'F',
    eta: 40,
    condizione: 'nessuna',
    fumo: false,
    dieta: 'onnivoro',
    freq: { ...DIETS[0].freq },
    sole: 'medio',
    sale: 'sempre',
    integratori: {},
  };
}

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
