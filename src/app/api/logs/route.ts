import { NextRequest, NextResponse } from "next/server";
import { head, put } from "@vercel/blob";
import seed from "../../data/logs.json";
import type { Entry, Phase, Privacy } from "../../types";

const BLOB_NAME = "astraea-logs.json";

// ---- utils --------------------------------------------------------------

async function readLogs(): Promise<Entry[]> {
  try {
    const h = await head(BLOB_NAME);
    if (!h?.url) throw new Error("no blob");
    const res = await fetch(h.url, { cache: "no-store" });
    if (!res.ok) throw new Error("fetch fail");
    const json = (await res.json()) as unknown;
    return Array.isArray(json) ? (json as Entry[]) : [];
  } catch {
    return (seed as unknown as Entry[]) ?? [];
  }
}

const PHASES = new Set<Phase>([
  "new",
  "waxing_crescent",
  "first_quarter",
  "waxing_gibbous",
  "full",
  "waning_gibbous",
  "last_quarter",
  "waning_crescent",
]);
const PRIVS = new Set<Privacy>(["public", "anon", "private"]);

function asStrArray(v: unknown): string[] {
  return Array.isArray(v) ? v.map((x) => String(x)) : [];
}

type NormalizeResult =
  | { ok: true; entry: Entry }
  | { ok: false; error: string };

function normalize(raw: unknown): NormalizeResult {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "Body is not an object" };
  }
  const r = raw as Record<string, unknown>;

  const id = String(r.id ?? "");
  const date = String(r.date ?? "");
  const lunar = String(r.lunar_phase ?? "full");
  const privacy = String(r.privacy ?? "public") as Privacy;

  if (!id) return { ok: false, error: "Missing id" };
  if (!date) return { ok: false, error: "Missing date" };
  if (!PHASES.has(lunar as Phase)) {
    return { ok: false, error: `Invalid lunar_phase: ${lunar}` };
  }
  if (!PRIVS.has(privacy)) {
    return { ok: false, error: `Invalid privacy: ${privacy}` };
  }

  const entry: Entry = {
    id,
    date,
    cycle_day:
      r.cycle_day === "" || r.cycle_day == null ? null : Number(r.cycle_day),
    lunar_phase: lunar as Phase,
    tags: asStrArray(r.tags),
    symptoms: asStrArray(r.symptoms),
    practices: asStrArray(r.practices),
    threads: asStrArray(r.threads),
    herbs: asStrArray(r.herbs),
    mood: r.mood ? String(r.mood) : null,
    digestion_notes: r.digestion_notes ? String(r.digestion_notes) : null,
    digestion_tags: asStrArray(r.digestion_tags),
    privacy,
    notes: String(r.notes ?? ""),
    schema_version: Number(r.schema_version ?? 1),
  };

  return { ok: true, entry };
}

// ---- routes -------------------------------------------------------------

export async function GET() {
  const logs = await readLogs();
  return NextResponse.json(logs, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  // Accept either server or public key (client can only access the public one)
  const key = req.headers.get("x-compose-key") ?? "";
  const expected =
    process.env.COMPOSE_WRITE_KEY ??
    process.env.NEXT_PUBLIC_COMPOSE_KEY ??
    "";
  if (!expected || key !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = (await req.json()) as unknown;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const norm = normalize(body);
  if (!norm.ok) {
    return NextResponse.json(
      { error: `Bad payload: ${norm.error}` },
      { status: 400 }
    );
  }
  const entry = norm.entry;

  const current = await readLogs();
  const byId = new Map<string, Entry>(current.map((e) => [e.id, e]));
  byId.set(entry.id, entry);
  const next = Array.from(byId.values()).sort((a, b) =>
    a.date < b.date ? 1 : -1
  );

  await put(BLOB_NAME, JSON.stringify(next, null, 2), {
    access: "public",
    contentType: "application/json",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return NextResponse.json({ ok: true, count: next.length });
}