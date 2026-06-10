"use client";

import React, { useMemo, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { DashboardData } from "@/lib/types";
import { SCHEMA_VERSION } from "@/data/seed";
import OverviewView from "./OverviewView";
import LaunchDetail from "./LaunchDetail";

const OVERVIEW = "__overview__";

export default function Dashboard() {
  const { data, replaceData, resetToSeed, hydrated } = useStore();
  const [active, setActive] = useState<string>(OVERVIEW);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const launches = useMemo(
    () => [...data.launches].sort((a, b) => a.date.localeCompare(b.date)),
    [data.launches]
  );

  const activeLaunch = launches.find((l) => l.id === active);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lanci-carlotta-lolli-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as DashboardData;
        if (!parsed.launches || !Array.isArray(parsed.launches)) {
          throw new Error("formato non valido");
        }
        replaceData({ version: SCHEMA_VERSION, launches: parsed.launches });
        setActive(OVERVIEW);
      } catch {
        alert("File non valido: deve essere un JSON esportato da questa dashboard.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleReset = () => {
    if (confirm("Ripristinare i dati originali? Tutte le modifiche locali andranno perse.")) {
      resetToSeed();
      setActive(OVERVIEW);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Lanci</h1>
          <p className="text-sm text-slate-500">Carlotta Lolli · corsi di cucina</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportJson}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            ↓ Esporta
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            ↑ Importa
          </button>
          <button
            onClick={handleReset}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
          >
            ⟲ Ripristina
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={importJson}
            className="hidden"
          />
        </div>
      </header>

      {/* Tabs */}
      <nav className="no-scrollbar mb-6 flex gap-1 overflow-x-auto border-b border-slate-200">
        <TabButton active={active === OVERVIEW} onClick={() => setActive(OVERVIEW)} color="#d04763">
          ★ Confronto
        </TabButton>
        {launches.map((l) => (
          <TabButton
            key={l.id}
            active={active === l.id}
            onClick={() => setActive(l.id)}
            color={l.color}
          >
            {l.name}
          </TabButton>
        ))}
      </nav>

      {/* Content */}
      {!hydrated ? (
        <div className="py-20 text-center text-sm text-slate-400">Caricamento…</div>
      ) : active === OVERVIEW ? (
        <OverviewView data={data} />
      ) : activeLaunch ? (
        <LaunchDetail launch={activeLaunch} />
      ) : null}

      <footer className="mt-12 border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
        I dati sono salvati nel tuo browser. Usa “Esporta” per conservarne una copia.
      </footer>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative whitespace-nowrap px-4 py-2.5 text-sm font-medium transition ${
        active ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {children}
      {active && (
        <span
          className="absolute inset-x-2 -bottom-px h-0.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
    </button>
  );
}
