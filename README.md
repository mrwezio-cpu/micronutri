# MicroNutri

Web app (PWA, installabile sul telefono) per la prevenzione attraverso i micronutrienti.
Ogni sera un promemoria chiede quali frutta, verdura, legumi, cereali e semi hai mangiato e in che quantità;
l'app stima vitamine, minerali, fibre, omega-3 e composti bioattivi, dice cosa hai coperto e cosa manca,
e consiglia alimenti e porzioni per colmare le lacune. Gli obiettivi sono basati sulle evidenze (EBM).

**Prova online:** https://mrwezio-cpu.github.io/micronutri/

## Avvio

Serve solo Node.js (nessuna dipendenza da installare):

```bash
npm start
```

Poi apri http://localhost:5173. I test del motore di calcolo:

```bash
npm test
```

## Cosa fa

- **Profilo guidato**: sesso, età, gravidanza/allattamento, fumo, allenamento di forza, regime alimentare
  (onnivoro, flessitariano, pescetariano, vegetariano, vegano), frequenza di carne, fegato, pesce, uova e latticini
  (al giorno, a settimana, ogni 2 settimane o al mese), acqua bevuta (tipo o valori dell'etichetta), sole,
  sale iodato, integratori (anche creatina, citicolina, psillio). Questi alimenti non vengono chiesti ogni giorno:
  si stimano dal profilo.
- **Check-in serale**: 6 domande (frutta, verdura, legumi, cereali, frutta secca e semi, altro), ~75 alimenti
  con porzioni in misure di casa. Il primo + vale una porzione, i successivi mezza.
- **Analisi** del giorno e media degli ultimi 7 o 30 giorni: 21 nutrienti essenziali (colina compresa) con barra
  divisa per fonte (diario, profilo, integratori, acqua/sale/sole), dettaglio con fonti principali, livello di
  evidenza e riferimento; composti con effetti specifici (beta-glucani, flavanoli del cacao, polifenoli dell'olio,
  creatina) e bioattivi (polifenoli, antociani, catechine, luteina, licopene, curcumina) mostrati senza trattarli
  come carenze; 8 gruppi alimentari protettivi.
- **Consigli**: selezione degli alimenti che coprono di più le lacune residue, tenendo conto di stagionalità
  e limiti massimi (UL); consigli testuali per ciò che i vegetali non coprono (B12, vitamina D, EPA/DHA, iodio),
  per il profilo (gravidanza, fumo, carni lavorate, età) e per gli eccessi.
- **Integratori e nutraceutici**: per 17 sostanze (creatina, omega-3, colina, citicolina, beta-glucani, psillio,
  fitosteroli, flavanoli del cacao, polifenoli dell'olio, catechine, antociani, curcumina, resveratrolo, luteina,
  magnesio, vitamina D e calcio, ferro) quale beneficio è sostenuto, per chi, a che dose, con livello di evidenza e fonti.
- **Promemoria**: notifica web all'orario scelto e, per un avviso affidabile ad app chiusa, evento ricorrente
  da aggiungere al calendario (.ics).
- Dati solo sul dispositivo, con esportazione/importazione del backup. Funziona offline.

## Metodo in breve

| Ambito | Riferimento |
| --- | --- |
| Vitamine e minerali | LARN 2014 (SINU), con EFSA/IOM dove servono |
| Colina | 400 mg/die (EFSA 2016; 480 in gravidanza, 520 in allattamento) |
| Beta-glucani, flavanoli del cacao, polifenoli dell'olio | Dosi delle indicazioni approvate EFSA/UE: 3 g, 200 mg, 5 mg |
| Vegetariani e vegani | Ferro ×1,8 e zinco ×1,5 (IOM) |
| Fibre | ≥25 g/die (LARN); Reynolds, Lancet 2019 |
| Frutta e verdura | ≥400 g/die (OMS); minimo rischio ~800 g (Aune 2017) |
| Cereali integrali | 90 g/die (Aune, BMJ 2016) |
| Frutta secca | 30 g/die (PREDIMED, CREA 2018) |
| Polifenoli, luteina, licopene | Obiettivi indicativi da studi osservazionali, dichiarati come tali |
| Limiti massimi | EFSA (selenio 2023, ferro 2024) |

Solo i nutrienti essenziali contano negli "obiettivi raggiunti": per polifenoli, carotenoidi e simili non esiste
una carenza da correggere con capsule. Per l'acqua si usano valori tipici per tipo (oligominerale ~35 mg/L di calcio)
o quelli dell'etichetta.

Nel calcolo: perdite di cottura (vitamina C −30%, folati −25%) per le verdure di solito cotte; calcio di spinaci
e bietole al 20% (ossalati); patate escluse dalla frutta e verdura; frutta essiccata ×3. Niacina, acido
pantotenico, biotina, fosforo, rame e manganese non sono monitorati perché la carenza è rarissima.
I dettagli e la bibliografia sono nella schermata **Metodo e fonti** dell'app.

## Struttura

```
index.html, css/styles.css     interfaccia
js/app.js                      viste, navigazione, eventi
js/engine.js                   calcoli, valutazione, consigli (senza DOM, testabile)
js/data/nutrients.js           nutrienti, obiettivi LARN, UL
js/data/foods.js               database alimenti vegetali, gruppi protettivi, stagionalità
js/data/profile.js             diete, frequenze, alimenti animali del profilo, acqua, integratori
js/data/nutraceuticals.js      schede su integratori e nutraceutici (beneficio, per chi, dose, fonti)
js/notifications.js            promemoria e file .ics
sw.js, manifest.webmanifest    PWA (offline, installazione, clic sulla notifica)
tests/engine.test.mjs          test del motore
```

## Provarla sul telefono

Service worker e notifiche richiedono HTTPS (o localhost). Per provarla sul telefono pubblica la cartella su un
hosting statico con HTTPS (GitHub Pages, Netlify, Cloudflare Pages) e usa "Aggiungi a schermata Home".
Su iPhone le notifiche web funzionano solo da iOS 16.4 in poi e solo con l'app aggiunta alla Home.

## Limiti attuali e prossimi passi

- **Notifiche**: senza server, le notifiche web arrivano solo con l'app aperta o in background recente; il
  promemoria da calendario copre il caso ad app chiusa. Per notifiche affidabili serve una versione nativa
  (React Native/Expo o Swift, riutilizzando `engine.js` e i dati) oppure un server Web Push.
- **Dati di composizione**: valori arrotondati da USDA/CREA; i polifenoli sono la stima più incerta. Prima di un
  rilascio pubblico andrebbero rivisti da un dietista o nutrizionista e allineati integralmente alle tabelle CREA.
- **Aspetti regolatori**: se l'app venisse proposta per diagnosticare o trattare carenze rientrerebbe nel
  regolamento europeo sui dispositivi medici (MDR); come strumento educativo di prevenzione va mantenuto il
  linguaggio attuale. Se in futuro i dati venissero sincronizzati su un server, sono dati sanitari (GDPR art. 9).
