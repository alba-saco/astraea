"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react"; // <-- add Suspense
import Library from "./library";
import type { Entry, Phase, Privacy } from "./types";

const CANON_PHASE: Record<string, Phase> = {
  new: "new",
  waxing_crescent: "waxing_crescent",
  first_quarter: "first_quarter",
  waxing_gibbous: "waxing_gibbous",
  full: "full",
  full_moon: "full",
  waning_gibbous: "waning_gibbous",
  last_quarter: "last_quarter",
  waning_crescent: "waning_crescent",
};

const CANON_PRIVACY: Record<string, Privacy> = {
  public: "public",
  anon: "anon",
  private: "private",
};

function normalize(arr: Entry[]): Entry[] {
  return arr.map((e) => ({
    ...e,
    lunar_phase: (CANON_PHASE[e.lunar_phase] ?? "full") as Phase,
    privacy: (CANON_PRIVACY[e.privacy] ?? "public") as Privacy,
    threads: Array.isArray(e.threads) ? e.threads : [],
    digestion_notes: e.digestion_notes ?? null,
    digestion_tags: Array.isArray(e.digestion_tags) ? e.digestion_tags : [],
  }));
}

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/logs", { cache: "no-store" });
        const apiLogs = (await res.json()) as Entry[];
        if (cancelled) return;

        const base = normalize(apiLogs ?? []);
        // merge drafts
        const draftsRaw = localStorage.getItem("astraea_drafts");
        const drafts = draftsRaw ? (JSON.parse(draftsRaw) as Entry[]) : [];
        const byId = new Map<string, Entry>();
        base.forEach((e) => byId.set(e.id, e));
        normalize(drafts).forEach((e) => byId.set(e.id, e));

        setEntries(Array.from(byId.values()));
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <header className="flex items-center justify-between mb-6 gap-4">
      <h1 className="font-bold flex items-center gap-2">
        Rhythmos <span className="badge-prototype">prototype</span>
      </h1>
        <div className="flex gap-4">
          {/* <Link href="/cycle" className="text-sm underline underline-offset-2">
            Cycle view →
          </Link> */}
          {/* {process.env.NEXT_PUBLIC_COMPOSE_KEY && (
            <Link href="/compose" className="text-sm underline underline-offset-2">
              Compose →
            </Link>
          )} */}
          <Link href="/about" className="text-sm underline underline-offset-2">
            About →
          </Link>
        </div>
      </header>

      {/* Wrap Library in Suspense */}
      <Suspense fallback={<p className="opacity-70">Loading library…</p>}>
        <Library initialEntries={entries} />
      </Suspense>
    </main>
  );
}