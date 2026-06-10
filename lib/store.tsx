"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { DashboardData, Launch } from "./types";
import { seedData, SCHEMA_VERSION } from "@/data/seed";

const STORAGE_KEY = "dashboard-lanci-carlotta-lolli";

export type SyncMode = "loading" | "remote" | "local";
export type SaveState = "idle" | "saving" | "saved" | "error";

interface StoreContextValue {
  data: DashboardData;
  updateLaunch: (launch: Launch) => void;
  /** Crea un nuovo lancio vuoto e ne restituisce l'id */
  addLaunch: () => string;
  /** Elimina un lancio per id */
  deleteLaunch: (id: string) => void;
  replaceData: (data: DashboardData) => void;
  resetToSeed: () => void;
  hydrated: boolean;
  /** "remote" = sincronizzato su Vercel Blob, "local" = solo questo browser */
  mode: SyncMode;
  /** Stato dell'ultimo salvataggio sul cloud */
  saveState: SaveState;
}

const StoreContext = createContext<StoreContextValue | null>(null);

// Palette lanci armonizzata col brand (teal, oro, terracotta, salvia, prugna…)
const LAUNCH_COLORS = [
  "#0a2838", "#e0a92e", "#c2683b", "#3e7c6a", "#7a5c99",
  "#f5c141", "#557e8f", "#9a6a4b", "#5b8a72", "#b5854c",
];

// Migrazione: i vecchi colori dei lanci esistenti vengono mappati su quelli di brand.
const COLOR_MIGRATION: Record<string, string> = {
  "#2563eb": "#0a2838", // Pesce
  "#0891b2": "#c2683b", // Meal Prep (Rilancio)
  "#d97706": "#e0a92e", // Spezie
  "#16a34a": "#3e7c6a", // Meal Prep 2026
  "#9333ea": "#7a5c99", // Legumi
};

/** Restituisce i dati con i colori migrati e un flag se qualcosa è cambiato. */
function migrateColors(data: DashboardData): { data: DashboardData; changed: boolean } {
  let changed = false;
  const launches = data.launches.map((l) => {
    const mapped = COLOR_MIGRATION[l.color?.toLowerCase()];
    if (mapped && mapped !== l.color) {
      changed = true;
      return { ...l, color: mapped };
    }
    return l;
  });
  return { data: changed ? { ...data, launches } : data, changed };
}

/** Crea un nuovo lancio vuoto, con una sezione iniziale di esempio. */
function makeNewLaunch(existing: Launch[]): Launch {
  const now = new Date();
  const mesi = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
  ];
  const color = LAUNCH_COLORS[existing.length % LAUNCH_COLORS.length];
  return {
    id: `lancio-${Date.now()}`,
    name: "Nuovo lancio",
    periodo: `${mesi[now.getMonth()]} ${now.getFullYear()}`,
    date: now.toISOString().slice(0, 10),
    color,
    kpis: {},
    sections: [
      {
        id: `sez-${Date.now()}`,
        title: "Dati principali",
        columns: ["Voce", "Numero"],
        rows: [
          { label: "Lead", values: [null] },
          { label: "Acquisti", values: [null] },
          { label: "Fatturato €", values: [null] },
        ],
      },
    ],
  };
}

/** Carica i dati dal localStorage (cache), altrimenti i dati seed. */
function loadLocal(): DashboardData {
  if (typeof window === "undefined") return seedData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedData;
    const parsed = JSON.parse(raw) as DashboardData;
    if (!parsed || parsed.version !== SCHEMA_VERSION || !Array.isArray(parsed.launches)) {
      return seedData;
    }
    return parsed;
  } catch {
    return seedData;
  }
}

function saveLocal(data: DashboardData) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* storage non disponibile: ignoriamo */
  }
}

async function fetchRemote(): Promise<{ configured: boolean; data: DashboardData | null }> {
  const res = await fetch("/api/data", { cache: "no-store" });
  if (!res.ok) return { configured: false, data: null };
  return res.json();
}

async function pushRemote(data: DashboardData): Promise<boolean> {
  const res = await fetch("/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.ok;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DashboardData>(seedData);
  const [hydrated, setHydrated] = useState(false);
  const [mode, setMode] = useState<SyncMode>("loading");
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Evita di salvare in remoto durante l'idratazione iniziale.
  const skipNextSave = useRef(true);
  // Riferimento sempre aggiornato ai dati correnti.
  const dataRef = useRef(data);
  dataRef.current = data;

  // Idratazione: prima il cloud, poi fallback su localStorage/seed.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = loadLocal();
      try {
        const remote = await fetchRemote();
        if (cancelled) return;
        if (remote.configured) {
          if (remote.data && Array.isArray(remote.data.launches)) {
            // Il cloud è la fonte di verità (con eventuale migrazione colori).
            const migrated = migrateColors(remote.data);
            setData(migrated.data);
            saveLocal(migrated.data);
            if (migrated.changed) void pushRemote(migrated.data);
          } else {
            // Cloud collegato ma vuoto: lo inizializziamo coi dati locali/seed.
            const init = migrateColors(local).data;
            setData(init);
            skipNextSave.current = false; // forza il primo push
            void pushRemote(init);
          }
          setMode("remote");
        } else {
          setData(migrateColors(local).data);
          setMode("local");
        }
      } catch {
        if (cancelled) return;
        setData(migrateColors(local).data);
        setMode("local");
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persistenza ad ogni modifica: localStorage subito, cloud con debounce.
  useEffect(() => {
    if (!hydrated) return;
    saveLocal(data);

    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    if (mode !== "remote") return;

    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const ok = await pushRemote(data);
      setSaveState(ok ? "saved" : "error");
      if (ok) setTimeout(() => setSaveState("idle"), 2000);
    }, 800);
  }, [data, hydrated, mode]);

  const updateLaunch = useCallback((launch: Launch) => {
    setData((prev) => ({
      ...prev,
      launches: prev.launches.map((l) => (l.id === launch.id ? launch : l)),
    }));
  }, []);

  const addLaunch = useCallback(() => {
    const launch = makeNewLaunch(dataRef.current.launches);
    setData((prev) => ({ ...prev, launches: [...prev.launches, launch] }));
    return launch.id;
  }, []);

  const deleteLaunch = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      launches: prev.launches.filter((l) => l.id !== id),
    }));
  }, []);

  const replaceData = useCallback((next: DashboardData) => {
    setData(next);
  }, []);

  const resetToSeed = useCallback(() => {
    setData(seedData);
  }, []);

  return (
    <StoreContext.Provider
      value={{ data, updateLaunch, addLaunch, deleteLaunch, replaceData, resetToSeed, hydrated, mode, saveState }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore deve essere usato dentro StoreProvider");
  return ctx;
}
