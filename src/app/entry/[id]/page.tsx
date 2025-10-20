import Link from "next/link";
import { headers } from "next/headers";
import type { Entry } from "../../types";
import cycles from "@/data/cycles";
import type { CyclePlan } from "../../types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RouteParams = { id: string };

async function fetchAllLogs(): Promise<Entry[]> {
  const h = await headers(); // ← await here
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https"; // default https on Vercel
  const base = `${proto}://${host}`;
  const res = await fetch(`${base}/api/logs`, { cache: "no-store" });
  if (!res.ok) return [];
  return (await res.json()) as Entry[];
}

const PHASE_LABEL: Record<string, string> = {
  new: "New Moon",
  waxing_crescent: "Waxing Crescent",
  first_quarter: "First Quarter",
  waxing_gibbous: "Waxing Gibbous",
  full: "Full Moon",
  waning_gibbous: "Waning Gibbous",
  last_quarter: "Last Quarter",
  waning_crescent: "Waning Crescent",
};

const phaseEmoji = (phase: string) => {
  switch (phase) {
    case "new": return "🌑";
    case "waxing_crescent": return "🌒";
    case "first_quarter": return "🌓";
    case "waxing_gibbous": return "🌔";
    case "full": return "🌕";
    case "waning_gibbous": return "🌖";
    case "last_quarter": return "🌗";
    case "waning_crescent": return "🌘";
    default: return "🌘";
  }
};

export default async function EntryPage({ params }: { params: Promise<RouteParams> }) {
  const { id } = await params;

  const all = await fetchAllLogs();
  const e = all.find((x) => x.id === id);

  if (!e || e.privacy === "private") {
    return (
      <main className="p-8 max-w-3xl mx-auto">
        <Link href="/" className="underline underline-offset-2">← Back</Link>
        <p className="mt-6">Entry not found.</p>
      </main>
    );
  }

  const plan = (cycles as unknown as CyclePlan[]).find(
    (c) => e.date >= c.start && e.date <= c.end
  );

  const showNotes = e.privacy === "public";

  return (
    <main className="p-8 max-w-3xl mx-auto space-y-4">
      <Link href="/" className="underline underline-offset-2">← Back</Link>

      <h1 className="text-xl font-semibold">
        {e.date} — {e.cycle_day !== null ? `CD ${e.cycle_day}` : "CD —"}
      </h1>

      {/* lunar phase */}
      <div className="mt-1 text-sm text-[color-mix(in oklab,var(--ink) 70%,transparent)]">
        <span className="inline-flex items-center gap-2" title={PHASE_LABEL[e.lunar_phase] ?? e.lunar_phase}>
          <span className="text-lg leading-none select-none" aria-hidden>{phaseEmoji(e.lunar_phase)}</span>
          <span>{PHASE_LABEL[e.lunar_phase] ?? e.lunar_phase}</span>
        </span>
      </div>

      {plan && (
        <p className="text-xs text-[var(--text-tertiary)]">
          In cycle: <Link href="/cycle" className="underline underline-offset-2">{plan.start} → {plan.end}</Link>
          {plan.herb ? ` • herb: ${plan.herb}` : ""}
          {plan.threads?.length ? ` • threads: ${plan.threads.join(", ")}` : ""}
        </p>
      )}

      {/* meta */}
      <div className="space-y-1 text-sm">
        <div><span className="font-medium">Tags:</span> {e.tags.join(", ") || "—"}</div>
        <div><span className="font-medium">Practices:</span> {e.practices.join(", ") || "—"}</div>
        <div><span className="font-medium">Threads:</span> {e.threads?.join(", ") || "—"}</div>
        <div><span className="font-medium">Symptoms:</span> {e.symptoms.join(", ") || "—"}</div>
        <div><span className="font-medium">Herbs:</span> {(e.herbs ?? []).join(", ") || "—"}</div>
        <div><span className="font-medium">Mood:</span> {e.mood ?? "—"}</div>
        {(e.digestion_notes || (e.digestion_tags?.length ?? 0) > 0) && (
          <div>
            <span className="font-medium">Digestion:</span>{" "}
            {e.digestion_notes || "—"}
            {e.digestion_tags?.length ? ` — keywords: ${e.digestion_tags.join(", ")}` : ""}
          </div>
        )}
      </div>

      {/* NEW: reflection section */}
      {(e.baseline_prompt || e.baseline_response || (e.what_helped?.length ?? 0) > 0 || (e.what_hindered?.length ?? 0) > 0 || e.thread_notes) && (
        <section className="p-4 border rounded-xl space-y-3">
          <h2 className="text-sm font-medium">Reflection</h2>

          {e.baseline_prompt && (
            <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
              {e.baseline_prompt}
            </p>
          )}

          {e.baseline_response && (
            <p className="whitespace-pre-wrap text-sm">{e.baseline_response}</p>
          )}

          {(e.what_helped?.length ?? 0) > 0 && (
            <div className="text-sm">
              <span className="font-medium">What helped:</span>{" "}
              {e.what_helped!.join(", ")}
            </div>
          )}

          {(e.what_hindered?.length ?? 0) > 0 && (
            <div className="text-sm">
              <span className="font-medium">What didn’t:</span>{" "}
              {e.what_hindered!.join(", ")}
            </div>
          )}

          {e.thread_notes && (
            <div className="text-sm">
              <span className="font-medium">Thread notes:</span>
              <p className="whitespace-pre-wrap mt-1">{e.thread_notes}</p>
            </div>
          )}
        </section>
      )}

      {/* Notes (respect privacy) */}
      {showNotes ? (
        <section className="p-4 border rounded-xl">
          <h2 className="text-sm font-medium mb-2">Notes</h2>
          <p className="whitespace-pre-wrap text-sm">{e.notes || "—"}</p>
        </section>
      ) : (
        <p className="text-sm opacity-70 italic">Notes hidden for anonymized entry.</p>
      )}
    </main>
  );
}