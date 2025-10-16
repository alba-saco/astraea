"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Entry } from "./types";

function toCSV(rows: Array<Record<string, unknown>>): string {
    if (!rows.length) return "";
    const cols = Object.keys(rows[0] as Record<string, unknown>);
    const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    return [
      cols.join(","),
      ...rows.map((r) =>
        cols
          .map((c) => {
            const val = (r as Record<string, unknown>)[c];
            return escape(val);
          })
          .join(",")
      ),
    ].join("\n");
  }

function download(text: string, filename: string, type = "text/plain") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

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

const PHASE_COLORS: Record<string, string> = {
  new: "bg-neutral-700/40 border-neutral-500 text-neutral-300",
  waxing_crescent: "bg-indigo-600/20 border-indigo-600 text-indigo-300",
  first_quarter: "bg-blue-600/20 border-blue-600 text-blue-300",
  waxing_gibbous: "bg-purple-600/20 border-purple-600 text-purple-300",
  full: "bg-amber-600/20 border-amber-600 text-amber-300",
  waning_gibbous: "bg-purple-600/20 border-purple-600 text-purple-300",
  last_quarter: "bg-blue-600/20 border-blue-600 text-blue-300",
  waning_crescent: "bg-indigo-600/20 border-indigo-600 text-indigo-300",
};

const phaseEmoji = (p: string) =>
  ({
    new: "🌑",
    waxing_crescent: "🌒",
    first_quarter: "🌓",
    waxing_gibbous: "🌔",
    full: "🌕",
    waning_gibbous: "🌖",
    last_quarter: "🌗",
    waning_crescent: "🌘",
  }[p] ?? "🌙");

export default function Library({ initialEntries }: { initialEntries: Entry[] }) {
  const visible = useMemo(
    () => initialEntries.filter((e) => e.privacy !== "private"),
    [initialEntries]
  );

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState<string>("");
  const [phase, setPhase] = useState<string>("any");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    const ph = searchParams.get("phase") ?? "any";
    const tagsRaw = searchParams.get("tags") ?? "";
    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setQuery(q);
    setPhase(ph);
    setSelectedTags(tags);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (phase !== "any") params.set("phase", phase);
    if (selectedTags.length) params.set("tags", selectedTags.join(","));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [query, phase, selectedTags, pathname, router]);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    visible.forEach((e) => e.tags.forEach((t) => s.add(t)));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [visible]);

  const toggleTag = (t: string) =>
    setSelectedTags((curr) =>
      curr.includes(t) ? curr.filter((x) => x !== t) : [...curr, t]
    );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visible
      .filter((e) => (phase === "any" ? true : e.lunar_phase === phase))
      .filter((e) =>
        selectedTags.length ? selectedTags.every((t) => e.tags.includes(t)) : true
      )
      .filter((e) => {
        if (!q) return true;
        const hay = [
          e.date,
          e.tags.join(" "),
          e.symptoms.join(" "),
          e.practices.join(" "),
          e.mood ?? "",
          e.notes,
          e.threads?.join(" ") ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [visible, phase, selectedTags, query]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <section
        className="p-6 border border-[var(--line)] rounded-2xl bg-[var(--surface)]/70
                  grid gap-4 md:grid-cols-[minmax(0,1fr),220px] items-start"
      >
        {/* Search (now with label to match the select) */}
        <label className="grid gap-1">
          <span className="text-[11px] tracking-wide uppercase text-[var(--text-secondary)]">
            Search
          </span>
          <input
            placeholder="Search notes, tags, practices…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-2)]
                      px-4 text-[15px] leading-[1.15]
                      placeholder-[var(--text-secondary)]
                      focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            aria-label="Search"
          />
        </label>

        {/* Phase (same label + matched height) */}
        <label className="grid gap-1">
          <span className="text-[11px] tracking-wide uppercase text-[var(--text-secondary)]">
            Lunar phase
          </span>
          <select
            value={phase}
            onChange={(e) => setPhase(e.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-2)]
                      px-3 text-[14px] leading-[1.15]
                      focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            aria-label="Filter by lunar phase"
          >
            <option value="any">Any lunar phase</option>
            {Object.entries(PHASE_LABEL).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </label>

        {/* Tags */}
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">Tags</p>
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="inline-flex items-center rounded-full border border-white/10 px-3 py-1.5
                          text-sm leading-none hover:bg-white/5"
                aria-label="Clear selected tags"
              >
                Clear tags
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-x-2 gap-y-2">
            {allTags.map((t, i) => {
              const active = selectedTags.includes(t);
              return (
                <div key={t} className="flex items-center gap-2">
                  {i > 0 && <span className="text-[11px] opacity-30">•</span>}
                  <button
                    onClick={() => toggleTag(t)}
                    className={`text-sm leading-none tracking-tight transition-colors
                      ${active
                        ? "font-medium text-[var(--ink)] underline underline-offset-4 decoration-[var(--ink)]/40"
                        : "text-[color-mix(in oklab,var(--ink) 65%,transparent)] hover:text-[var(--ink)] hover:underline underline-offset-4"}`}
                  >
                    {t}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="md:col-span-2 flex gap-2 justify-end pt-1">
          <button
            onClick={() =>
              download(
                JSON.stringify(filtered, null, 2),
                "astraea-filtered.json",
                "application/json"
              )
            }
            className="inline-flex h-10 items-center rounded-full border border-white/10 px-4 text-sm
                      text-[var(--text-primary)] hover:bg-white/5"
          >
            Download JSON
          </button>
          <button
            onClick={() =>
              download(
                toCSV(filtered as unknown as Array<Record<string, unknown>>),
                "astraea-filtered.csv",
                "text/csv"
              )
            }
            className="inline-flex h-10 items-center rounded-full border border-white/10 px-4 text-sm
                      text-[var(--text-primary)] hover:bg-white/5"
          >
            Download CSV
          </button>
        </div>
      </section>

      {/* Results */}
      <section className="space-y-3">
        {filtered.length === 0 && (
          <p className="opacity-70 text-sm">No entries match your filters.</p>
        )}

        {filtered.map((e) => (
          <Link
            key={e.id}
            href={`/entry/${e.id}`}
            className="block relative p-5 rounded-xl border border-[var(--line)] bg-[var(--surface)]/70
                      transition hover:bg-[var(--surface-2)] focus-visible:outline-none
                      focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            <article className="pointer-events-none">
              <header className="flex items-baseline justify-between gap-3 relative">
                <p className="font-semibold">
                  {e.date} — {e.cycle_day !== null ? `CD ${e.cycle_day}` : "CD —"}
                </p>
                <span
                  className="absolute top-4 right-4 text-[22px] leading-none select-none text-[color-mix(in oklab,var(--ink) 70%,transparent)]"
                  title={PHASE_LABEL[e.lunar_phase] ?? e.lunar_phase}
                >
                  {phaseEmoji(e.lunar_phase)}
                </span>
              </header>

              <div className="mt-3 text-sm space-y-1.5 text-[var(--text-secondary)]">
                <div>
                  <span className="font-medium">Tags:</span> {e.tags.join(", ") || "—"}
                </div>
                <div>
                  <span className="font-medium">Practices:</span> {e.practices.join(", ") || "—"}
                </div>
                <div>
                  <span className="font-medium">Threads:</span> {e.threads?.join(", ") || "—"}
                </div>
                <div>
                  <span className="font-medium">Symptoms:</span> {e.symptoms.join(", ") || "—"}
                </div>
              </div>
            </article>
          </Link>
        ))}
      </section>
    </div>
  );
}
