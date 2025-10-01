"use client"
import raw from "./data/logs.json";
import Library from "./library";
import Link from "next/link";
import { useEffect, useState } from "react";

type Phase = "new"|"waxing_crescent"|"first_quarter"|"waxing_gibbous"|"full"|"waning_gibbous"|"last_quarter"|"waning_crescent";
type Privacy = "public"|"anon"|"private";
const CANON_PHASE: Record<string, Phase> = { new:"new", waxing_crescent:"waxing_crescent", first_quarter:"first_quarter", waxing_gibbous:"waxing_gibbous", full:"full", full_moon:"full", waning_gibbous:"waning_gibbous", last_quarter:"last_quarter", waning_crescent:"waning_crescent" };
const CANON_PRIVACY: Record<string, Privacy> = { public:"public", anon:"anon", private:"private" };

function normalize(arr: any[]) {
  return arr.map((e) => ({
    ...e,
    lunar_phase: (CANON_PHASE[e.lunar_phase] ?? "full") as Phase,
    privacy: (CANON_PRIVACY[e.privacy] ?? "public") as Privacy,
  }));
}

export default function Home() {
  const [entries, setEntries] = useState<any[]>(normalize(raw as any[]));

  useEffect(() => {
    const drafts = JSON.parse(localStorage.getItem("astraea_drafts") || "[]");
    if (Array.isArray(drafts) && drafts.length) {
      // drafts first (newest), then file entries (dedupe by id)
      const byId = new Map<string, any>();
      normalize(drafts).forEach((e)=>byId.set(e.id, e));
      entries.forEach((e)=>byId.set(e.id, e));
      setEntries(Array.from(byId.values()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <header className="flex items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Astraea Log</h1>
        <div className="flex gap-4">
          <Link href="/cycle" className="text-sm underline underline-offset-2">Cycle view →</Link>
          <Link href="/compose" className="text-sm underline underline-offset-2">Compose →</Link>
        </div>
      </header>
      <Library initialEntries={entries as any} />
    </main>
  );
}