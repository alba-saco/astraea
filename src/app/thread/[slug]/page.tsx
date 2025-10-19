"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import type { Entry } from "../../types";

// Phase labels + emoji (kept local to avoid cross-imports)
const PHASE_LABEL: Record<string, string> = {
  new: "New",
  waxing_crescent: "Waxing Crescent",
  first_quarter: "First Quarter",
  waxing_gibbous: "Waxing Gibbous",
  full: "Full",
  waning_gibbous: "Waning Gibbous",
  last_quarter: "Last Quarter",
  waning_crescent: "Waning Crescent",
};
function phaseEmoji(phase: string) {
  switch (phase) {
    case "new": return "🌑";
    case "waxing_crescent": return "🌒";
    case "first_quarter": return "🌓";
    case "waxing_gibbous": return "🌔";
    case "full": return "🌕";
    case "waning_gibbous": return "🌖";
    case "last_quarter": return "🌗";
    case "waning_crescent": return "🌘";
    default: return "◐";
  }
}

export default function ThreadPage() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params.slug || "");

  const [entries, setEntries] = useState<Entry[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/logs", { cache: "no-store" });
        const data = (await res.json()) as Entry[];
        if (!cancelled) setEntries(data);
      } catch {
        if (!cancelled) setEntries([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (!entries) return null;
    return entries
      .filter(e => e.privacy !== "private")
      .filter(e => Array.isArray(e.threads) && e.threads.includes(slug))
      .sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first
  }, [entries, slug]);

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <header className="flex items-center justify-between mb-6 gap-4">
        <h1 className="brand-title">Thread: {slug.replace(/_/g, " ")}</h1>
        <Link href="/" className="text-sm underline underline-offset-2">← Library</Link>
      </header>

      {!filtered && (
        <p className="text-sm text-[var(--text-secondary)]">Loading…</p>
      )}

      {filtered && filtered.length === 0 && (
        <p className="text-sm text-[var(--text-secondary)]">
          No public entries in this thread yet.
        </p>
      )}

      {filtered && filtered.length > 0 && (
        <section className="divide-y divide-[var(--line)]">
          {filtered.map((e) => (
            <Link
              key={e.id}
              href={`/entry/${e.id}`}
              className="group block py-6 md:py-8"
            >
              <header className="grid grid-cols-[1fr_auto] items-baseline gap-4">
                <h2
                  className="font-semibold tracking-[-0.01em] text-[1.05rem] md:text-[1.15rem]
                             text-[#4e3b37] underline-offset-4 decoration-[var(--accent)]/40
                             group-hover:underline"
                >
                  {e.date} — {e.cycle_day !== null ? `CD ${e.cycle_day}` : "CD —"}
                </h2>
                <span
                  className="text-[22px] leading-none select-none text-[color-mix(in oklab,var(--ink) 70%,transparent)]"
                  title={PHASE_LABEL[e.lunar_phase] ?? e.lunar_phase}
                  aria-label={PHASE_LABEL[e.lunar_phase] ?? e.lunar_phase}
                >
                  {phaseEmoji(e.lunar_phase)}
                </span>
              </header>

              <div className="mt-2 md:mt-3 text-[0.96rem] leading-6 text-[var(--text-secondary)]">
                <p><span className="inline-block w-24 uppercase tracking-wide text-[11px] text-[var(--text-tertiary)]">Tags</span>{e.tags.join(", ") || "—"}</p>
                <p><span className="inline-block w-24 uppercase tracking-wide text-[11px] text-[var(--text-tertiary)]">Practices</span>{e.practices.join(", ") || "—"}</p>
                <p><span className="inline-block w-24 uppercase tracking-wide text-[11px] text-[var(--text-tertiary)]">Threads</span>{e.threads?.join(", ") || "—"}</p>
                <p><span className="inline-block w-24 uppercase tracking-wide text-[11px] text-[var(--text-tertiary)]">Symptoms</span>{e.symptoms.join(", ") || "—"}</p>
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}