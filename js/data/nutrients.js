// Nutrienti e composti monitorati, valori di riferimento e limiti massimi.
// Riferimento principale: LARN 2014 (SINU), adulti. Dove i LARN non danno un valore
// si usano EFSA / IOM.
//
// kind:
//   'target'      → nutriente essenziale con fabbisogno: conta negli "obiettivi raggiunti"
//   'riferimento' → dose a cui è stato osservato o dimostrato un effetto preciso: si mostra il confronto,
//                   ma non è un fabbisogno e non conta negli obiettivi (non esiste una "carenza")
//   'info'        → solo l'apporto stimato, senza obiettivo
//
// Non monitorati di proposito (carenza rarissima o apporto garantito da qualsiasi dieta):
// niacina, acido pantotenico, biotina, fosforo, rame, manganese, sodio.

export const NUTRIENT_GROUPS = [
  { key: 'vitamine', label: 'Vitamine e colina' },
  { key: 'minerali', label: 'Minerali' },
  { key: 'essenziali', label: 'Fibre e omega-3' },
  {
    key: 'specifici',
    label: 'Composti con effetti specifici',
    intro: 'Non sono fabbisogni: sono le dosi a cui studi controllati hanno dimostrato un effetto preciso (per esempio sul colesterolo LDL). Servono a chi cerca quel beneficio e non contano negli obiettivi.',
  },
  {
    key: 'bioattivi',
    label: 'Composti bioattivi',
    intro: 'Non esiste una "carenza" di polifenoli o carotenoidi da correggere con capsule: questi valori misurano la varietà vegetale della dieta. Gli integratori di antiossidanti (beta-carotene, vitamina E, vitamina A ad alte dosi) negli studi randomizzati non hanno ridotto la mortalità e il beta-carotene ha aumentato i tumori al polmone nei fumatori.',
  },
];

export const EVIDENCE = {
  ref: { label: 'Valore di riferimento', desc: 'Fabbisogno ufficiale (LARN/EFSA/IOM) basato su evidenze consolidate.' },
  alta: { label: 'Effetto dimostrato', desc: 'Effetto specifico dimostrato da studi controllati, con dose definita (spesso un\'indicazione approvata dall\'EFSA).' },
  mod: { label: 'Evidenza moderata', desc: 'Basata su meta-analisi o grandi coorti; nessun fabbisogno ufficiale.' },
  lim: { label: 'Evidenza limitata', desc: 'Associazioni osservazionali o risultati preliminari; dati di composizione incerti.' },
  ins: { label: 'Evidenza insufficiente', desc: 'Il beneficio proposto non è stato dimostrato in modo coerente.' },
};

// div: fattore di visualizzazione (i dati sono in µg, mostrati in mg).
export const NUTRIENTS = [
  {
    key: 'vitA', name: 'Vitamina A', short: 'Vit. A', unit: 'µg', dp: 0, group: 'vitamine', kind: 'target', evidence: 'ref',
    ref: 'LARN 2014 · PRI (µg RAE)',
    info: 'Vista, difese immunitarie, pelle e mucose. Nei vegetali è presente come beta-carotene (carote, zucca, patate dolci, verdure a foglia), che l\'organismo converte in vitamina A in base al bisogno: dai vegetali non c\'è rischio di eccesso.',
  },
  {
    key: 'vitC', name: 'Vitamina C', short: 'Vit. C', unit: 'mg', dp: 0, group: 'vitamine', kind: 'target', evidence: 'ref',
    ref: 'LARN 2014 · PRI (+35 mg per chi fuma, IOM)',
    info: 'Antiossidante, sintesi del collagene, aumenta l\'assorbimento del ferro vegetale. È sensibile al calore: per le verdure che si mangiano di solito cotte il calcolo applica una perdita del 30%.',
  },
  {
    key: 'vitD', name: 'Vitamina D', short: 'Vit. D', unit: 'µg', dp: 1, group: 'vitamine', kind: 'target', evidence: 'ref',
    ref: 'LARN 2014 · PRI',
    info: 'Ossa, muscoli, sistema immunitario. La fonte principale è la pelle esposta al sole (in Italia soprattutto da aprile a settembre); con il cibo è difficile coprire il fabbisogno. L\'integrazione serve a correggere insufficienze reali (inverno, anziani, poca esposizione, malassorbimento): data a tutti gli adulti sani, negli studi ha dato benefici molto meno convincenti. Valutala con il medico.',
  },
  {
    key: 'vitE', name: 'Vitamina E', short: 'Vit. E', unit: 'mg', dp: 1, group: 'vitamine', kind: 'target', evidence: 'ref',
    ref: 'LARN 2014 · AI',
    info: 'Antiossidante che protegge le membrane cellulari. Fonti principali: olio extravergine d\'oliva, frutta secca e semi (mandorle, nocciole, semi di girasole).',
  },
  {
    key: 'vitK', name: 'Vitamina K', short: 'Vit. K', unit: 'µg', dp: 0, group: 'vitamine', kind: 'target', evidence: 'ref',
    ref: 'LARN 2014 · AI (EFSA indica 70 µg)',
    info: 'Coagulazione del sangue e salute delle ossa. Abbonda nelle verdure a foglia verde e nei cavoli. Se assumi anticoagulanti antagonisti della vitamina K (es. warfarin) non eliminarla: mantieni un consumo costante e parlane con il medico.',
  },
  {
    key: 'b1', name: 'Tiamina (B1)', short: 'B1', unit: 'mg', dp: 2, group: 'vitamine', kind: 'target', evidence: 'ref',
    ref: 'LARN 2014 · PRI',
    info: 'Indispensabile per ricavare energia dai carboidrati. Fonti: cereali integrali, legumi, semi, frutta secca, carne di maiale.',
  },
  {
    key: 'b2', name: 'Riboflavina (B2)', short: 'B2', unit: 'mg', dp: 2, group: 'vitamine', kind: 'target', evidence: 'ref',
    ref: 'LARN 2014 · PRI',
    info: 'Metabolismo energetico, salute di pelle e occhi. Fonti: latticini, uova, mandorle, funghi, cereali integrali. Da tenere d\'occhio nella dieta vegana.',
  },
  {
    key: 'b6', name: 'Vitamina B6', short: 'B6', unit: 'mg', dp: 2, group: 'vitamine', kind: 'target', evidence: 'ref',
    ref: 'LARN 2014 · PRI',
    info: 'Metabolismo delle proteine, sistema nervoso, globuli rossi. Fonti: legumi, banane, pistacchi, semi, cereali integrali, carne e pesce.',
  },
  {
    key: 'folati', name: 'Folati (B9)', short: 'Folati', unit: 'µg', dp: 0, group: 'vitamine', kind: 'target', evidence: 'ref',
    ref: 'LARN 2014 · PRI (µg DFE)',
    info: 'Sintesi del DNA e divisione cellulare. Prima e durante la gravidanza l\'acido folico previene i difetti del tubo neurale. Fonti: verdure a foglia (il nome viene da "folium"), legumi, agrumi, frutta secca. Sensibili alla cottura (perdita stimata 25%).',
  },
  {
    key: 'b12', name: 'Vitamina B12', short: 'B12', unit: 'µg', dp: 1, group: 'vitamine', kind: 'target', evidence: 'ref',
    ref: 'LARN 2014 · PRI',
    info: 'Sistema nervoso e formazione dei globuli rossi. Si trova quasi solo negli alimenti di origine animale: con una dieta vegana l\'integrazione è indispensabile. L\'assorbimento si riduce con l\'età, con malassorbimento e con alcuni farmaci (metformina, inibitori di pompa protonica).',
  },
  {
    key: 'colina', name: 'Colina', short: 'Colina', unit: 'mg', dp: 0, group: 'vitamine', kind: 'target', evidence: 'ref',
    ref: 'EFSA 2016 · AI (non presente nei LARN 2014)',
    info: 'Nutriente essenziale per fegato, muscoli, membrane cellulari e acetilcolina. Una vera carenza danneggia fegato e muscoli, ma negli adulti sani è rara; apporti sotto l\'obiettivo invece sono comuni. Assumerne più del fabbisogno non migliora la memoria. Fonti: uova (un uovo ne dà circa 150 mg), carne, pesce, soia, legumi, quinoa, frutta secca, cavolfiore.',
  },
  {
    key: 'calcio', name: 'Calcio', short: 'Calcio', unit: 'mg', dp: 0, group: 'minerali', kind: 'target', evidence: 'ref',
    ref: 'LARN 2014 · PRI',
    info: 'Ossa e denti, contrazione muscolare, coagulazione. Fonti: latticini, acque minerali calciche (assorbito come quello del latte), cavoli e cime di rapa, tofu con calcio, mandorle, sesamo. Il calcio di spinaci e bietole è poco assorbibile per gli ossalati: qui è conteggiato al 20%.',
  },
  {
    key: 'ferro', name: 'Ferro', short: 'Ferro', unit: 'mg', dp: 1, group: 'minerali', kind: 'target', evidence: 'ref',
    ref: 'LARN 2014 · PRI (×1,8 per vegetariani e vegani, IOM)',
    info: 'Trasporto dell\'ossigeno. Il ferro vegetale si assorbe meno di quello della carne: per vegetariani e vegani l\'obiettivo è moltiplicato per 1,8. La vitamina C nello stesso pasto ne aumenta l\'assorbimento; tè e caffè ai pasti lo riducono. Fattori di rischio: mestruazioni abbondanti, donazioni di sangue, gravidanza.',
  },
  {
    key: 'magnesio', name: 'Magnesio', short: 'Magnesio', unit: 'mg', dp: 0, group: 'minerali', kind: 'target', evidence: 'ref',
    ref: 'LARN 2014 · PRI (EFSA indica 300–350 mg)',
    info: 'Muscoli, nervi, metabolismo energetico, ossa. Fonti: semi, frutta secca, legumi, cereali integrali, cacao, verdure verdi, alcune acque minerali. Gli integratori correggono l\'ipomagnesemia, hanno un piccolo effetto sulla pressione e forse sull\'emicrania; per dormire meglio, senza carenza, le prove sono deboli.',
  },
  {
    key: 'potassio', name: 'Potassio', short: 'Potassio', unit: 'mg', dp: 0, group: 'minerali', kind: 'target', evidence: 'ref',
    ref: 'LARN 2014 · AI',
    info: 'Equilibrio dei liquidi e pressione arteriosa: un apporto maggiore riduce la pressione, soprattutto in chi è iperteso. Un apporto basso può coesistere con un potassio nel sangue normale. Fonti: verdura, frutta, legumi, frutta secca.',
  },
  {
    key: 'zinco', name: 'Zinco', short: 'Zinco', unit: 'mg', dp: 1, group: 'minerali', kind: 'target', evidence: 'ref',
    ref: 'LARN 2014 · PRI (+50% per vegetariani e vegani, IOM)',
    info: 'Difese immunitarie, cicatrizzazione, gusto, fertilità. I fitati di legumi e cereali integrali ne riducono l\'assorbimento: per vegetariani e vegani l\'obiettivo è aumentato del 50%. Ammollo, germinazione e lievitazione naturale aiutano.',
  },
  {
    key: 'selenio', name: 'Selenio', short: 'Selenio', unit: 'µg', dp: 0, group: 'minerali', kind: 'target', evidence: 'ref',
    ref: 'LARN 2014 · PRI',
    info: 'Componente di enzimi antiossidanti, funzione tiroidea. Il contenuto negli alimenti varia molto con il suolo di coltivazione. Attenzione agli eccessi: 1–2 noci del Brasile al giorno possono già coprire tutto il fabbisogno.',
  },
  {
    key: 'iodio', name: 'Iodio', short: 'Iodio', unit: 'µg', dp: 0, group: 'minerali', kind: 'target', evidence: 'ref',
    ref: 'LARN 2014 · PRI',
    info: 'Necessario per gli ormoni tiroidei e per lo sviluppo del feto. In Italia una lieve carenza è ancora diffusa: la prevenzione raccomandata è il sale iodato (poco sale, ma iodato). Altre fonti: pesce, latticini, uova.',
  },
  {
    key: 'fibre', name: 'Fibre', short: 'Fibre', unit: 'g', dp: 1, group: 'essenziali', kind: 'target', evidence: 'ref',
    ref: 'LARN 2014 e EFSA · ≥25 g/die; Reynolds, Lancet 2019',
    info: 'Salute intestinale e microbiota, glicemia, colesterolo, sazietà. Una meta-analisi su Lancet (Reynolds 2019) associa 25–29 g al giorno a una riduzione del 15–30% di mortalità e malattie cardiovascolari, con benefici probabilmente maggiori oltre i 30 g.',
  },
  {
    key: 'ala', name: 'Omega-3 ALA', short: 'ALA', unit: 'g', dp: 1, group: 'essenziali', kind: 'target', evidence: 'ref',
    ref: 'IOM · AI (LARN: 0,5–2% dell\'energia)',
    info: 'Omega-3 vegetale essenziale (acido alfa-linolenico). Fonti: noci, semi di lino macinati, semi di chia, olio di colza. Solo una piccola parte viene convertita in EPA e DHA.',
  },
  {
    key: 'epadha', name: 'Omega-3 EPA + DHA', short: 'EPA+DHA', unit: 'mg', dp: 0, group: 'essenziali', kind: 'target', evidence: 'ref',
    ref: 'LARN 2014 ed EFSA · 250 mg/die',
    info: 'Omega-3 a catena lunga per cuore, cervello e retina. I 250 mg al giorno sono il riferimento alimentare (circa due porzioni di pesce a settimana, di cui una di pesce grasso). Sono un\'altra cosa dalle dosi farmacologiche (2–4 g) che abbassano i trigliceridi: le comuni capsule non hanno un beneficio preventivo dimostrato per tutti. Per chi non mangia pesce esiste l\'olio di microalghe.',
  },

  // ---------- Composti con effetti specifici ----------
  {
    key: 'betaglucani', name: 'Beta-glucani (avena, orzo)', short: 'Beta-glucani', unit: 'g', dp: 1, group: 'specifici', kind: 'riferimento', evidence: 'alta',
    ref: 'Indicazione approvata EFSA · 3 g/die per il colesterolo LDL', benefit: 'Riduce il colesterolo LDL',
    info: 'Fibre solubili di avena e orzo. Con almeno 3 g al giorno riducono il colesterolo LDL: è un\'indicazione sulla salute approvata dall\'EFSA. Servono circa 70 g di fiocchi d\'avena, oppure avena e orzo insieme. Utili soprattutto con il colesterolo alto.',
  },
  {
    key: 'flavanoli', name: 'Flavanoli del cacao', short: 'Flavanoli', unit: 'mg', dp: 0, group: 'specifici', kind: 'riferimento', evidence: 'alta',
    ref: 'Indicazione approvata EFSA 2014 · 200 mg/die; studio COSMOS 2022', benefit: 'Migliora la funzione dei vasi',
    info: '200 mg al giorno di flavanoli del cacao migliorano la funzione endoteliale, cioè la capacità dei vasi di dilatarsi (indicazione approvata dall\'EFSA). Non è dimostrato che riducano infarti e ictus: nello studio COSMOS (500 mg/die) gli eventi cardiovascolari totali non sono diminuiti in modo significativo. Il contenuto varia molto: il cacao alcalinizzato ("olandese") e molti cioccolati ne contengono poco.',
  },
  {
    key: 'idrossitirosolo', name: 'Polifenoli dell\'olio EVO', short: 'Polif. olio', unit: 'mg', dp: 1, group: 'specifici', kind: 'riferimento', evidence: 'alta',
    ref: 'Reg. UE 432/2012 · 5 mg/die di idrossitirosolo e derivati', benefit: 'Protegge i grassi del sangue dall\'ossidazione',
    info: 'Idrossitirosolo e derivati dell\'olio extravergine. 5 mg al giorno, contenuti in 20 g di un olio con almeno 250 mg/kg di polifenoli (lo dichiara l\'etichetta), proteggono i grassi del sangue dallo stress ossidativo. Il calcolo usa un olio extravergine medio, che ne ha meno. Questo non dimostra l\'utilità di estratti isolati in capsule.',
  },
  {
    key: 'creatina', name: 'Creatina', short: 'Creatina', unit: 'g', dp: 2, group: 'specifici', kind: 'info', evidence: 'alta',
    ref: 'NIH ODS; International Society of Sports Nutrition 2017', benefit: 'Forza e potenza, con allenamento',
    info: 'Non è un nutriente essenziale: l\'organismo ne produce circa 1 g al giorno; carne e pesce ne aggiungono 1–2 g negli onnivori, quasi nulla nei vegani, che hanno riserve muscolari più basse. Come integratore (creatina monoidrato, 3–5 g al giorno) ha prove solide per forza, potenza e adattamento all\'allenamento contro resistenza, anche in chi non ha alcuna carenza. Il beneficio sulla memoria è incerto.',
  },

  // ---------- Composti bioattivi ----------
  {
    key: 'polifenoli', name: 'Polifenoli totali', short: 'Polifenoli', unit: 'mg', dp: 0, group: 'bioattivi', kind: 'riferimento', evidence: 'lim',
    ref: 'Indicativo · PREDIMED (Tresserra-Rimbau 2014); Bondonno 2019',
    info: 'Ampia famiglia di molecole vegetali (flavonoidi, acidi fenolici, lignani, stilbeni). Studi osservazionali come PREDIMED e la coorte danese Diet, Cancer and Health associano apporti più alti a minor mortalità. Non esiste un fabbisogno: il riferimento è indicativo e i contenuti negli alimenti sono stime (Phenol-Explorer).',
  },
  {
    key: 'antociani', name: 'Antociani', short: 'Antociani', unit: 'mg', dp: 0, group: 'bioattivi', kind: 'info', evidence: 'lim',
    ref: 'USDA Flavonoid Database; revisioni di RCT su funzione vascolare',
    info: 'Pigmenti rosso-blu di frutti di bosco, uva nera, ciliegie, radicchio rosso e cavolo rosso. Risultati promettenti su funzione vascolare e alcuni parametri metabolici; prove meno solide su infarti, ictus o diabete.',
  },
  {
    key: 'catechine', name: 'Catechine del tè', short: 'Catechine', unit: 'mg', dp: 0, group: 'bioattivi', kind: 'info', evidence: 'lim',
    ref: 'NCCIH; EFSA 2018 sulla sicurezza dell\'EGCG',
    info: 'Flavanoli del tè, soprattutto verde (EGCG). Il tè dà una modesta riduzione del colesterolo LDL; la prevenzione dei tumori non è dimostrata. La bevanda è sicura, mentre gli estratti concentrati in capsule possono danneggiare il fegato (EFSA 2018: rischio da 800 mg/die di EGCG).',
  },
  {
    key: 'luteina', name: 'Luteina + zeaxantina', short: 'Luteina', unit: 'mg', div: 1000, dp: 1, group: 'bioattivi', kind: 'riferimento', evidence: 'lim',
    ref: 'Indicativo · Seddon 1994; AREDS2',
    info: 'Carotenoidi che si concentrano nella macula dell\'occhio. Hanno un beneficio dimostrato solo nella formulazione AREDS2, per pazienti selezionati con degenerazione maculare; negli occhi sani non è dimostrata una prevenzione. Il riferimento di 6 mg viene da studi osservazionali. Fonti: verdure a foglia verde scuro, zucchine, pistacchi, tuorlo d\'uovo.',
  },
  {
    key: 'licopene', name: 'Licopene', short: 'Licopene', unit: 'mg', div: 1000, dp: 1, group: 'bioattivi', kind: 'riferimento', evidence: 'lim',
    ref: 'Indicativo · Rowles 2017',
    info: 'Carotenoide rosso di pomodoro e anguria, meglio assorbito dal pomodoro cotto con un filo d\'olio. Associazioni osservazionali con minor rischio di tumore della prostata e di malattie cardiovascolari.',
  },
  {
    key: 'curcumina', name: 'Curcumina', short: 'Curcumina', unit: 'mg', dp: 0, group: 'bioattivi', kind: 'info', evidence: 'lim',
    ref: 'NCCIH; Ministero della Salute 2019',
    info: 'Pigmento della curcuma, poco assorbito. Possibile beneficio sui sintomi dell\'artrosi del ginocchio con formulazioni specifiche, ma prove limitate. Come spezia in cucina è sicura; con gli integratori di curcuma in Italia sono stati segnalati casi di epatite (Ministero della Salute, 2019) e può interagire con gli anticoagulanti.',
  },
];

export const NUTRIENT_BY_KEY = Object.fromEntries(NUTRIENTS.map(n => [n.key, n]));
export const TARGET_KEYS = NUTRIENTS.filter(n => n.kind === 'target').map(n => n.key);

// Livelli massimi tollerabili (UL). scope 'integratori' = il limite vale solo per gli integratori.
export const UL = {
  vitD: { value: 100, src: 'EFSA' },
  vitE: { value: 300, src: 'EFSA' },
  ferro: { value: 40, src: 'EFSA 2024, livello sicuro' },
  zinco: { value: 25, src: 'EFSA' },
  selenio: { value: 255, src: 'EFSA 2023' },
  iodio: { value: 600, src: 'EFSA' },
  calcio: { value: 2500, src: 'EFSA' },
  colina: { value: 3500, src: 'IOM' },
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
    colina: 400,
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
    // riferimenti per effetti specifici o indicativi (non fabbisogni)
    betaglucani: 3,
    flavanoli: 200,
    idrossitirosolo: 5,
    polifenoli: 800,
    luteina: 6000,
    licopene: 10000,
  };
  if (F && p.condizione === 'gravidanza') {
    Object.assign(t, { vitA: 700, vitC: 100, b1: 1.4, b2: 1.7, b6: 1.9, folati: 600, b12: 2.6, colina: 480, calcio: 1200, ferro: 27, zinco: 11, selenio: 60, iodio: 200, epadha: 350 });
  }
  if (F && p.condizione === 'allattamento') {
    Object.assign(t, { vitA: 1000, vitC: 130, b1: 1.4, b2: 1.8, b6: 2.0, folati: 500, b12: 2.8, colina: 520, ferro: 11, zinco: 12, selenio: 70, iodio: 200, epadha: 350 });
  }
  if (p.fumo) t.vitC += 35;
  if (p.dieta === 'vegetariano' || p.dieta === 'vegano') {
    t.ferro = round1(t.ferro * 1.8);
    t.zinco = round1(t.zinco * 1.5);
  }
  return t;
}
