# CLAUDE.md — Il "brain" del progetto

> Questo file viene letto automaticamente da Claude Code (CLI, estensione VS Code,
> app web). Contiene il contesto del progetto: leggilo prima di lavorare.

## Cos'è questo progetto

**Dashboard Lanci · Carlotta Lolli** — una dashboard per registrare e analizzare i
dati dei lanci di un e-commerce di corsi di cucina. Ogni "lancio" (es. Pesce,
Spezie, Legumi…) ha le sue metriche; c'è una vista "Confronto" che li mette a
paragone.

- **Stack**: Next.js 14 (App Router) · TypeScript · Tailwind CSS · Recharts
- **Deploy**: Vercel
- **Persistenza**: Vercel Blob (cloud, condiviso) con fallback su `localStorage`

## Come si avvia in locale

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # verifica che compili prima di committare
```

Per usare il salvataggio cloud anche in locale, crea `.env.local`:

```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx
```

Senza token, in locale la dashboard salva nel browser (modalità "Solo questo browser").

## Mappa del codice

| Percorso | Cosa contiene |
|---|---|
| `app/layout.tsx` | Layout, font, provider dello store |
| `app/page.tsx` | Pagina principale (renderizza `Dashboard`) |
| `app/api/data/route.ts` | API GET/POST che legge/scrive i dati su Vercel Blob |
| `components/Dashboard.tsx` | Tab, toolbar (export/import/reset), badge sync, pulsante "+ Nuovo lancio" |
| `components/OverviewView.tsx` | Vista "Confronto": tabella KPI + grafici tra lanci |
| `components/LaunchDetail.tsx` | Dettaglio di un lancio: KPI, grafici, tabelle, modifica/elimina |
| `components/EditableTable.tsx` | Tabella editabile (celle, righe, colonne) |
| `components/KpiEditor.tsx` | KPI principali (lettura/editing) |
| `components/LaunchCharts.tsx` | Grafici per singolo lancio |
| `lib/types.ts` | Tipi: `Launch`, `Section`, `LaunchKPIs`, ecc. |
| `lib/store.tsx` | Store React + sync cloud/localStorage + migrazioni |
| `lib/format.ts` | Formattazione numeri/valute/% e descrittori KPI |
| `data/seed.ts` | Dati iniziali dei 5 lanci (ricostruiti dall'Excel) |

## Concetti chiave del modello dati

- Un **`Launch`** ha: `id`, `name`, `periodo`, `date` (ISO, per l'ordinamento),
  `color`, `kpis` (KPI normalizzati e confrontabili) e `sections` (tabelle libere).
- I **`kpis`** sono tutti opzionali: alimentano la vista Confronto. Non ogni lancio
  ha ogni metrica.
- Una **`Section`** è una tabella: `columns` (la prima colonna è sempre
  l'etichetta di riga) + `rows` (`label` + `values[]`).
- I dati salvati sul cloud sono la **fonte di verità**; `localStorage` è cache/fallback.

## Convenzioni

- I numeri si mostrano in formato italiano (`it-IT`); la valuta è EUR.
- Colori di **brand**: oro `#F5C141`, teal scuro `#0A2838`, crema `#FFFEF6`
  (configurati in `tailwind.config.ts` come `brand`, `ink`, `cream`).
- Lo schema dati ha una `SCHEMA_VERSION` in `data/seed.ts`: se cambia la struttura,
  incrementala (invalida la cache locale) e aggiungi una migrazione in `lib/store.tsx`.
- Dopo ogni modifica al codice, esegui `npm run build` per verificare che compili.

## Cose da NON fare

- Non rompere lo schema dati senza aggiornare `SCHEMA_VERSION` + migrazione.
- Non rimuovere il fallback su `localStorage` (deve funzionare anche senza Blob).
- Non committare token o segreti (`.env*` è già in `.gitignore`).

## Idee / TODO futuri

- 🔒 Password di protezione sull'intera dashboard (i dati di fatturato sono sensibili).
- ➕ Aggiungere/riordinare sezioni di un lancio dall'interfaccia.
- 📈 Altri grafici di confronto (es. fatturato per acquisto, andamento nel tempo).
