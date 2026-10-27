// Nutrienti monitorati, valori di riferimento e limiti massimi.
// Riferimento principale: LARN 2014 (SINU), adulti. Dove i LARN non danno un valore
// si usano EFSA / IOM, e per i composti bioattivi obiettivi indicativi dichiarati come tali.
//
// Non monitorati di proposito (carenza rarissima o apporto garantito da qualsiasi dieta):
// niacina, acido pantotenico, biotina, fosforo, rame, manganese, sodio.

export const NUTRIENT_GROUPS = [
  { key: 'vitamine', label: 'Vitamine' },
  { key: 'minerali', label: 'Minerali' },
  { key: 'essenziali', label: 'Fibre e omega-3' },
  {
    key: 'bioattivi',
    label: 'Composti bioattivi',
    intro:
      'Antiossidanti: dai cibi sì, dagli integratori no. Negli studi randomizzati gli integratori di antiossidanti (beta-carotene, vitamina E, vitamina A ad alte dosi) non hanno ridotto la mortalità e il beta-carotene ha aumentato i tumori al polmone nei fumatori. I benefici osservati riguardano gli alimenti che li contengono.',
  },
];

export const EVIDENCE = {
  ref: { label: 'Valore di riferimento', desc: 'Fabbisogno ufficiale (LARN/EFSA/IOM) basato su evidenze consolidate.' },
  mod: { label: 'Evidenza moderata', desc: 'Obiettivo basato su meta-analisi o grandi coorti; nessun fabbisogno ufficiale.' },
  lim: { label: 'Evidenza limitata', desc: 'Obiettivo indicativo: associazioni osservazionali e dati di composizione incerti.' },
};

// div: fattore di visualizzazione (i dati sono in µg, mostrati in mg).
export const NUTRIENTS = [
  {
    key: 'vitA', name: 'Vitamina A', short: 'Vit. A', unit: 'µg', dp: 0, group: 'vitamine', evidence: 'ref',
    ref: 'LARN 2014 · PRI (µg RAE)',
    info: 'Vista, difese immunitarie, pelle e mucose. Nei vegetali è presente come beta-carotene (carote, zucca, patate dolci, verdure a foglia), che l\'organismo converte in vitamina A in base al bisogno: dai vegetali non c\'è rischio di eccesso.',
  },
  {
    key: 'vitC', name: 'Vitamina C', short: 'Vit. C', unit: 'mg', dp: 0, group: 'vitamine', evidence: 'ref',
    ref: 'LARN 2014 · PRI (+35 mg per chi fuma, IOM)',
    info: 'Antiossidante, sintesi del collagene, aumenta l\'assorbimento del ferro vegetale. È sensibile al calore: per le verdure che si mangiano di solito cotte il calcolo applica una perdita del 30%.',
  },
  {
    key: 'vitD', name: 'Vitamina D', short: 'Vit. D', unit: 'µg', dp: 1, group: 'vitamine', evidence: 'ref',
    ref: 'LARN 2014 · PRI',
    info: 'Ossa, muscoli, sistema immunitario. La fonte principale è la pelle esposta al sole (in Italia soprattutto da aprile a settembre); con il cibo è difficile coprire il fabbisogno. Livelli bassi sono frequenti in inverno, negli anziani e in chi sta poco all\'aperto: l\'eventuale integrazione va valutata con il medico.',
  },
  {
    key: 'vitE', name: 'Vitamina E', short: 'Vit. E', unit: 'mg', dp: 1, group: 'vitamine', evidence: 'ref',
    ref: 'LARN 2014 · AI',
    info: 'Antiossidante che protegge le membrane cellulari. Fonti principali: olio extravergine d\'oliva, frutta secca e semi (mandorle, nocciole, semi di girasole).',
  },
  {
    key: 'vitK', name: 'Vitamina K', short: 'Vit. K', unit: 'µg', dp: 0, group: 'vitamine', evidence: 'ref',
    ref: 'LARN 2014 · AI (EFSA indica 70 µg)',
    info: 'Coagulazione del sangue e salute delle ossa. Abbonda nelle verdure a foglia verde e nei cavoli. Se assumi anticoagulanti antagonisti della vitamina K (es. warfarin) non eliminarla: mantieni un consumo costante e parlane con il medico.',
  },
  {
    key: 'b1', name: 'Tiamina (B1)', short: 'B1', unit: 'mg', dp: 2, group: 'vitamine', evidence: 'ref',
    ref: 'LARN 2014 · PRI',
    info: 'Indispensabile per ricavare energia dai carboidrati. Fonti: cereali integrali, legumi, semi, frutta secca, carne di maiale.',
  },
  {
    key: 'b2', name: 'Riboflavina (B2)', short: 'B2', unit: 'mg', dp: 2, group: 'vitamine', evidence: 'ref',
    ref: 'LARN 2014 · PRI',
    info: 'Metabolismo energetico, salute di pelle e occhi. Fonti: latticini, uova, mandorle, funghi, cereali integrali. Da tenere d\'occhio nella dieta vegana.',
  },
  {
    key: 'b6', name: 'Vitamina B6', short: 'B6', unit: 'mg', dp: 2, group: 'vitamine', evidence: 'ref',
    ref: 'LARN 2014 · PRI',
    info: 'Metabolismo delle proteine, sistema nervoso, globuli rossi. Fonti: legumi, banane, pistacchi, semi, cereali integrali, carne e pesce.',
  },
  {
    key: 'folati', name: 'Folati (B9)', short: 'Folati', unit: 'µg', dp: 0, group: 'vitamine', evidence: 'ref',
    ref: 'LARN 2014 · PRI (µg DFE)',
    info: 'Sintesi del DNA e divisione cellulare; essenziali prima e durante la gravidanza per prevenire i difetti del tubo neurale. Fonti: verdure a foglia (il nome viene da "folium"), legumi, agrumi, frutta secca. Sensibili alla cottura (perdita stimata 25%).',
  },
  {
    key: 'b12', name: 'Vitamina B12', short: 'B12', unit: 'µg', dp: 1, group: 'vitamine', evidence: 'ref',
    ref: 'LARN 2014 · PRI',
    info: 'Sistema nervoso e formazione dei globuli rossi. Si trova quasi solo negli alimenti di origine animale: con una dieta vegana l\'integrazione è indispensabile. Dopo i 50 anni l\'assorbimento dal cibo può ridursi.',
  },
  {
    key: 'calcio', name: 'Calcio', short: 'Calcio', unit: 'mg', dp: 0, group: 'minerali', evidence: 'ref',
    ref: 'LARN 2014 · PRI',
    info: 'Ossa e denti, contrazione muscolare, coagulazione. Fonti: latticini, acque minerali calciche, cavoli e cime di rapa (calcio ben assorbito), tofu con calcio, mandorle, sesamo. Il calcio di spinaci e bietole è poco assorbibile per gli ossalati: qui è conteggiato al 20%.',
  },
  {
    key: 'ferro', name: 'Ferro', short: 'Ferro', unit: 'mg', dp: 1, group: 'minerali', evidence: 'ref',
    ref: 'LARN 2014 · PRI (×1,8 per vegetariani e vegani, IOM)',
    info: 'Trasporto dell\'ossigeno. Il ferro vegetale si assorbe meno di quello della carne: per vegetariani e vegani l\'obiettivo è moltiplicato per 1,8. La vitamina C nello stesso pasto ne aumenta l\'assorbimento; tè e caffè ai pasti lo riducono.',
  },
  {
    key: 'magnesio', name: 'Magnesio', short: 'Magnesio', unit: 'mg', dp: 0, group: 'minerali', evidence: 'ref',
    ref: 'LARN 2014 · PRI (EFSA indica 300–350 mg)',
    info: 'Muscoli, nervi, metabolismo energetico, ossa. Fonti: semi, frutta secca, legumi, cereali integrali, cacao, verdure verdi.',
  },
  {
    key: 'potassio', name: 'Potassio', short: 'Potassio', unit: 'mg', dp: 0, group: 'minerali', evidence: 'ref',
    ref: 'LARN 2014 · AI',
    info: 'Equilibrio dei liquidi e pressione arteriosa: un apporto adeguato aiuta a ridurre la pressione e il rischio di ictus (OMS). Fonti: verdura, frutta, legumi, frutta secca.',
  },
  {
    key: 'zinco', name: 'Zinco', short: 'Zinco', unit: 'mg', dp: 1, group: 'minerali', evidence: 'ref',
    ref: 'LARN 2014 · PRI (+50% per vegetariani e vegani, IOM)',
    info: 'Difese immunitarie, cicatrizzazione, gusto, fertilità. I fitati di legumi e cereali integrali ne riducono l\'assorbimento: per vegetariani e vegani l\'obiettivo è aumentato del 50%. Ammollo, germinazione e lievitazione naturale aiutano.',
  },
  {
    key: 'selenio', name: 'Selenio', short: 'Selenio', unit: 'µg', dp: 0, group: 'minerali', evidence: 'ref',
    ref: 'LARN 2014 · PRI',
    info: 'Componente di enzimi antiossidanti, funzione tiroidea. Il contenuto negli alimenti varia molto con il suolo di coltivazione. Attenzione agli eccessi: 1–2 noci del Brasile al giorno possono già coprire tutto il fabbisogno.',
  },
  {
    key: 'iodio', name: 'Iodio', short: 'Iodio', unit: 'µg', dp: 0, group: 'minerali', evidence: 'ref',
    ref: 'LARN 2014 · PRI',
    info: 'Necessario per gli ormoni tiroidei. In Italia una lieve carenza è ancora diffusa: la prevenzione raccomandata è il sale iodato (poco sale, ma iodato). Altre fonti: pesce, latticini, uova.',
  },
  {
    key: 'fibre', name: 'Fibre', short: 'Fibre', unit: 'g', dp: 1, group: 'essenziali', evidence: 'ref',
    ref: 'LARN 2014 · ≥25 g/die; Reynolds, Lancet 2019',
    info: 'Salute intestinale e microbiota, glicemia, colesterolo, sazietà. Una meta-analisi su Lancet (Reynolds 2019) associa 25–29 g al giorno a una riduzione del 15–30% di mortalità e malattie cardiovascolari, con benefici probabilmente maggiori oltre i 30 g.',
  },
  {
    key: 'ala', name: 'Omega-3 ALA', short: 'ALA', unit: 'g', dp: 1, group: 'essenziali', evidence: 'ref',
    ref: 'IOM · AI (LARN: 0,5–2% dell\'energia)',
    info: 'Omega-3 vegetale essenziale (acido alfa-linolenico). Fonti: noci, semi di lino macinati, semi di chia, olio di colza. Solo una piccola parte viene convertita in EPA e DHA.',
  },
  {
    key: 'epadha', name: 'Omega-3 EPA + DHA', short: 'EPA+DHA', unit: 'mg', dp: 0, group: 'essenziali', evidence: 'ref',
    ref: 'LARN 2014 · AI',
    info: 'Omega-3 a catena lunga per cuore, cervello e retina. Fonte principale: pesce grasso (sardine, alici, sgombro, salmone). Per chi non mangia pesce esiste l\'olio di microalghe.',
  },
  {
    key: 'polifenoli', name: 'Polifenoli', short: 'Polifenoli', unit: 'mg', dp: 0, group: 'bioattivi', evidence: 'mod',
    ref: 'Obiettivo indicativo · PREDIMED (Tresserra-Rimbau 2014); Bondonno 2019',
    info: 'Ampia famiglia di molecole vegetali (flavonoidi, acidi fenolici, lignani, stilbeni). Studi osservazionali come PREDIMED e la coorte danese Diet, Cancer and Health associano apporti più alti a minor mortalità e rischio cardiovascolare. Non esiste un fabbisogno ufficiale: l\'obiettivo è indicativo e i contenuti negli alimenti sono stime (Phenol-Explorer).',
  },
  {
    key: 'luteina', name: 'Luteina + zeaxantina', short: 'Luteina', unit: 'mg', div: 1000, dp: 1, group: 'bioattivi', evidence: 'lim',
    ref: 'Obiettivo indicativo · Seddon 1994; AREDS2',
    info: 'Carotenoidi che si concentrano nella macula dell\'occhio e filtrano la luce blu. Apporti intorno a 6 mg al giorno sono associati a minor rischio di degenerazione maculare (studi osservazionali). Fonti: verdure a foglia verde scuro, zucchine, pistacchi, tuorlo d\'uovo.',
  },
  {
    key: 'licopene', name: 'Licopene', short: 'Licopene', unit: 'mg', div: 1000, dp: 1, group: 'bioattivi', evidence: 'lim',
    ref: 'Obiettivo indicativo · Rowles 2017',
    info: 'Carotenoide rosso di pomodoro e anguria, meglio assorbito dal pomodoro cotto con un filo d\'olio. Associazioni osservazionali con minor rischio di tumore della prostata e di malattie cardiovascolari.',
  },
];

export const NUTRIENT_BY_KEY = Object.fromEntries(NUTRIENTS.map(n => [n.key, n]));

// Livelli massimi tollerabili (UL). scope 'integratori' = il limite vale solo per gli integratori.
export const UL = {
  vitD: { value: 100, src: 'EFSA' },
  vitE: { value: 300, src: 'EFSA' },
  ferro: { value: 40, src: 'EFSA 2024, livello sicuro' },
  zinco: { value: 25, src: 'EFSA' },
  selenio: { value: 255, src: 'EFSA 2023' },
  iodio: { value: 600, src: 'EFSA' },
  calcio: { value: 2500, src: 'EFSA' },
  magnesio: { value: 250, src: 'EFSA, solo da integratori', scope: 'integratori' },
};

const round1 = x => Math.round(x * 10) / 10;

export function getTargets(p) {
  const F = p.sesso === 'F';
  const age = Number(p.eta) || 40;
  const t = {
    vitA: F ? 600 : 700,
    vitC: F ? 85 : 105,
    vitD: age >= 75 ? 20 : 15,
    vitE: F ? 12 : 13,
    vitK: 140,
    b1: F ? 1.1 : 1.2,
    b2: F ? 1.3 : 1.6,
    b6: age > 50 ? (F ? 1.5 : 1.7) : 1.3,
    folati: 400,
    b12: 2.4,
    calcio: (F && age >= 50) || age >= 60 ? 1200 : 1000,
    ferro: F && age < 50 ? 18 : 10,
    magnesio: 240,
    potassio: 3900,
    zinco: F ? 9 : 12,
    selenio: 55,
    iodio: 150,
    fibre: 25,
    ala: F ? 1.1 : 1.6,
    epadha: 250,
    polifenoli: 800,
    luteina: 6000,
    licopene: 10000,
  };
  if (F && p.condizione === 'gravidanza') {
    Object.assign(t, { vitA: 700, vitC: 100, b1: 1.4, b2: 1.7, b6: 1.9, folati: 600, b12: 2.6, calcio: 1200, ferro: 27, zinco: 11, selenio: 60, iodio: 200, epadha: 350 });
  }
  if (F && p.condizione === 'allattamento') {
    Object.assign(t, { vitA: 1000, vitC: 130, b1: 1.4, b2: 1.8, b6: 2.0, folati: 500, b12: 2.8, ferro: 11, zinco: 12, selenio: 70, iodio: 200, epadha: 350 });
  }
  if (p.fumo) t.vitC += 35;
  if (p.dieta === 'vegetariano' || p.dieta === 'vegano') {
    t.ferro = round1(t.ferro * 1.8);
    t.zinco = round1(t.zinco * 1.5);
  }
  return t;
}
