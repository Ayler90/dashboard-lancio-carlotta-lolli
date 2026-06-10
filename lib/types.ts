// Modello dati della dashboard lanci.
// Ogni lancio ha un set di KPI normalizzati (usati nella vista Confronto)
// e una serie di sezioni/tabelle di dettaglio completamente editabili.

export type CellValue = number | string | null;

export interface MetricRow {
  /** Etichetta della riga (es. "Iscritti lead") */
  label: string;
  /** Valori in colonna, allineati a `Section.columns` */
  values: CellValue[];
}

export type SectionKind = "table" | "timeseries";

export interface Section {
  id: string;
  title: string;
  /** Intestazioni di colonna (la prima colonna è sempre l'etichetta della riga) */
  columns: string[];
  rows: MetricRow[];
  /** Note opzionali mostrate sotto la tabella */
  note?: string;
}

/**
 * KPI normalizzati e confrontabili tra lanci diversi.
 * Tutti opzionali: non ogni lancio dispone di ogni metrica.
 */
export interface LaunchKPIs {
  leadTotali?: number;
  corsisti?: number;
  nuoviCorsisti?: number;
  numeroAcquisti?: number;
  fatturatoLordo?: number;
  fatturatoNetto?: number;
  utentiUniciPaginaVendita?: number;
  visualizzazioniPaginaVendita?: number;
  /** Conversione pagina vendita: acquisti / utenti unici (in %) */
  conversionePct?: number;
  aperturaMediaPct?: number;
  clickMediaPct?: number;
  adsBudgetTotale?: number;
  costoPerLead?: number;
  costoPerAcquisto?: number;
}

export interface Launch {
  id: string;
  /** Nome breve mostrato nelle tab (es. "Legumi") */
  name: string;
  /** Periodo esteso (es. "Maggio 2026") */
  periodo: string;
  /** Data ISO usata per l'ordinamento cronologico */
  date: string;
  /** Colore identificativo (hex) usato nei grafici */
  color: string;
  kpis: LaunchKPIs;
  sections: Section[];
}

export interface DashboardData {
  /** Versione dello schema, usata per invalidare la cache locale */
  version: number;
  launches: Launch[];
}

/** Descrittore di un KPI per la vista Confronto */
export interface KpiDescriptor {
  key: keyof LaunchKPIs;
  label: string;
  /** Formato di visualizzazione */
  format: "number" | "currency" | "percent";
  /** true se valori più alti sono "migliori" (per evidenziare il best) */
  higherIsBetter: boolean;
}
