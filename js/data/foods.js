// Database degli alimenti vegetali registrabili nel diario.
//
// Valori per 100 g di parte edibile (100 ml per le bevande), crudi salvo indicazione, arrotondati.
// Fonti: USDA FoodData Central (SR Legacy) e tabelle CREA per vitamine, minerali e fibre;
// Phenol-Explorer 3.6 per i polifenoli (stime, da considerare ordini di grandezza).
// Unità: come in nutrients.js (luteina e licopene in µg).
//
// Opzioni:
//   cook   → di solito si mangia cotto: si applicano le perdite di cottura (vit. C −30%, folati −25%)
//   bio    → fattori di biodisponibilità (es. calcio da ossalati)
//   groups → gruppi alimentari protettivi (foglia, crucifere, bosco, integrali; legumi e secca automatici)
//   fv     → quanto conta nei grammi di frutta e verdura (0 per patate, 3 per la frutta essiccata)
//   reco   → peso nei consigli (0 = mai consigliato)
//   season → [mese inizio, mese fine] della stagionalità in Italia: fuori stagione è meno consigliato

export const CATEGORIES = [
  { key: 'frutta', label: 'Frutta', icon: '🍎', q: 'Che frutta hai mangiato oggi?' },
  { key: 'verdura', label: 'Verdura', icon: '🥦', q: 'E verdure e ortaggi?' },
  { key: 'legumi', label: 'Legumi', icon: '🫘', q: 'Hai mangiato legumi?' },
  { key: 'cereali', label: 'Cereali', icon: '🌾', q: 'Pasta, pane, riso, avena…?' },
  { key: 'secca', label: 'Frutta secca e semi', short: 'Noci e semi', icon: '🌰', q: 'Frutta secca o semi?' },
  { key: 'altro', label: 'Condimenti e bevande', short: 'Altro', icon: '🫒', q: 'Olio, olive, cacao, tè, caffè…?' },
];

const F = (id, name, cat, g, portion, n, o = {}) => ({
  id, name, cat, g, portion, n,
  unit: o.unit || 'g',
  groups: [...(o.groups || []), ...(cat === 'legumi' ? ['legumi'] : []), ...(cat === 'secca' ? ['secca'] : [])],
  fv: o.fv ?? (cat === 'frutta' || cat === 'verdura' ? 1 : 0),
  plant: o.plant ?? cat !== 'altro',
  cook: !!o.cook,
  bio: o.bio || null,
  reco: o.reco ?? 1,
  season: o.season || null,
  note: o.note || '',
  alias: o.alias || '',
});

export const FOODS = [
  // ---------- Frutta ----------
  F('mela', 'Mela (con buccia)', 'frutta', 150, '1 frutto medio', { vitA: 3, vitC: 4.6, vitE: 0.18, vitK: 2.2, b1: 0.02, b2: 0.03, b6: 0.04, folati: 3, calcio: 6, ferro: 0.12, magnesio: 5, potassio: 107, zinco: 0.04, fibre: 2.4, polifenoli: 136, luteina: 29, colina: 3.4, antociani: 1.5 }),
  F('pera', 'Pera', 'frutta', 150, '1 frutto medio', { vitA: 1, vitC: 4.3, vitE: 0.12, vitK: 4.4, b1: 0.01, b2: 0.03, b6: 0.03, folati: 7, calcio: 9, ferro: 0.18, magnesio: 7, potassio: 116, zinco: 0.1, fibre: 3.1, polifenoli: 69, luteina: 45, colina: 5.1 }),
  F('arancia', 'Arancia', 'frutta', 150, '1 frutto medio', { vitA: 11, vitC: 53, vitE: 0.18, b1: 0.09, b2: 0.04, b6: 0.06, folati: 30, calcio: 40, ferro: 0.1, magnesio: 10, potassio: 181, zinco: 0.07, selenio: 0.5, fibre: 2.4, polifenoli: 50, luteina: 129, colina: 8.4 }, { season: [11, 4], alias: 'agrumi spremuta' }),
  F('mandarino', 'Mandarini / clementine', 'frutta', 150, '2 frutti', { vitA: 34, vitC: 40, vitE: 0.2, b1: 0.06, b2: 0.04, b6: 0.08, folati: 16, calcio: 37, ferro: 0.15, magnesio: 12, potassio: 166, zinco: 0.07, fibre: 1.8, polifenoli: 40, luteina: 138, colina: 10.2 }, { season: [11, 2], alias: 'agrumi' }),
  F('kiwi', 'Kiwi', 'frutta', 75, '1 kiwi', { vitA: 4, vitC: 93, vitE: 1.46, vitK: 40, b1: 0.03, b2: 0.03, b6: 0.06, folati: 25, calcio: 34, ferro: 0.31, magnesio: 17, potassio: 312, zinco: 0.14, selenio: 0.2, fibre: 3, polifenoli: 60, luteina: 122, colina: 7.8 }, { season: [10, 5] }),
  F('fragole', 'Fragole', 'frutta', 150, '1 coppetta', { vitA: 1, vitC: 59, vitE: 0.29, vitK: 2.2, b1: 0.02, b2: 0.02, b6: 0.05, folati: 24, calcio: 16, ferro: 0.41, magnesio: 13, potassio: 153, zinco: 0.14, selenio: 0.4, fibre: 2, polifenoli: 235, luteina: 26, colina: 5.7, antociani: 25 }, { season: [4, 6], groups: ['bosco'] }),
  F('mirtilli', 'Mirtilli', 'frutta', 125, '1 vaschetta', { vitA: 3, vitC: 9.7, vitE: 0.57, vitK: 19.3, b1: 0.04, b2: 0.04, b6: 0.05, folati: 6, calcio: 6, ferro: 0.28, magnesio: 6, potassio: 77, zinco: 0.16, fibre: 2.4, polifenoli: 560, luteina: 80, colina: 6, antociani: 160 }, { groups: ['bosco'], alias: 'frutti di bosco' }),
  F('lamponi', 'Lamponi / more', 'frutta', 125, '1 vaschetta', { vitA: 6, vitC: 24, vitE: 1, vitK: 14, b1: 0.03, b2: 0.03, b6: 0.05, folati: 23, calcio: 27, ferro: 0.66, magnesio: 21, potassio: 158, zinco: 0.48, selenio: 0.3, fibre: 5.9, polifenoli: 240, luteina: 130, colina: 10, antociani: 70 }, { groups: ['bosco'], alias: 'frutti di bosco ribes' }),
  F('banana', 'Banana', 'frutta', 120, '1 frutto medio', { vitA: 3, vitC: 8.7, vitE: 0.1, vitK: 0.5, b1: 0.03, b2: 0.07, b6: 0.37, folati: 20, calcio: 5, ferro: 0.26, magnesio: 27, potassio: 358, zinco: 0.15, selenio: 1, fibre: 2.6, polifenoli: 10, luteina: 22, colina: 9.8 }),
  F('uva', 'Uva', 'frutta', 150, '1 grappolo piccolo', { vitA: 3, vitC: 3.2, vitE: 0.19, vitK: 14.6, b1: 0.07, b2: 0.07, b6: 0.09, folati: 2, calcio: 10, ferro: 0.36, magnesio: 7, potassio: 191, zinco: 0.07, fibre: 0.9, polifenoli: 169, luteina: 72, colina: 5.6, antociani: 45 }, { season: [8, 10] }),
  F('pesca', 'Pesca / nettarina', 'frutta', 150, '1 frutto medio', { vitA: 16, vitC: 6.6, vitE: 0.73, vitK: 2.6, b1: 0.02, b2: 0.03, b6: 0.03, folati: 4, calcio: 6, ferro: 0.25, magnesio: 9, potassio: 190, zinco: 0.17, fibre: 1.5, polifenoli: 59, luteina: 91, colina: 6.1 }, { season: [6, 9], alias: 'pesche' }),
  F('albicocche', 'Albicocche', 'frutta', 150, '3–4 frutti', { vitA: 96, vitC: 10, vitE: 0.89, vitK: 3.3, b1: 0.03, b2: 0.04, b6: 0.05, folati: 9, calcio: 13, ferro: 0.39, magnesio: 10, potassio: 259, zinco: 0.2, fibre: 2, polifenoli: 50, luteina: 89, colina: 2.8 }, { season: [6, 8] }),
  F('ciliegie', 'Ciliegie', 'frutta', 150, '~20 ciliegie', { vitA: 3, vitC: 7, vitE: 0.07, vitK: 2.1, b1: 0.03, b2: 0.03, b6: 0.05, folati: 4, calcio: 13, ferro: 0.36, magnesio: 11, potassio: 222, zinco: 0.07, fibre: 2.1, polifenoli: 274, luteina: 85, colina: 6.1, antociani: 35 }, { season: [5, 7] }),
  F('prugne', 'Prugne / susine', 'frutta', 150, '3 frutti', { vitA: 17, vitC: 9.5, vitE: 0.26, vitK: 6.4, b1: 0.03, b2: 0.03, b6: 0.03, folati: 5, calcio: 6, ferro: 0.17, magnesio: 7, potassio: 157, zinco: 0.1, fibre: 1.4, polifenoli: 377, luteina: 73, colina: 1.9, antociani: 15 }, { season: [7, 9] }),
  F('melograno', 'Melograno', 'frutta', 100, '½ frutto (chicchi)', { vitC: 10.2, vitE: 0.6, vitK: 16.4, b1: 0.07, b2: 0.05, b6: 0.08, folati: 38, calcio: 10, ferro: 0.3, magnesio: 12, potassio: 236, zinco: 0.35, selenio: 0.5, fibre: 4, polifenoli: 150, colina: 7.6, antociani: 10 }, { season: [10, 12] }),
  F('cachi', 'Cachi', 'frutta', 150, '1 frutto', { vitA: 81, vitC: 7.5, vitE: 0.73, vitK: 2.6, b1: 0.03, b2: 0.02, b6: 0.1, folati: 8, calcio: 8, ferro: 0.15, magnesio: 9, potassio: 161, zinco: 0.11, selenio: 0.6, fibre: 3.6, polifenoli: 80, luteina: 834, licopene: 159, colina: 5 }, { season: [10, 12], alias: 'kaki loti' }),
  F('fichi', 'Fichi freschi', 'frutta', 150, '3 fichi', { vitA: 7, vitC: 2, vitE: 0.11, vitK: 4.7, b1: 0.06, b2: 0.05, b6: 0.11, folati: 6, calcio: 35, ferro: 0.37, magnesio: 17, potassio: 232, zinco: 0.15, selenio: 0.2, fibre: 2.9, polifenoli: 60, luteina: 9, colina: 4.7 }, { season: [8, 9] }),
  F('melone', 'Melone', 'frutta', 200, '1 fetta grande', { vitA: 169, vitC: 37, vitK: 2.5, b1: 0.04, b2: 0.02, b6: 0.07, folati: 21, calcio: 9, ferro: 0.21, magnesio: 12, potassio: 267, zinco: 0.18, selenio: 0.4, fibre: 0.9, polifenoli: 10, luteina: 26, colina: 7.6 }, { season: [6, 9] }),
  F('anguria', 'Anguria', 'frutta', 250, '1 fetta', { vitA: 28, vitC: 8.1, vitE: 0.05, b1: 0.03, b2: 0.02, b6: 0.05, folati: 3, calcio: 7, ferro: 0.24, magnesio: 10, potassio: 112, zinco: 0.1, selenio: 0.4, fibre: 0.4, polifenoli: 5, luteina: 8, licopene: 4532, colina: 4.1 }, { season: [6, 9], alias: 'cocomero' }),
  F('ananas', 'Ananas', 'frutta', 150, '2 fette', { vitA: 3, vitC: 48, vitK: 0.7, b1: 0.08, b2: 0.03, b6: 0.11, folati: 18, calcio: 13, ferro: 0.29, magnesio: 12, potassio: 109, zinco: 0.12, fibre: 1.4, polifenoli: 30, colina: 5.5 }),
  F('avocado', 'Avocado', 'frutta', 100, '½ avocado', { vitA: 7, vitC: 10, vitE: 2.07, vitK: 21, b1: 0.07, b2: 0.13, b6: 0.26, folati: 81, calcio: 12, ferro: 0.55, magnesio: 29, potassio: 485, zinco: 0.64, selenio: 0.4, fibre: 6.7, ala: 0.11, polifenoli: 30, luteina: 271, colina: 14.2 }),
  F('albicocchesecche', 'Albicocche secche', 'frutta', 30, '5–6 albicocche', { vitA: 180, vitC: 1, vitE: 4.33, vitK: 3.1, b1: 0.02, b2: 0.07, b6: 0.14, folati: 10, calcio: 55, ferro: 2.66, magnesio: 32, potassio: 1162, zinco: 0.39, selenio: 2.2, fibre: 7.3, polifenoli: 100, colina: 13.9 }, { fv: 3, alias: 'frutta essiccata disidratata' }),
  F('prugnesecche', 'Prugne secche', 'frutta', 30, '4–5 prugne', { vitA: 39, vitC: 0.6, vitE: 0.43, vitK: 59.5, b1: 0.05, b2: 0.19, b6: 0.21, folati: 4, calcio: 43, ferro: 0.93, magnesio: 41, potassio: 732, zinco: 0.44, selenio: 0.3, fibre: 7.1, polifenoli: 190, luteina: 148, colina: 10.1 }, { fv: 3, alias: 'frutta essiccata disidratata' }),

  // ---------- Verdura ----------
  F('spinaci', 'Spinaci', 'verdura', 200, '1 porzione, peso da crudi', { vitA: 469, vitC: 28, vitE: 2.03, vitK: 483, b1: 0.08, b2: 0.19, b6: 0.2, folati: 194, calcio: 99, ferro: 2.71, magnesio: 79, potassio: 558, zinco: 0.53, selenio: 1, fibre: 2.2, ala: 0.14, polifenoli: 119, luteina: 12198, colina: 19.3 }, { cook: true, bio: { calcio: 0.2 }, groups: ['foglia'], note: 'Calcio poco assorbibile (ossalati): conteggiato al 20%' }),
  F('bietole', 'Bietole / coste', 'verdura', 200, '1 porzione', { vitA: 306, vitC: 30, vitE: 1.89, vitK: 830, b1: 0.04, b2: 0.09, b6: 0.1, folati: 14, calcio: 51, ferro: 1.8, magnesio: 81, potassio: 379, zinco: 0.36, selenio: 0.9, fibre: 1.6, polifenoli: 50, luteina: 11000, colina: 18 }, { cook: true, bio: { calcio: 0.2 }, groups: ['foglia'], alias: 'erbette', note: 'Calcio poco assorbibile (ossalati): conteggiato al 20%' }),
  F('cavolonero', 'Cavolo nero / riccio', 'verdura', 200, '1 porzione', { vitA: 350, vitC: 100, vitE: 0.7, vitK: 500, b1: 0.11, b2: 0.15, b6: 0.15, folati: 62, calcio: 180, ferro: 1.6, magnesio: 33, potassio: 348, zinco: 0.39, selenio: 0.9, fibre: 4.1, ala: 0.18, polifenoli: 100, luteina: 8000, colina: 20 }, { season: [10, 3], cook: true, groups: ['foglia', 'crucifere'], alias: 'kale' }),
  F('broccoli', 'Broccoli', 'verdura', 200, '1 porzione', { vitA: 31, vitC: 89, vitE: 0.78, vitK: 102, b1: 0.07, b2: 0.12, b6: 0.18, folati: 63, calcio: 47, ferro: 0.73, magnesio: 21, potassio: 316, zinco: 0.41, selenio: 2.5, fibre: 2.6, ala: 0.02, polifenoli: 45, luteina: 1403, colina: 18.7 }, { season: [10, 4], cook: true, groups: ['crucifere'] }),
  F('cavolfiore', 'Cavolfiore', 'verdura', 200, '1 porzione', { vitC: 48, vitE: 0.08, vitK: 15.5, b1: 0.05, b2: 0.06, b6: 0.18, folati: 57, calcio: 22, ferro: 0.42, magnesio: 15, potassio: 299, zinco: 0.27, selenio: 0.6, fibre: 2, polifenoli: 20, colina: 44.3 }, { season: [10, 3], cook: true, groups: ['crucifere'], alias: 'cavolo romanesco' }),
  F('cavolo', 'Cavolo verza / cappuccio', 'verdura', 200, '1 porzione', { vitA: 25, vitC: 34, vitE: 0.15, vitK: 72, b1: 0.06, b2: 0.04, b6: 0.12, folati: 60, calcio: 38, ferro: 0.45, magnesio: 14, potassio: 200, zinco: 0.2, selenio: 0.5, fibre: 2.8, polifenoli: 30, luteina: 50, colina: 10.7 }, { season: [10, 3], cook: true, groups: ['crucifere'], alias: 'crauti' }),
  F('cavolini', 'Cavolini di Bruxelles', 'verdura', 150, '1 porzione', { vitA: 38, vitC: 85, vitE: 0.88, vitK: 177, b1: 0.14, b2: 0.09, b6: 0.22, folati: 61, calcio: 42, ferro: 1.4, magnesio: 23, potassio: 389, zinco: 0.42, selenio: 1.6, fibre: 3.8, ala: 0.1, polifenoli: 50, luteina: 1590, colina: 19.1 }, { season: [10, 3], cook: true, groups: ['crucifere'] }),
  F('cimedirapa', 'Cime di rapa / friarielli', 'verdura', 200, '1 porzione', { vitA: 131, vitC: 20, vitE: 1.62, vitK: 224, b1: 0.16, b2: 0.13, b6: 0.17, folati: 83, calcio: 108, ferro: 2.14, magnesio: 22, potassio: 196, zinco: 0.77, selenio: 1.1, fibre: 2.7, polifenoli: 50, luteina: 1121, colina: 18.3 }, { season: [10, 3], cook: true, groups: ['foglia', 'crucifere'], alias: 'broccoletti' }),
  F('rucola', 'Rucola', 'verdura', 50, '1 piatto', { vitA: 119, vitC: 15, vitE: 0.43, vitK: 109, b1: 0.04, b2: 0.09, b6: 0.07, folati: 97, calcio: 160, ferro: 1.46, magnesio: 47, potassio: 369, zinco: 0.47, selenio: 0.3, fibre: 1.6, ala: 0.17, polifenoli: 50, luteina: 3555, colina: 15.3 }, { groups: ['foglia', 'crucifere'] }),
  F('insalata', 'Lattuga / insalata verde', 'verdura', 80, '1 ciotola', { vitA: 400, vitC: 9, vitE: 0.22, vitK: 110, b1: 0.07, b2: 0.07, b6: 0.08, folati: 90, calcio: 34, ferro: 0.9, magnesio: 14, potassio: 220, zinco: 0.2, selenio: 0.5, fibre: 1.6, polifenoli: 30, luteina: 2000, colina: 13.6 }, { groups: ['foglia'], alias: 'romana songino valeriana misticanza' }),
  F('radicchio', 'Radicchio', 'verdura', 80, '1 ciotola', { vitA: 1, vitC: 8, vitE: 2.26, vitK: 255, b1: 0.02, b2: 0.03, b6: 0.06, folati: 60, calcio: 19, ferro: 0.57, magnesio: 13, potassio: 302, zinco: 0.62, selenio: 0.9, fibre: 0.9, polifenoli: 160, luteina: 8832, colina: 10, antociani: 125 }, { season: [10, 3], groups: ['foglia'], alias: 'trevisano' }),
  F('cicoria', 'Cicoria / catalogna', 'verdura', 200, '1 porzione', { vitA: 286, vitC: 24, vitE: 2.26, vitK: 298, b1: 0.06, b2: 0.1, b6: 0.11, folati: 110, calcio: 100, ferro: 0.9, magnesio: 30, potassio: 420, zinco: 0.42, selenio: 0.3, fibre: 4, polifenoli: 100, luteina: 10300, colina: 12.8 }, { cook: true, groups: ['foglia'], alias: 'puntarelle tarassaco' }),
  F('carote', 'Carote', 'verdura', 100, '1 carota grande', { vitA: 835, vitC: 5.9, vitE: 0.66, vitK: 13.2, b1: 0.07, b2: 0.06, b6: 0.14, folati: 19, calcio: 33, ferro: 0.3, magnesio: 12, potassio: 320, zinco: 0.24, selenio: 0.1, fibre: 2.8, polifenoli: 15, luteina: 256, colina: 8.8 }),
  F('pomodori', 'Pomodori crudi', 'verdura', 200, '2 pomodori medi', { vitA: 42, vitC: 13.7, vitE: 0.54, vitK: 7.9, b1: 0.04, b2: 0.02, b6: 0.08, folati: 15, calcio: 10, ferro: 0.27, magnesio: 11, potassio: 237, zinco: 0.17, fibre: 1.2, polifenoli: 45, luteina: 123, licopene: 2573, colina: 6.7 }, { season: [6, 9], alias: 'pomodorini ciliegini' }),
  F('passata', 'Passata / sugo di pomodoro', 'verdura', 100, '1 porzione di sugo', { vitA: 26, vitC: 10.6, vitE: 1.97, vitK: 3.4, b1: 0.03, b2: 0.08, b6: 0.13, folati: 11, calcio: 18, ferro: 0.6, magnesio: 20, potassio: 380, zinco: 0.3, selenio: 0.7, fibre: 1.9, polifenoli: 50, licopene: 13000, colina: 10 }, { alias: 'salsa pelati' }),
  F('peperoni', 'Peperoni', 'verdura', 150, '1 peperone medio', { vitA: 157, vitC: 128, vitE: 1.58, vitK: 4.9, b1: 0.05, b2: 0.09, b6: 0.29, folati: 46, calcio: 7, ferro: 0.43, magnesio: 12, potassio: 211, zinco: 0.25, fibre: 2.1, polifenoli: 30, luteina: 51, colina: 5.6 }, { season: [6, 9] }),
  F('zucchine', 'Zucchine', 'verdura', 200, '1 porzione', { vitA: 10, vitC: 17.9, vitE: 0.12, vitK: 4.3, b1: 0.05, b2: 0.09, b6: 0.16, folati: 24, calcio: 16, ferro: 0.37, magnesio: 18, potassio: 261, zinco: 0.32, selenio: 0.2, fibre: 1, polifenoli: 10, luteina: 2125, colina: 9.5 }, { season: [5, 9], cook: true }),
  F('melanzane', 'Melanzane', 'verdura', 200, '1 porzione', { vitC: 2.2, vitE: 0.3, vitK: 3.5, b1: 0.04, b2: 0.04, b6: 0.08, folati: 22, calcio: 9, ferro: 0.23, magnesio: 14, potassio: 229, zinco: 0.16, selenio: 0.3, fibre: 3, polifenoli: 60, luteina: 36, colina: 6.9, antociani: 10 }, { season: [6, 9], cook: true }),
  F('zucca', 'Zucca', 'verdura', 200, '1 porzione', { vitA: 480, vitC: 15, vitE: 1.2, vitK: 1.1, b1: 0.05, b2: 0.08, b6: 0.12, folati: 22, calcio: 35, ferro: 0.75, magnesio: 22, potassio: 345, zinco: 0.25, selenio: 0.4, fibre: 1.5, polifenoli: 20, luteina: 1500, colina: 8.2 }, { season: [9, 12], cook: true }),
  F('carciofi', 'Carciofi', 'verdura', 150, '2 carciofi', { vitA: 1, vitC: 11.7, vitE: 0.19, vitK: 14.8, b1: 0.07, b2: 0.07, b6: 0.12, folati: 68, calcio: 44, ferro: 1.28, magnesio: 60, potassio: 370, zinco: 0.49, selenio: 0.2, fibre: 5.4, polifenoli: 260, luteina: 464, colina: 34.4 }, { season: [11, 4], cook: true }),
  F('finocchi', 'Finocchi', 'verdura', 200, '1 finocchio', { vitA: 3, vitC: 12, vitE: 0.58, vitK: 62.8, b1: 0.01, b2: 0.03, b6: 0.05, folati: 27, calcio: 49, ferro: 0.73, magnesio: 17, potassio: 414, zinco: 0.2, selenio: 0.7, fibre: 3.1, polifenoli: 30, colina: 10 }, { season: [10, 4] }),
  F('asparagi', 'Asparagi', 'verdura', 150, '1 porzione', { vitA: 38, vitC: 5.6, vitE: 1.13, vitK: 41.6, b1: 0.14, b2: 0.14, b6: 0.09, folati: 52, calcio: 24, ferro: 2.14, magnesio: 14, potassio: 202, zinco: 0.54, selenio: 2.3, fibre: 2.1, polifenoli: 30, luteina: 710, colina: 16 }, { season: [3, 6], cook: true }),
  F('fagiolini', 'Fagiolini', 'verdura', 150, '1 porzione', { vitA: 35, vitC: 12.2, vitE: 0.41, vitK: 43, b1: 0.08, b2: 0.1, b6: 0.14, folati: 33, calcio: 37, ferro: 1.03, magnesio: 25, potassio: 211, zinco: 0.24, selenio: 0.6, fibre: 2.7, polifenoli: 30, luteina: 640, colina: 15.3 }, { season: [6, 9], cook: true, alias: 'cornetti' }),
  F('cipolla', 'Cipolla', 'verdura', 50, '½ cipolla', { vitC: 7.4, vitK: 0.4, b1: 0.05, b2: 0.03, b6: 0.12, folati: 19, calcio: 23, ferro: 0.21, magnesio: 10, potassio: 146, zinco: 0.17, selenio: 0.5, fibre: 1.7, polifenoli: 120, luteina: 4, colina: 6.1, antociani: 10 }, { alias: 'porro scalogno' }),
  F('aglio', 'Aglio', 'verdura', 5, '1 spicchio', { vitC: 31, vitK: 1.7, b1: 0.2, b2: 0.11, b6: 1.24, folati: 3, calcio: 181, ferro: 1.7, magnesio: 25, potassio: 401, zinco: 1.16, selenio: 14.2, fibre: 2.1, polifenoli: 100, colina: 23.2 }, { reco: 0 }),
  F('barbabietola', 'Barbabietola rossa', 'verdura', 100, '1 barbabietola', { vitA: 2, vitC: 4.9, b1: 0.03, b2: 0.04, b6: 0.07, folati: 80, calcio: 16, ferro: 0.8, magnesio: 23, potassio: 325, zinco: 0.35, selenio: 0.7, fibre: 2.8, polifenoli: 50, colina: 6 }, { alias: 'rapa rossa' }),
  F('funghi', 'Funghi champignon', 'verdura', 100, '1 porzione', { vitD: 0.2, vitC: 2.1, b1: 0.08, b2: 0.4, b6: 0.1, folati: 17, calcio: 3, ferro: 0.5, magnesio: 9, potassio: 318, zinco: 0.52, selenio: 9.3, fibre: 1, polifenoli: 20, colina: 17.3 }, { note: 'Se esposti a raggi UV (vedi etichetta) contengono molta più vitamina D', alias: 'porcini' }),
  F('cetrioli', 'Cetrioli', 'verdura', 100, '1 cetriolo piccolo', { vitA: 5, vitC: 2.8, vitK: 16.4, b6: 0.04, folati: 7, calcio: 16, ferro: 0.28, magnesio: 13, potassio: 147, zinco: 0.2, fibre: 0.5, polifenoli: 5, luteina: 23, colina: 6 }),
  F('patate', 'Patate', 'verdura', 200, '1 porzione', { vitC: 19.7, vitK: 1.9, b1: 0.08, b2: 0.03, b6: 0.3, folati: 15, calcio: 12, ferro: 0.81, magnesio: 23, potassio: 425, zinco: 0.3, selenio: 0.4, fibre: 2.2, polifenoli: 30, colina: 12.1 }, { cook: true, fv: 0, reco: 0.5, note: 'Non contano come porzione di frutta e verdura (OMS)' }),
  F('patatedolci', 'Patate dolci', 'verdura', 200, '1 porzione', { vitA: 709, vitC: 2.4, vitE: 0.26, vitK: 1.8, b1: 0.08, b2: 0.06, b6: 0.21, folati: 11, calcio: 30, ferro: 0.61, magnesio: 25, potassio: 337, zinco: 0.3, selenio: 0.6, fibre: 3, polifenoli: 30, colina: 12.3 }, { cook: true, fv: 0, note: 'Non contano come porzione di frutta e verdura (OMS)', alias: 'batata americana' }),

  // ---------- Legumi (valori sul cotto) ----------
  F('lenticchie', 'Lenticchie', 'legumi', 150, '1 porzione cotta (50 g secche)', { vitC: 1.5, vitE: 0.11, vitK: 1.7, b1: 0.17, b2: 0.07, b6: 0.18, folati: 181, calcio: 19, ferro: 3.33, magnesio: 36, potassio: 369, zinco: 1.27, selenio: 2.8, fibre: 7.9, ala: 0.04, polifenoli: 60, colina: 32.7 }),
  F('ceci', 'Ceci', 'legumi', 150, '1 porzione cotta (50 g secchi)', { vitA: 1, vitC: 1.3, vitE: 0.35, vitK: 4, b1: 0.12, b2: 0.06, b6: 0.14, folati: 172, calcio: 49, ferro: 2.89, magnesio: 48, potassio: 291, zinco: 1.53, selenio: 3.7, fibre: 7.6, ala: 0.1, polifenoli: 20, colina: 42.8 }, { alias: 'hummus' }),
  F('fagioli', 'Fagioli (borlotti, cannellini…)', 'legumi', 150, '1 porzione cotta (50 g secchi)', { vitK: 3.5, b1: 0.2, b2: 0.06, b6: 0.18, folati: 140, calcio: 60, ferro: 2.5, magnesio: 55, potassio: 450, zinco: 1, selenio: 2, fibre: 9.5, ala: 0.15, polifenoli: 50, colina: 30.5 }, { alias: 'borlotti cannellini neri' }),
  F('piselli', 'Piselli', 'legumi', 150, '1 porzione', { vitA: 38, vitC: 40, vitE: 0.13, vitK: 24.8, b1: 0.27, b2: 0.13, b6: 0.17, folati: 65, calcio: 25, ferro: 1.47, magnesio: 33, potassio: 244, zinco: 1.24, selenio: 1.8, fibre: 5.7, polifenoli: 20, luteina: 2477, colina: 27.5 }, { cook: true, alias: 'fave taccole' }),
  F('edamame', 'Edamame / fagioli di soia', 'legumi', 100, '1 porzione', { vitC: 6.1, vitE: 0.68, vitK: 26.7, b1: 0.2, b2: 0.16, b6: 0.1, folati: 311, calcio: 63, ferro: 2.27, magnesio: 64, potassio: 436, zinco: 1.37, selenio: 0.8, fibre: 5.2, ala: 0.36, polifenoli: 50, colina: 56.3 }, { alias: 'soia' }),
  F('tofu', 'Tofu', 'legumi', 100, '1 porzione', { vitK: 2.4, b1: 0.15, b2: 0.1, b6: 0.09, folati: 29, calcio: 350, ferro: 2.7, magnesio: 58, potassio: 237, zinco: 1.57, selenio: 17, fibre: 2.3, ala: 0.58, polifenoli: 40, colina: 28 }, { note: 'Calcio alto solo se coagulato con solfato di calcio (vedi etichetta)', alias: 'soia tempeh' }),

  // ---------- Cereali (valori sul crudo/secco) ----------
  F('pastaintegrale', 'Pasta integrale', 'cereali', 80, '1 porzione (cruda)', { vitE: 0.6, b1: 0.45, b2: 0.14, b6: 0.22, folati: 44, calcio: 40, ferro: 3.6, magnesio: 140, potassio: 215, zinco: 2.4, selenio: 10, fibre: 8, polifenoli: 80, colina: 30, betaglucani: 0.5 }, { groups: ['integrali'] }),
  F('pasta', 'Pasta di semola', 'cereali', 80, '1 porzione (cruda)', { b1: 0.09, b2: 0.06, b6: 0.14, folati: 18, calcio: 21, ferro: 1.3, magnesio: 53, potassio: 223, zinco: 1.41, selenio: 10, fibre: 3.2, polifenoli: 20, colina: 15 }, { reco: 0, alias: 'spaghetti penne raffinata' }),
  F('paneintegrale', 'Pane integrale', 'cereali', 50, '1 fetta spessa', { vitE: 0.5, b1: 0.25, b2: 0.1, b6: 0.2, folati: 40, calcio: 30, ferro: 2.5, magnesio: 76, potassio: 250, zinco: 1.8, selenio: 8, fibre: 6.5, polifenoli: 80, colina: 27, betaglucani: 0.4 }, { groups: ['integrali'], alias: 'segale' }),
  F('pane', 'Pane bianco', 'cereali', 50, '1 fetta spessa', { b1: 0.1, b2: 0.05, b6: 0.07, folati: 30, calcio: 25, ferro: 1, magnesio: 25, potassio: 120, zinco: 0.7, selenio: 6, fibre: 2.7, polifenoli: 10, colina: 13 }, { reco: 0, alias: 'raffinato' }),
  F('risointegrale', 'Riso integrale', 'cereali', 80, '1 porzione (crudo)', { vitE: 0.59, b1: 0.4, b2: 0.09, b6: 0.51, folati: 20, calcio: 23, ferro: 1.47, magnesio: 143, potassio: 223, zinco: 2.02, selenio: 15, fibre: 3.5, polifenoli: 50, colina: 20 }, { groups: ['integrali'], alias: 'venere' }),
  F('riso', 'Riso bianco', 'cereali', 80, '1 porzione (crudo)', { b1: 0.07, b2: 0.05, b6: 0.16, folati: 8, calcio: 9, ferro: 0.8, magnesio: 25, potassio: 115, zinco: 1.1, selenio: 15, fibre: 1.3, polifenoli: 5, colina: 5.8 }, { reco: 0 }),
  F('avena', 'Fiocchi d\'avena', 'cereali', 40, '4 cucchiai', { vitE: 0.42, b1: 0.76, b2: 0.14, b6: 0.12, folati: 56, calcio: 54, ferro: 4.72, magnesio: 177, potassio: 429, zinco: 3.97, selenio: 15, fibre: 10.6, ala: 0.1, polifenoli: 40, colina: 40.4, betaglucani: 4.5 }, { groups: ['integrali'], alias: 'porridge muesli' }),
  F('farro', 'Farro', 'cereali', 80, '1 porzione (crudo)', { vitE: 0.8, b1: 0.36, b2: 0.11, b6: 0.23, folati: 45, calcio: 27, ferro: 4.4, magnesio: 136, potassio: 388, zinco: 3.3, selenio: 12, fibre: 10.7, polifenoli: 50, colina: 30, betaglucani: 0.7 }, { groups: ['integrali'], alias: 'spelta' }),
  F('orzo', 'Orzo', 'cereali', 80, '1 porzione (crudo)', { b1: 0.19, b2: 0.11, b6: 0.26, folati: 23, calcio: 29, ferro: 2.5, magnesio: 79, potassio: 280, zinco: 2.1, selenio: 15, fibre: 15.6, polifenoli: 50, colina: 37.8, betaglucani: 4.5 }, { groups: ['integrali'], alias: 'perlato decorticato' }),
  F('quinoa', 'Quinoa / grano saraceno', 'cereali', 80, '1 porzione (cruda)', { vitE: 2.44, b1: 0.36, b2: 0.32, b6: 0.49, folati: 184, calcio: 47, ferro: 4.57, magnesio: 197, potassio: 563, zinco: 3.1, selenio: 8.5, fibre: 7, ala: 0.26, polifenoli: 50, luteina: 163, colina: 70.2 }, { groups: ['integrali'] }),

  // ---------- Frutta secca e semi ----------
  F('noci', 'Noci', 'secca', 30, '6–7 gherigli', { vitE: 0.7, vitK: 2.7, b1: 0.34, b2: 0.15, b6: 0.54, folati: 98, calcio: 98, ferro: 2.91, magnesio: 158, potassio: 441, zinco: 3.09, selenio: 4.9, fibre: 6.7, ala: 9.08, polifenoli: 800, colina: 39.2 }),
  F('mandorle', 'Mandorle', 'secca', 30, '~20 mandorle', { vitE: 25.6, b1: 0.21, b2: 1.14, b6: 0.14, folati: 44, calcio: 269, ferro: 3.71, magnesio: 270, potassio: 733, zinco: 3.12, selenio: 4.1, fibre: 12.5, polifenoli: 187, colina: 52.1 }),
  F('nocciole', 'Nocciole', 'secca', 30, '~20 nocciole', { vitE: 15, vitK: 14.2, b1: 0.64, b2: 0.11, b6: 0.56, folati: 113, calcio: 114, ferro: 4.7, magnesio: 163, potassio: 680, zinco: 2.45, selenio: 2.4, fibre: 9.7, ala: 0.09, polifenoli: 495, luteina: 92, colina: 45.6 }),
  F('pistacchi', 'Pistacchi', 'secca', 30, '~25 pistacchi', { vitA: 26, vitE: 2.86, vitK: 13.2, b1: 0.87, b2: 0.16, b6: 1.7, folati: 51, calcio: 105, ferro: 3.92, magnesio: 121, potassio: 1025, zinco: 2.2, selenio: 7, fibre: 10.6, ala: 0.25, polifenoli: 200, luteina: 2903, colina: 71.4 }),
  F('anacardi', 'Anacardi', 'secca', 30, '~15 anacardi', { vitE: 0.9, vitK: 34.1, b1: 0.42, b2: 0.06, b6: 0.42, folati: 25, calcio: 37, ferro: 6.68, magnesio: 292, potassio: 660, zinco: 5.78, selenio: 19.9, fibre: 3.3, ala: 0.06, polifenoli: 50, colina: 61 }),
  F('brasile', 'Noci del Brasile', 'secca', 5, '1 noce', { vitE: 5.65, b1: 0.62, b6: 0.1, folati: 22, calcio: 160, ferro: 2.43, magnesio: 376, potassio: 659, zinco: 4.06, selenio: 1917, fibre: 7.5, polifenoli: 100, colina: 28.8 }, { reco: 0.7, note: 'Ricchissime di selenio: non più di 1–2 al giorno' }),
  F('lino', 'Semi di lino macinati', 'secca', 10, '1 cucchiaio', { vitE: 0.31, vitK: 4.3, b1: 1.64, b2: 0.16, b6: 0.47, folati: 87, calcio: 255, ferro: 5.73, magnesio: 392, potassio: 813, zinco: 4.34, selenio: 25.4, fibre: 27.3, ala: 22.8, polifenoli: 1528, colina: 78.7 }, { note: 'Vanno macinati, altrimenti non vengono digeriti' }),
  F('chia', 'Semi di chia', 'secca', 10, '1 cucchiaio', { vitE: 0.5, b1: 0.62, b2: 0.17, folati: 49, calcio: 631, ferro: 7.72, magnesio: 335, potassio: 407, zinco: 4.58, selenio: 55.2, fibre: 34.4, ala: 17.8, polifenoli: 100, colina: 40 }),
  F('semizucca', 'Semi di zucca', 'secca', 15, '1 cucchiaio abbondante', { vitE: 2.18, vitK: 7.3, b1: 0.27, b2: 0.15, b6: 0.14, folati: 58, calcio: 46, ferro: 8.82, magnesio: 592, potassio: 809, zinco: 7.81, selenio: 9.4, fibre: 6, ala: 0.12, polifenoli: 50, colina: 63 }),
  F('girasole', 'Semi di girasole', 'secca', 15, '1 cucchiaio abbondante', { vitE: 35.2, b1: 1.48, b2: 0.36, b6: 1.35, folati: 227, calcio: 78, ferro: 5.25, magnesio: 325, potassio: 645, zinco: 5, selenio: 53, fibre: 8.6, ala: 0.06, polifenoli: 150, colina: 55.1 }),
  F('sesamo', 'Semi di sesamo / tahina', 'secca', 15, '1 cucchiaio', { b1: 1.2, b2: 0.25, b6: 0.15, folati: 98, calcio: 300, ferro: 9, magnesio: 350, potassio: 414, zinco: 6, selenio: 34, fibre: 9.3, ala: 0.38, polifenoli: 50, colina: 25.6 }, { alias: 'tahin' }),

  // ---------- Condimenti, bevande e altro ----------
  F('olio', 'Olio extravergine d\'oliva', 'altro', 10, '1 cucchiaio', { vitE: 14.35, vitK: 60.2, ala: 0.76, polifenoli: 55, colina: 0.3, idrossitirosolo: 15 }, { alias: 'evo', note: 'Con ≥250 mg/kg di polifenoli in etichetta, 2 cucchiai danno l\'effetto dimostrato' }),
  F('olive', 'Olive', 'altro', 30, '8–10 olive', { vitA: 20, vitE: 1.65, vitK: 1.4, calcio: 88, ferro: 1, magnesio: 4, potassio: 40, fibre: 3.2, polifenoli: 450, colina: 6.6 }, { plant: true }),
  F('erbe', 'Erbe aromatiche fresche', 'altro', 10, '1 cucchiaio abbondante', { vitA: 421, vitC: 133, vitE: 0.75, vitK: 1640, b1: 0.09, b2: 0.1, b6: 0.09, folati: 152, calcio: 138, ferro: 6.2, magnesio: 50, potassio: 554, zinco: 1.07, fibre: 3.3, polifenoli: 100, luteina: 5561, colina: 12.8 }, { plant: true, reco: 0.6, alias: 'prezzemolo basilico menta rosmarino' }),
  F('curcuma', 'Curcuma in polvere', 'altro', 2, '1 cucchiaino raso', { vitC: 0.7, ferro: 55, magnesio: 208, potassio: 2080, fibre: 22.7, colina: 49.2, curcumina: 3000 }, { plant: true, reco: 0, note: 'Come spezia è sicura; gli integratori di curcuma vanno usati con cautela' }),
  F('cioccolato', 'Cioccolato fondente ≥70%', 'altro', 20, '2 quadretti grandi', { vitE: 0.59, vitK: 7.3, b2: 0.08, calcio: 73, ferro: 11.9, magnesio: 228, potassio: 715, zinco: 3.31, selenio: 6.8, fibre: 10.9, polifenoli: 1664, colina: 12, flavanoli: 400 }, { reco: 0.6, note: 'Flavanoli molto variabili tra prodotti' }),
  F('cacao', 'Cacao amaro in polvere', 'altro', 5, '1 cucchiaino', { b2: 0.24, calcio: 128, ferro: 13.86, magnesio: 499, potassio: 1524, zinco: 6.81, selenio: 14.3, fibre: 37, polifenoli: 3448, colina: 12, flavanoli: 2000 }, { note: 'Il cacao alcalinizzato ("olandese") ha molti meno flavanoli' }),
  F('te', 'Tè nero', 'altro', 200, '1 tazza', { b2: 0.01, magnesio: 1, potassio: 9, polifenoli: 102, colina: 0.4, catechine: 10 }, { unit: 'ml', note: 'Meglio lontano dai pasti: riduce l\'assorbimento del ferro vegetale' }),
  F('teverde', 'Tè verde', 'altro', 200, '1 tazza', { b2: 0.06, magnesio: 1, potassio: 8, polifenoli: 89, colina: 0.4, catechine: 70 }, { unit: 'ml', note: 'Meglio lontano dai pasti: riduce l\'assorbimento del ferro vegetale' }),
  F('caffe', 'Caffè (espresso o moka)', 'altro', 40, '1 tazzina', { b2: 0.18, magnesio: 80, potassio: 115, polifenoli: 250, colina: 2.6 }, { unit: 'ml', reco: 0 }),
  F('bevandaveg', 'Bevanda vegetale arricchita', 'altro', 200, '1 bicchiere', { vitD: 0.75, b2: 0.21, b12: 0.38, calcio: 120, ferro: 0.4, magnesio: 15, potassio: 120, zinco: 0.2, fibre: 0.4, polifenoli: 10, colina: 10 }, { unit: 'ml', note: 'Valori di prodotti arricchiti con calcio, B12 e D: controlla l\'etichetta', alias: 'latte di soia avena mandorla' }),
  F('vino', 'Vino rosso', 'altro', 125, '1 bicchiere', { ferro: 0.46, magnesio: 12, potassio: 127, polifenoli: 101, colina: 5.7, antociani: 10 }, { unit: 'ml', reco: 0, note: 'L\'alcol non è raccomandato per la salute, nemmeno in dosi moderate' }),
];

export const FOOD_BY_ID = Object.fromEntries(FOODS.map(f => [f.id, f]));

// month: 1–12. Gli alimenti senza stagionalità (o conservati, surgelati) sono sempre di stagione.
export function inSeason(food, month) {
  if (!food.season) return true;
  const [from, to] = food.season;
  return from <= to ? month >= from && month <= to : month >= from || month <= to;
}

// Gruppi alimentari protettivi: obiettivi dalle evidenze su alimenti interi.
// kind 'daily' = media al giorno; 'weekly' = totale negli ultimi 7 giorni.
export const FOOD_GROUPS = [
  {
    key: 'fv', label: 'Frutta e verdura', unit: 'g', kind: 'daily', target: 400, evidence: 'mod',
    ref: 'OMS; Aune, Int J Epidemiol 2017',
    info: 'L\'OMS raccomanda almeno 400 g al giorno (patate escluse). Una meta-analisi di 95 studi (Aune 2017) osserva il rischio di mortalità più basso intorno agli 800 g al giorno.',
  },
  {
    key: 'integrali', label: 'Cereali integrali', unit: 'g', kind: 'daily', target: 90, evidence: 'mod',
    ref: 'Aune, BMJ 2016',
    info: '90 g al giorno di cereali integrali (circa 3 porzioni) sono associati a una mortalità totale più bassa del 17% e a meno malattie cardiovascolari e tumori.',
  },
  {
    key: 'secca', label: 'Frutta secca e semi', unit: 'g', kind: 'daily', target: 30, evidence: 'mod',
    ref: 'PREDIMED, NEJM 2018; Linee guida CREA 2018',
    info: 'Una manciata (30 g) al giorno. Nello studio randomizzato PREDIMED la dieta mediterranea arricchita di frutta secca ha ridotto gli eventi cardiovascolari di circa il 30%.',
  },
  {
    key: 'legumi', label: 'Legumi', unit: 'porzioni', kind: 'weekly', target: 4, evidence: 'mod',
    ref: 'Linee guida CREA 2018; dieta MIND',
    info: 'Le linee guida italiane indicano almeno 2–3 porzioni a settimana; consumi più frequenti sono associati a benefici cardiometabolici. Sono anche la fonte vegetale migliore di ferro, zinco e folati.',
  },
  {
    key: 'foglia', label: 'Verdure a foglia verde', unit: 'porzioni', kind: 'weekly', target: 6, evidence: 'lim',
    ref: 'Dieta MIND, Morris 2015',
    info: 'Almeno 6 porzioni a settimana sono associate a un declino cognitivo più lento (studi osservazionali). Fonti concentrate di folati, vitamina K, luteina e nitrati.',
  },
  {
    key: 'crucifere', label: 'Crucifere', unit: 'porzioni', kind: 'weekly', target: 3, evidence: 'lim',
    ref: 'Studi osservazionali; obiettivo indicativo',
    info: 'Cavoli, broccoli, rucola, cime di rapa: contengono glucosinolati (es. sulforafano). Consumi più alti sono associati a minor rischio di alcuni tumori e di mortalità.',
  },
  {
    key: 'bosco', label: 'Frutti di bosco', unit: 'porzioni', kind: 'weekly', target: 2, evidence: 'lim',
    ref: 'Dieta MIND, Morris 2015',
    info: 'Ricchi di antociani. Almeno 2 porzioni a settimana sono associate a un minor declino cognitivo (studi osservazionali).',
  },
  {
    key: 'varieta', label: 'Varietà di vegetali', unit: 'diversi', kind: 'weekly', target: 30, evidence: 'lim',
    ref: 'American Gut Project, McDonald 2018',
    info: 'Chi mangia 30 o più vegetali diversi a settimana ha un microbiota intestinale più vario. Evidenza preliminare, ma un buon stimolo a variare.',
  },
];
