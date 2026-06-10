"use client";

import React from "react";
import { CellValue, Section } from "@/lib/types";
import { formatCell } from "@/lib/format";

interface Props {
  section: Section;
  editing: boolean;
  onChange: (section: Section) => void;
}

/** Converte l'input di testo in number o string mantenendo i null per vuoto */
function parseCell(raw: string): CellValue {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  // Accetta sia "12,5" che "12.5"
  const normalized = trimmed.replace(/\./g, "").replace(",", ".");
  const asNumber = Number(normalized);
  if (!Number.isNaN(asNumber) && /^-?[\d.]+$/.test(normalized)) {
    return asNumber;
  }
  return trimmed;
}

/** Valore mostrato nell'input durante l'editing (numeri senza separatori) */
function inputValue(value: CellValue): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

export default function EditableTable({ section, editing, onChange }: Props) {
  const updateTitle = (title: string) => onChange({ ...section, title });
  const updateNote = (note: string) => onChange({ ...section, note });

  const updateColumn = (colIndex: number, value: string) => {
    const columns = section.columns.map((c, i) => (i === colIndex ? value : c));
    onChange({ ...section, columns });
  };

  const updateLabel = (rowIndex: number, label: string) => {
    const rows = section.rows.map((r, i) => (i === rowIndex ? { ...r, label } : r));
    onChange({ ...section, rows });
  };

  const updateValue = (rowIndex: number, valIndex: number, raw: string) => {
    const rows = section.rows.map((r, i) => {
      if (i !== rowIndex) return r;
      const values = [...r.values];
      values[valIndex] = parseCell(raw);
      return { ...r, values };
    });
    onChange({ ...section, rows });
  };

  const addRow = () => {
    const valueCount = Math.max(section.columns.length - 1, 1);
    const rows = [...section.rows, { label: "Nuova voce", values: Array(valueCount).fill(null) }];
    onChange({ ...section, rows });
  };

  const removeRow = (rowIndex: number) => {
    const rows = section.rows.filter((_, i) => i !== rowIndex);
    onChange({ ...section, rows });
  };

  const valueColumns = section.columns.slice(1);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        {editing ? (
          <input
            value={section.title}
            onChange={(e) => updateTitle(e.target.value)}
            className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm font-semibold text-slate-800 focus:border-brand-400 focus:outline-none"
          />
        ) : (
          <h3 className="text-sm font-semibold text-slate-800">{section.title}</h3>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              {section.columns.map((col, i) => (
                <th key={i} className="px-4 py-2 font-medium">
                  {editing ? (
                    <input
                      value={col}
                      onChange={(e) => updateColumn(i, e.target.value)}
                      className="w-full min-w-[6rem] rounded border border-slate-200 px-1 py-0.5 text-xs font-medium normal-case focus:border-brand-400 focus:outline-none"
                    />
                  ) : (
                    col
                  )}
                </th>
              ))}
              {editing && <th className="w-10 px-2 py-2" />}
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="px-4 py-2 font-medium text-slate-700">
                  {editing ? (
                    <input
                      value={row.label}
                      onChange={(e) => updateLabel(rowIndex, e.target.value)}
                      className="w-full min-w-[8rem] rounded border border-slate-200 px-1 py-0.5 focus:border-brand-400 focus:outline-none"
                    />
                  ) : (
                    row.label
                  )}
                </td>
                {valueColumns.map((_, valIndex) => (
                  <td key={valIndex} className="px-4 py-2 tabular-nums text-slate-700">
                    {editing ? (
                      <input
                        value={inputValue(row.values[valIndex] ?? null)}
                        onChange={(e) => updateValue(rowIndex, valIndex, e.target.value)}
                        className="w-full min-w-[5rem] rounded border border-slate-200 px-1 py-0.5 text-right focus:border-brand-400 focus:outline-none"
                      />
                    ) : (
                      formatCell(row.values[valIndex] ?? null)
                    )}
                  </td>
                ))}
                {editing && (
                  <td className="px-2 py-2 text-center">
                    <button
                      onClick={() => removeRow(rowIndex)}
                      className="text-slate-400 transition hover:text-brand-600"
                      title="Elimina riga"
                    >
                      ✕
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="border-t border-slate-100 px-4 py-2">
          <button
            onClick={addRow}
            className="text-xs font-medium text-brand-600 transition hover:text-brand-700"
          >
            + Aggiungi riga
          </button>
        </div>
      )}

      {(section.note || editing) && (
        <div className="border-t border-slate-100 px-4 py-2">
          {editing ? (
            <input
              value={section.note ?? ""}
              onChange={(e) => updateNote(e.target.value)}
              placeholder="Nota (opzionale)"
              className="w-full rounded border border-slate-200 px-2 py-1 text-xs text-slate-500 focus:border-brand-400 focus:outline-none"
            />
          ) : (
            <p className="text-xs italic text-slate-500">{section.note}</p>
          )}
        </div>
      )}
    </div>
  );
}
