"use client";

import React from "react";
import { Launch, LaunchKPIs } from "@/lib/types";
import { KPI_DESCRIPTORS, formatKpi } from "@/lib/format";

interface Props {
  launch: Launch;
  editing: boolean;
  onChange: (kpis: LaunchKPIs) => void;
}

/**
 * Pannello dei KPI principali del lancio. In modalità lettura mostra card,
 * in editing mostra input. Questi valori alimentano la vista Confronto.
 */
export default function KpiEditor({ launch, editing, onChange }: Props) {
  const update = (key: keyof LaunchKPIs, raw: string) => {
    const trimmed = raw.trim().replace(/\./g, "").replace(",", ".");
    const next: LaunchKPIs = { ...launch.kpis };
    if (trimmed === "") {
      delete next[key];
    } else {
      const n = Number(trimmed);
      next[key] = Number.isNaN(n) ? undefined : n;
    }
    onChange(next);
  };

  if (editing) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {KPI_DESCRIPTORS.map((d) => (
          <label key={d.key} className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-white p-3">
            <span className="text-xs font-medium text-slate-500">{d.label}</span>
            <input
              value={launch.kpis[d.key] ?? ""}
              onChange={(e) => update(d.key, e.target.value)}
              placeholder="—"
              className="w-full rounded border border-slate-200 px-2 py-1 text-right text-sm tabular-nums focus:border-brand-400 focus:outline-none"
            />
          </label>
        ))}
      </div>
    );
  }

  const present = KPI_DESCRIPTORS.filter((d) => launch.kpis[d.key] !== undefined);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {present.map((d) => (
        <div
          key={d.key}
          className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
        >
          <div className="text-xs font-medium text-slate-500">{d.label}</div>
          <div className="mt-1 text-lg font-semibold tabular-nums text-slate-800">
            {formatKpi(launch.kpis[d.key], d.format)}
          </div>
        </div>
      ))}
    </div>
  );
}
