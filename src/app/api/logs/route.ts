import { NextRequest, NextResponse } from "next/server";
import { head, put } from "@vercel/blob";
import seed from "../../data/logs.json"; // fallback seed (bundled)
import type { Entry } from "../../types";

// single blob name for your dataset
const BLOB_NAME = "astraea-logs.json";

// Read logs from Blob, or fall back to the seed file (first run)
async function readLogs(): Promise<Entry[]> {
  try {
    const h = await head(BLOB_NAME);
    if (!h?.url) throw new Error("no blob");
    const res = await fetch(h.url, { cache: "no-store" });
    if (!res.ok) throw new Error("fetch fail");
    const json = (await res.json()) as Entry[];
    return Array.isArray(json) ? json : [];
  } catch {
    return (seed as unknown as Entry[]) ?? [];
  }
}

export async function GET() {
  const logs = await readLogs();
  return NextResponse.json(logs, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  // simple auth: require a matching header
  const key = req.headers.get("x-compose-key") ?? "";
  if (!process.env.COMPOSE_WRITE_KEY || key !== process.env.COMPOSE_WRITE_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entry = (await req.json()) as Entry;
  if (!entry?.id) {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  // read current logs, upsert by id
  const current = await readLogs();
  const byId = new Map<string, Entry>();
  current.forEach((e) => byId.set(e.id, e));
  byId.set(entry.id, entry);
  const next = Array.from(byId.values()).sort((a, b) => (a.date < b.date ? 1 : -1));

  // write back to blob (private)
  await put(BLOB_NAME, JSON.stringify(next, null, 2), {
    access: "public",                  // <-- required
    contentType: "application/json",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return NextResponse.json({ ok: true, count: next.length });
}