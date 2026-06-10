import { CellValue, KpiDescriptor } from "./types";

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("it-IT", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${formatNumber(value, value % 1 === 0 ? 0 : 2)}%`;
}

export function formatKpi(value: number | undefined, format: KpiDescriptor["format"]): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  switch (format) {
    case "currency":
      return formatCurrency(value);
    case "percent":
      return formatPercent(value);
    default:
      return formatNumber(value);
  }
}

/** Formatta un valore di cella per la visualizzazione (non in editing) */
export function formatCell(value: CellValue): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "number") {
    return formatNumber(value, Number.isInteger(value) ? 0 : 2);
  }
  return String(value);
}

export const KPI_DESCRIPTORS: KpiDescriptor[] = [
  { key: "fatturatoLordo", label: "Fatturato lordo", format: "currency", higherIsBetter: true },
  { key: "fatturatoNetto", label: "Fatturato netto IVA", format: "currency", higherIsBetter: true },
  { key: "numeroAcquisti", label: "Acquisti", format: "number", higherIsBetter: true },
  { key: "leadTotali", label: "Lead totali", format: "number", higherIsBetter: true },
  { key: "conversionePct", label: "Conversione pag. vendita", format: "percent", higherIsBetter: true },
  { key: "utentiUniciPaginaVendita", label: "Utenti unici pag. vendita", format: "number", higherIsBetter: true },
  { key: "visualizzazioniPaginaVendita", label: "Visualizz. pag. vendita", format: "number", higherIsBetter: true },
  { key: "corsisti", label: "Già corsisti", format: "number", higherIsBetter: true },
  { key: "nuoviCorsisti", label: "Nuovi corsisti", format: "number", higherIsBetter: true },
  { key: "aperturaMediaPct", label: "Apertura media email", format: "percent", higherIsBetter: true },
  { key: "clickMediaPct", label: "Click medi email", format: "percent", higherIsBetter: true },
  { key: "adsBudgetTotale", label: "Budget ads", format: "currency", higherIsBetter: false },
  { key: "costoPerLead", label: "Costo per lead", format: "currency", higherIsBetter: false },
  { key: "costoPerAcquisto", label: "Costo per acquisto", format: "currency", higherIsBetter: false },
];
