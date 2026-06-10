"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  LabelList,
} from "recharts";
import { DashboardData, KpiDescriptor } from "@/lib/types";
import { KPI_DESCRIPTORS, formatKpi, formatCurrency, formatNumber } from "@/lib/format";

function ComparisonChart({
  title,
  data,
  format,
}: {
  title: string;
  data: { name: string; value: number; color: string }[];
  format: "currency" | "number" | "percent";
}) {
  if (data.length === 0) return null;
  const fmt = (v: number) =>
    format === "currency" ? formatCurrency(v) : format === "percent" ? `${formatNumber(v, 1)}%` : formatNumber(v);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">{title}</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 20, left: 8, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} interval={0} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} width={48} tickFormatter={(v) => formatNumber(v)} />
          <Tooltip
            formatter={(v: number) => fmt(v)}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
            <LabelList dataKey="value" position="top" formatter={fmt} style={{ fontSize: 10, fill: "#475569" }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function OverviewView({ data }: { data: DashboardData }) {
  const launches = [...data.launches].sort((a, b) => a.date.localeCompare(b.date));

  const chartFor = (key: KpiDescriptor["key"]) =>
    launches
      .filter((l) => l.kpis[key] !== undefined)
      .map((l) => ({ name: l.name, value: l.kpis[key] as number, color: l.color }));

  // Per ogni KPI troviamo il "migliore" per evidenziarlo nella tabella.
  const bestByKpi = new Map<string, number>();
  KPI_DESCRIPTORS.forEach((d) => {
    const values = launches
      .map((l) => l.kpis[d.key])
      .filter((v): v is number => v !== undefined);
    if (values.length === 0) return;
    bestByKpi.set(d.key, d.higherIsBetter ? Math.max(...values) : Math.min(...values));
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Confronto lanci</h2>
        <p className="text-sm text-slate-500">
          Visione d&apos;insieme dei {launches.length} lanci. In verde il valore migliore per ogni metrica.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ComparisonChart title="Fatturato lordo" data={chartFor("fatturatoLordo")} format="currency" />
        <ComparisonChart title="Numero acquisti" data={chartFor("numeroAcquisti")} format="number" />
        <ComparisonChart title="Lead totali" data={chartFor("leadTotali")} format="number" />
        <ComparisonChart title="Conversione pagina vendita" data={chartFor("conversionePct")} format="percent" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 font-medium">Metrica</th>
              {launches.map((l) => (
                <th key={l.id} className="px-4 py-3 font-medium">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                    <span className="whitespace-nowrap">{l.name}</span>
                  </span>
                  <span className="font-normal normal-case text-slate-400">{l.periodo}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {KPI_DESCRIPTORS.map((d) => {
              const best = bestByKpi.get(d.key);
              const anyValue = launches.some((l) => l.kpis[d.key] !== undefined);
              if (!anyValue) return null;
              return (
                <tr key={d.key} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="sticky left-0 z-10 bg-white px-4 py-2.5 font-medium text-slate-700">
                    {d.label}
                  </td>
                  {launches.map((l) => {
                    const value = l.kpis[d.key];
                    const isBest =
                      value !== undefined && best !== undefined && value === best && launches.filter((x) => x.kpis[d.key] === best).length < launches.length;
                    return (
                      <td
                        key={l.id}
                        className={`px-4 py-2.5 tabular-nums ${
                          isBest ? "font-semibold text-green-700" : "text-slate-700"
                        }`}
                      >
                        {formatKpi(value, d.format)}
                        {isBest && <span className="ml-1 text-[10px]">▲</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
