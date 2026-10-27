import { test } from 'node:test';
import assert from 'node:assert/strict';

import { FOODS, FOOD_BY_ID } from '../js/data/foods.js';
import { NUTRIENTS, getTargets } from '../js/data/nutrients.js';
import { ANIMAL, defaultProfile } from '../js/data/profile.js';
import { computeDay, computeWeek, evaluate, foodContribution, recommend, adviceCards } from '../js/engine.js';

const KEYS = new Set(NUTRIENTS.map(n => n.key));
const WINTER = '2026-01-15';
const SUMMER = '2026-07-15';

const stateWith = (profile, logs = {}) => ({ profile: { ...defaultProfile(), ...profile }, logs, settings: {} });

test('alimenti e profilo usano solo nutrienti conosciuti', () => {
  for (const f of [...FOODS, ...ANIMAL]) {
    for (const k of Object.keys(f.n)) assert.ok(KEYS.has(k), `${f.key || f.id}: chiave sconosciuta ${k}`);
  }
  assert.equal(new Set(FOODS.map(f => f.id)).size, FOODS.length, 'id duplicati');
});

test('obiettivi: donna vegana di 30 anni', () => {
  const t = getTargets({ ...defaultProfile(), sesso: 'F', eta: 30, dieta: 'vegano' });
  assert.equal(t.ferro, 32.4); // 18 × 1,8
  assert.equal(t.zinco, 13.5); // 9 × 1,5
  assert.equal(t.vitC, 85);
});

test('obiettivi: gravidanza, fumo, età', () => {
  assert.equal(getTargets({ ...defaultProfile(), sesso: 'F', condizione: 'gravidanza' }).folati, 600);
  assert.equal(getTargets({ ...defaultProfile(), sesso: 'M', condizione: 'gravidanza' }).folati, 400);
  assert.equal(getTargets({ ...defaultProfile(), sesso: 'M', fumo: true }).vitC, 140);
  assert.equal(getTargets({ ...defaultProfile(), sesso: 'M', eta: 80 }).vitD, 20);
  assert.equal(getTargets({ ...defaultProfile(), sesso: 'F', eta: 55 }).calcio, 1200);
});

test('cottura e biodisponibilità', () => {
  const broccoli = foodContribution(FOOD_BY_ID.broccoli, 1); // 200 g
  assert.ok(Math.abs(broccoli.vitC - 89 * 2 * 0.7) < 1e-9);
  const spinaci = foodContribution(FOOD_BY_ID.spinaci, 1);
  assert.ok(Math.abs(spinaci.calcio - 99 * 2 * 0.2) < 1e-9);
  const kiwi = foodContribution(FOOD_BY_ID.kiwi, 2); // crudo, nessuna perdita
  assert.ok(Math.abs(kiwi.vitC - 93 * 1.5) < 1e-9);
});

test('il profilo vegano ignora frequenze animali rimaste', () => {
  const s = stateWith({ dieta: 'vegano', freq: { latte: 3, pescegrasso: 4 } });
  const day = computeDay(s, WINTER);
  assert.equal(day.sources.profilo.b12, 0);
  assert.equal(day.sources.profilo.calcio, 0);
});

test('giorno = diario + profilo + integratori + sale/sole', () => {
  const s = stateWith(
    { dieta: 'vegetariano', freq: { latte: 1 }, sale: 'sempre', sole: 'molto', integratori: { vitD: 25 } },
    { [SUMMER]: [{ id: 'lenticchie', p: 1 }, { id: 'kiwi', p: 2 }] },
  );
  const day = computeDay(s, SUMMER);
  assert.ok(day.logged);
  assert.equal(day.sources.diario.folati, 181 * 1.5 + 25 * 1.5);
  assert.equal(day.sources.profilo.calcio, 180); // 150 g di latte/yogurt
  assert.equal(day.sources.integratori.vitD, 25);
  assert.equal(day.sources.altro.iodio, 75);
  assert.equal(day.sources.altro.vitD, 10); // estate
  assert.equal(computeDay(s, WINTER).sources.altro.vitD, 0); // inverno
  assert.equal(day.groups.fv, 150); // i legumi non contano nella frutta e verdura
  assert.equal(day.groups.legumi, 1);
});

test('settimana: media sui soli giorni registrati', () => {
  const s = stateWith({ dieta: 'vegano', sale: 'no' }, {
    '2026-01-10': [{ id: 'mela', p: 1 }],
    '2026-01-12': [{ id: 'mela', p: 3 }],
  });
  const week = computeWeek(s, '2026-01-12');
  assert.equal(week.loggedDays, 2);
  assert.ok(Math.abs(week.totals.fibre - 2.4 * 1.5 * 2) < 1e-9); // (3,6 + 10,8) / 2
  assert.equal(week.groups.fv, 600);
});

test('consigli: a giornata vuota propongono alimenti utili e vari', () => {
  const s = stateWith({ dieta: 'vegano' });
  const rec = recommend(s, WINTER, 'giorno');
  assert.ok(rec.picks.length >= 4);
  assert.ok(rec.after > rec.before);
  const cats = new Set(rec.picks.map(p => p.food.cat));
  assert.ok(cats.size >= 3, 'servono categorie diverse');
  for (const p of rec.picks) assert.ok(p.food.reco > 0);
});

test('consigli: nessun alimento che superi il limite del selenio', () => {
  const s = stateWith({ dieta: 'onnivoro', integratori: { multi: 1 } }, { [WINTER]: [{ id: 'brasile', p: 2 }] });
  const rec = recommend(s, WINTER, 'giorno');
  assert.ok(!rec.picks.some(p => p.food.id === 'brasile'));
});

test('consigli testuali: B12 per chi è vegano senza integratore', () => {
  const s = stateWith({ dieta: 'vegano' });
  const day = computeDay(s, WINTER);
  const evals = evaluate(day.totals, getTargets(s.profile));
  const cards = adviceCards(s, WINTER, evals, computeWeek(s, WINTER));
  assert.equal(cards[0].level, 'alta');
  assert.ok(cards.some(c => c.title.startsWith('Vitamina B12')));
  assert.ok(cards.some(c => c.title === 'Vitamina D in inverno'));
});

test('stagionalità: niente anguria a gennaio, sì in estate', async () => {
  const { inSeason } = await import('../js/data/foods.js');
  assert.equal(inSeason(FOOD_BY_ID.anguria, 1), false);
  assert.equal(inSeason(FOOD_BY_ID.anguria, 7), true);
  assert.equal(inSeason(FOOD_BY_ID.arancia, 12), true); // stagione a cavallo d'anno
  assert.equal(inSeason(FOOD_BY_ID.arancia, 7), false);
  assert.equal(inSeason(FOOD_BY_ID.mela, 7), true); // senza stagionalità
  const s = stateWith({ dieta: 'onnivoro' }, { [WINTER]: [{ id: 'pasta', p: 1 }, { id: 'insalata', p: 1 }] });
  const rec = recommend(s, WINTER, 'giorno', 8);
  assert.ok(!rec.picks.some(p => p.food.id === 'anguria' || p.food.id === 'pomodori'));
});

test('frequenze: una porzione al mese vale 1/30 al giorno, i profili vecchi restano validi', async () => {
  const { normalizeProfile, freqPerDay } = await import('../js/data/profile.js');
  const rossa = ANIMAL.find(a => a.key === 'rossa');
  const mensile = stateWith({ dieta: 'onnivoro', freq: { rossa: { n: 1, per: 'mese' } }, acqua: { litri: 0 } });
  const day = computeDay(mensile, WINTER);
  assert.ok(Math.abs(day.sources.profilo.b12 - 1.9 / 30) < 1e-9);
  assert.ok(Math.abs(day.sources.profilo.creatina - 0.4 / 30) < 1e-9);
  const vecchio = normalizeProfile({ sesso: 'F', eta: 30, dieta: 'onnivoro', freq: { rossa: 2, latte: 1 } });
  assert.deepEqual(vecchio.freq.rossa, { n: 2, per: 'settimana' });
  assert.deepEqual(vecchio.freq.latte, { n: 1, per: 'giorno' });
  assert.equal(vecchio.freq.fegato.n, 0);
  assert.equal(vecchio.acqua.tipo, 'oligo');
  assert.ok(Math.abs(freqPerDay(vecchio, rossa) - 2 / 7) < 1e-12);
});

test('acqua: calcio e magnesio per tipo o da etichetta', () => {
  const oligo = computeDay(stateWith({ dieta: 'vegano', acqua: { litri: 1.5, tipo: 'oligo' } }), WINTER);
  assert.equal(oligo.sources.altro.calcio, 35 * 1.5);
  assert.equal(oligo.sources.altro.magnesio, 8 * 1.5);
  const etichetta = computeDay(stateWith({ dieta: 'vegano', acqua: { litri: 2, tipo: 'etichetta', calcio: 322, magnesio: 19 } }), WINTER);
  assert.equal(etichetta.sources.altro.calcio, 644);
  assert.equal(etichetta.sources.altro.magnesio, 38);
});

test('colina: obiettivo EFSA, conta negli obiettivi; i bioattivi no', async () => {
  const { TARGET_KEYS } = await import('../js/data/nutrients.js');
  assert.equal(getTargets({ ...defaultProfile(), sesso: 'F', condizione: 'allattamento' }).colina, 520);
  assert.ok(TARGET_KEYS.includes('colina'));
  for (const k of ['polifenoli', 'luteina', 'betaglucani', 'creatina', 'curcumina']) assert.ok(!TARGET_KEYS.includes(k), k);
  const s = stateWith({ dieta: 'onnivoro' });
  const evals = evaluate(computeDay(s, WINTER).totals, getTargets(s.profile));
  const byKey = Object.fromEntries(evals.map(e => [e.key, e]));
  assert.equal(byKey.creatina.status, 'info');
  assert.equal(byKey.creatina.target, null);
  assert.equal(byKey.betaglucani.status, 'rif');
  assert.ok(['ok', 'quasi', 'basso'].includes(byKey.colina.status));
  const rec = recommend(s, WINTER, 'giorno');
  assert.equal(rec.total, TARGET_KEYS.length);
});

test('integratori nuovi: creatina, citicolina come colina, psillio come fibre', () => {
  const s = stateWith({ dieta: 'vegano', integratori: { creatina: 3, citicolina: 500, psillio: 5 } });
  const day = computeDay(s, WINTER);
  assert.equal(day.sources.integratori.creatina, 3);
  assert.equal(day.sources.integratori.colina, 100);
  assert.equal(day.sources.integratori.fibre, 4);
});

test('consigli testuali: creatina solo a chi si allena, fegato da evitare in gravidanza', () => {
  const cardsFor = profile => {
    const s = stateWith(profile);
    const evals = evaluate(computeDay(s, WINTER).totals, getTargets(s.profile));
    return adviceCards(s, WINTER, evals, computeWeek(s, WINTER)).map(c => c.title);
  };
  assert.ok(cardsFor({ dieta: 'vegano', forza: true }).includes('Creatina e allenamento di forza'));
  assert.ok(!cardsFor({ dieta: 'vegano', forza: false }).includes('Creatina e allenamento di forza'));
  assert.ok(cardsFor({ dieta: 'onnivoro', sesso: 'F', eta: 30, condizione: 'gravidanza', freq: { fegato: { n: 1, per: 'mese' } } }).includes('Fegato e gravidanza'));
});

test('beta-glucani: 70 g di avena coprono circa i 3 g di riferimento', () => {
  const c = foodContribution(FOOD_BY_ID.avena, 70 / 40);
  assert.ok(Math.abs(c.betaglucani - 3.15) < 1e-9);
});
