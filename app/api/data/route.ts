import { NextResponse } from "next/server";
import { put, list } from "@vercel/blob";
import { DashboardData } from "@/lib/types";
import { SCHEMA_VERSION } from "@/data/seed";

// Nome fisso del file su Vercel Blob: un unico documento condiviso.
const BLOB_PATH = "dashboard-data.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * GET /api/data
 * - { configured: false }            → Blob non collegato (sviluppo locale)
 * - { configured: true, data: null } → Blob collegato ma ancora vuoto
 * - { configured: true, data: {...} }→ dati presenti sul cloud
 */
export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json({ configured: false, data: null });
  }
  try {
    const { blobs } = await list({ prefix: BLOB_PATH, limit: 1 });
    const blob = blobs.find((b) => b.pathname === BLOB_PATH);
    if (!blob) {
      return NextResponse.json({ configured: true, data: null });
    }
    const res = await fetch(blob.url, { cache: "no-store" });
    const data = (await res.json()) as DashboardData;
    return NextResponse.json({ configured: true, data });
  } catch (err) {
    console.error("GET /api/data error", err);
    return NextResponse.json(
      { configured: true, data: null, error: "read_failed" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/data — salva l'intero dataset sul cloud (last-write-wins).
 */
export async function POST(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json({ configured: false }, { status: 503 });
  }
  try {
    const body = (await request.json()) as DashboardData;
    if (!body || !Array.isArray(body.launches)) {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }
    const payload: DashboardData = {
      version: SCHEMA_VERSION,
      launches: body.launches,
    };
    const blob = await put(BLOB_PATH, JSON.stringify(payload), {
      access: "public",
      contentType: "application/json",
      allowOverwrite: true,
      addRandomSuffix: false,
      cacheControlMaxAge: 0,
    });
    return NextResponse.json({ configured: true, ok: true, url: blob.url });
  } catch (err) {
    console.error("POST /api/data error", err);
    return NextResponse.json({ error: "write_failed" }, { status: 500 });
  }
}
