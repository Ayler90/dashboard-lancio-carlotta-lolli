# Dashboard Lanci · Carlotta Lolli

Dashboard per registrare e analizzare i dati dei lanci dei corsi di cucina.
Costruita con **Next.js + TypeScript + Tailwind CSS + Recharts**, pronta per il
deploy su **Vercel**.

## Cosa fa

- **Tab "Confronto"**: visione d'insieme di tutti i lanci, con tabella KPI a
  confronto (valore migliore evidenziato) e grafici di fatturato, acquisti,
  lead e conversione.
- **Una tab per ogni lancio** (Pesce, Meal Prep, Spezie, Meal Prep 2026,
  Legumi): KPI principali, grafici dedicati (acquisti per giorno, per fonte,
  per prodotto) e tutte le tabelle di dettaglio.
- **Modifica completa**: dal pulsante "✎ Modifica" puoi cambiare ogni valore,
  etichetta, colonna, aggiungere o togliere righe e aggiornare i KPI.
- **Persistenza locale**: le modifiche vengono salvate nel browser
  (localStorage). Con **Esporta/Importa** puoi salvare e ricaricare i dati in
  un file JSON, e con **Ripristina** torni ai dati originali.

> I dati iniziali sono stati ricostruiti dal file Excel `LANCI Carlotta Lolli`.

## Sviluppo in locale

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Deploy su Vercel

1. Fai il push del repository su GitHub (già collegato).
2. Su [vercel.com](https://vercel.com) → **Add New Project** → importa questo
   repository.
3. Vercel riconosce Next.js in automatico: lascia le impostazioni di default e
   premi **Deploy**. Nessuna variabile d'ambiente necessaria.

## Aggiungere un nuovo lancio

I dati iniziali sono in [`data/seed.ts`](data/seed.ts): basta aggiungere un
nuovo oggetto `Launch` all'array `launches`. In alternativa, esporta il JSON
dalla dashboard, aggiungi il lancio e reimportalo.

## Struttura

```
app/            layout e pagina principale
components/     Dashboard, viste, tabelle editabili, grafici
lib/            tipi, store con persistenza, formattazione
data/seed.ts    dati iniziali dei lanci
```
