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
- **Persistenza condivisa (cloud)**: se è collegato Vercel Blob, le modifiche
  vengono salvate sul cloud e sono visibili a tutti (PC, telefono, cliente).
  Senza Blob la dashboard funziona comunque salvando nel browser (localStorage).
  Con **Esporta/Importa** puoi salvare/ricaricare i dati in un file JSON, e con
  **Ripristina** torni ai dati originali. Il badge in alto indica se sei in
  modalità "Cloud" o "Solo questo browser".

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
   premi **Deploy**.

> Se il deploy fallisce con *"No Output Directory named public"*, vai in
> **Settings → Build and Deployment** e imposta **Framework Preset = Next.js**,
> lasciando vuoto **Output Directory**.

## Persistenza condivisa con Vercel Blob

Per far sì che i dati siano condivisi (e non solo nel browser di chi modifica):

1. Nel progetto Vercel → tab **Storage** → **Create Database** → **Blob** →
   collega lo store al progetto.
2. Vercel crea automaticamente la variabile d'ambiente
   `BLOB_READ_WRITE_TOKEN`. Non serve copiarla a mano.
3. **Redeploy** del progetto. Da quel momento il badge in alto mostrerà
   "Cloud" e ogni modifica viene salvata sul cloud per tutti.

Per testare in locale con il cloud, crea un file `.env.local` con:

```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx...
```

(il token si trova nelle impostazioni dello store Blob su Vercel). Senza token,
in locale la dashboard usa il salvataggio nel browser.

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
