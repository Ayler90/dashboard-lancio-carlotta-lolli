"use client";

import React, { useEffect, useState } from "react";
import { Launch, LaunchKPIs, Section } from "@/lib/types";
import { useStore } from "@/lib/store";
import EditableTable from "./EditableTable";
import KpiEditor from "./KpiEditor";
import LaunchCharts from "./LaunchCharts";

export default function LaunchDetail({
  launch,
  onDeleted,
}: {
  launch: Launch;
  onDeleted: () => void;
}) {
  const { updateLaunch, deleteLaunch } = useStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Launch>(launch);

  // Se il lancio selezionato cambia (cambio tab) usciamo dall'editing
  // e riallineiamo il draft.
  useEffect(() => {
    setDraft(launch);
    setEditing(false);
  }, [launch]);

  const current = editing ? draft : launch;

  const handleSectionChange = (section: Section) => {
    setDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === section.id ? section : s)),
    }));
  };

  const handleKpisChange = (kpis: LaunchKPIs) => {
    setDraft((prev) => ({ ...prev, kpis }));
  };

  const handleMetaChange = (patch: Partial<Launch>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const save = () => {
    updateLaunch(draft);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(launch);
    setEditing(false);
  };

  const remove = () => {
    if (
      confirm(
        `Eliminare il lancio "${launch.name}"? L'operazione non può essere annullata.`
      )
    ) {
      deleteLaunch(launch.id);
      onDeleted();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="h-10 w-1.5 rounded-full"
            style={{ backgroundColor: current.color }}
          />
          <div>
            {editing ? (
              <div className="flex flex-wrap gap-2">
                <input
                  value={draft.name}
                  onChange={(e) => handleMetaChange({ name: e.target.value })}
                  className="rounded-md border border-slate-200 px-2 py-1 text-lg font-semibold focus:border-brand-400 focus:outline-none"
                />
                <input
                  value={draft.periodo}
                  onChange={(e) => handleMetaChange({ periodo: e.target.value })}
                  className="rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-500 focus:border-brand-400 focus:outline-none"
                />
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-slate-900">{current.name}</h2>
                <p className="text-sm text-slate-500">{current.periodo}</p>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={remove}
                className="mr-auto rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                🗑 Elimina lancio
              </button>
              <button
                onClick={cancel}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Annulla
              </button>
              <button
                onClick={save}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
              >
                Salva modifiche
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-100"
            >
              ✎ Modifica
            </button>
          )}
        </div>
      </div>

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          KPI principali
        </h3>
        <KpiEditor launch={current} editing={editing} onChange={handleKpisChange} />
      </section>

      {!editing && <LaunchCharts launch={current} />}

      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Dettaglio dati
        </h3>
        <div className="grid gap-4 xl:grid-cols-2">
          {current.sections.map((section) => (
            <EditableTable
              key={section.id}
              section={section}
              editing={editing}
              onChange={handleSectionChange}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
