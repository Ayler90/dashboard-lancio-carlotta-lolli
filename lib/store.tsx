"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { DashboardData, Launch } from "./types";
import { seedData, SCHEMA_VERSION } from "@/data/seed";

const STORAGE_KEY = "dashboard-lanci-carlotta-lolli";

interface StoreContextValue {
  data: DashboardData;
  /** Aggiorna un singolo lancio sostituendolo per id */
  updateLaunch: (launch: Launch) => void;
  /** Sostituisce l'intero dataset (import) */
  replaceData: (data: DashboardData) => void;
  /** Ripristina i dati originali (seed) */
  resetToSeed: () => void;
  /** true quando lo stato è stato idratato dal localStorage */
  hydrated: boolean;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function loadInitial(): DashboardData {
  if (typeof window === "undefined") return seedData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedData;
    const parsed = JSON.parse(raw) as DashboardData;
    // Se cambia la versione dello schema, ripartiamo dal seed.
    if (!parsed || parsed.version !== SCHEMA_VERSION || !Array.isArray(parsed.launches)) {
      return seedData;
    }
    return parsed;
  } catch {
    return seedData;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DashboardData>(seedData);
  const [hydrated, setHydrated] = useState(false);

  // Idratazione lato client per evitare mismatch SSR.
  useEffect(() => {
    setData(loadInitial());
    setHydrated(true);
  }, []);

  // Persistenza su ogni modifica (dopo l'idratazione).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* quota piena o storage non disponibile: ignoriamo */
    }
  }, [data, hydrated]);

  const updateLaunch = useCallback((launch: Launch) => {
    setData((prev) => ({
      ...prev,
      launches: prev.launches.map((l) => (l.id === launch.id ? launch : l)),
    }));
  }, []);

  const replaceData = useCallback((next: DashboardData) => {
    setData(next);
  }, []);

  const resetToSeed = useCallback(() => {
    setData(seedData);
  }, []);

  return (
    <StoreContext.Provider value={{ data, updateLaunch, replaceData, resetToSeed, hydrated }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore deve essere usato dentro StoreProvider");
  return ctx;
}
