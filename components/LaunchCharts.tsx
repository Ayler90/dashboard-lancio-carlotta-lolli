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
} from "recharts";
import { Launch, Section } from "@/lib/types";

const PALETTE = [
  "#0a2838", "#f5c141", "#c2683b", "#3e7c6a", "#7a5c99",
  "#e0a92e", "#557e8f", "#9a6a4b", "#5b8a72", "#84a6b6",
  "#b5854c", "#3b6173", "#8c6b4f",
];

function sectionToChartData(section: Section) {
  // Usa la prima colonna valore (indice 0) come metrica.
  return section.rows
    .map((r) => ({ name: r.label, value: typeof r.values[0] === "number" ? (r.values[0] as number) : 0 }))
    .filter((d) => d.value > 0 && d.name.toLowerCase() !== "totale");
}

function ChartCard({
  title,
  data,
  color,
  multicolor,
}: {
  title: string;
  data: { name: string; value: number }[];
  color: string;
  multicolor?: boolean;
}) {
  if (data.length === 0) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">{title}</h3>
      <ResponsiveContainer width="100%" height={Math.max(180, data.length * 30)}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
          <YAxis
            type="category"
            dataKey="name"
            width={150}
            tick={{ fontSize: 11, fill: "#475569" }}
          />
          <Tooltip
            formatter={(v: number) => new Intl.NumberFormat("it-IT").format(v)}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={multicolor ? PALETTE[i % PALETTE.length] : color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Mostra grafici per le sezioni "interessanti" di un lancio
 * (distribuzione per data, per fonte, per prodotto), se presenti.
 */
export default function LaunchCharts({ launch }: { launch: Launch }) {
  const byId = (id: string) => launch.sections.find((s) => s.id === id);

  const dataChart = byId("acquisti-data");
  const sourceChart = byId("acquisti-fonte") ?? byId("attribuzione") ?? byId("lead-fonte");
  const productChart = byId("acquisti-prodotto") ?? byId("vendite-totali");

  const charts: React.ReactNode[] = [];

  if (dataChart) {
    charts.push(
      <ChartCard
        key="data"
        title="Acquisti per giorno"
        data={sectionToChartData(dataChart)}
        color={launch.color}
      />
    );
  }
  if (sourceChart) {
    charts.push(
      <ChartCard
        key="fonte"
        title={sourceChart.title}
        data={sectionToChartData(sourceChart)}
        color={launch.color}
        multicolor
      />
    );
  }
  if (productChart && productChart.id === "acquisti-prodotto") {
    charts.push(
      <ChartCard
        key="prodotto"
        title="Acquisti per prodotto"
        data={sectionToChartData(productChart)}
        color={launch.color}
        multicolor
      />
    );
  }

  if (charts.length === 0) return null;

  return <div className="grid gap-4 lg:grid-cols-2">{charts}</div>;
}
