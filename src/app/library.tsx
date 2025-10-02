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
      <section className="p-6 border rounded-2xl grid gap-4 md:grid-cols-[2fr,1fr]">
        <input
          placeholder="Search notes, tags, practices…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 w-full rounded-xl border px-4 text-base leading-[1.2]
                     placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-500"
          aria-label="Search"
        />
        <select
          value={phase}
          onChange={(e) => setPhase(e.target.value)}
          className="h-12 w-full rounded-xl border px-4 text-base leading-[1.2] bg-transparent
                     focus:outline-none focus:ring-2 focus:ring-neutral-500"
          aria-label="Filter by lunar phase"
        >
          <option value="any">Any lunar phase</option>
          {Object.entries(PHASE_LABEL).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider opacity-70">Tags</p>
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="inline-flex items-center rounded-full border px-3 py-1.5
                           text-sm leading-none hover:bg-neutral-900/10"
                aria-label="Clear selected tags"
              >
                Clear tags
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Tag filters">
            {allTags.map((t) => {
              const active = selectedTags.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleTag(t)}
                  className={`inline-flex h-10 items-center rounded-full border px-4
                              text-sm font-medium leading-none
                              ${
                                active
                                  ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                                  : "bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700"
                              }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-2 flex gap-2 justify-end pt-1">
          <button
            onClick={() =>
              download(
                JSON.stringify(filtered, null, 2),
                "astraea-filtered.json",
                "application/json"
              )
            }
            className="inline-flex h-10 items-center rounded-full border px-4 text-sm hover:bg-neutral-800"
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
            className="inline-flex h-10 items-center rounded-full border px-4 text-sm hover:bg-neutral-800"
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
          <article key={e.id} className="p-4 border rounded-lg hover:shadow transition">
            <header className="flex items-baseline justify-between gap-3">
              <p className="font-semibold">
                <Link className="underline-offset-2 hover:underline" href={`/entry/${e.id}`}>
                  {e.date} — {e.cycle_day !== null ? `CD ${e.cycle_day}` : "CD —"}
                </Link>
              </p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border uppercase tracking-wide
                            ${PHASE_COLORS[e.lunar_phase] ?? "border-neutral-600 text-neutral-400"}`}
              >
                {PHASE_LABEL[e.lunar_phase] ?? e.lunar_phase}
              </span>
            </header>

            <div className="mt-3 text-sm space-y-1.5">
              <div>
                <span className="font-medium">Tags:</span> {e.tags.join(", ") || "—"}
              </div>
              <div>
                <span className="font-medium">Practices:</span>{" "}
                {e.practices.join(", ") || "—"}
              </div>
              <div>
                <span className="font-medium">Threads:</span>{" "}
                {e.threads?.join(", ") || "—"}
              </div>
              <div>
                <span className="font-medium">Symptoms:</span>{" "}
                {e.symptoms.join(", ") || "—"}
              </div>
            </div>

            <footer className="mt-3">
              <span
                className={`text-xs px-2 py-0.5 rounded-full border
                            ${
                              e.privacy === "public"
                                ? "bg-emerald-600/20 border-emerald-600 text-emerald-300"
                                : e.privacy === "anon"
                                ? "bg-amber-600/20 border-amber-600 text-amber-300"
                                : "bg-neutral-700/40 border-neutral-600 text-neutral-400"
                            }`}
              >
                {e.privacy}
              </span>
            </footer>
          </article>
        ))}
      </section>
    </div>
  );
}
