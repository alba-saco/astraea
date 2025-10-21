import Link from "next/link";
import cycles from "@/data/cycles";
import type { Entry } from "../types";

async function fetchLogs(): Promise<Entry[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/logs`, { cache: "no-store" }).catch(() => null);
  if (!res || !res.ok) return [];
  return (await res.json()) as Entry[];
}

function inRange(dateISO: string, startISO: string, endISO: string) {
  // inclusive [start, end]
  return dateISO >= startISO && dateISO <= endISO;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CyclePage() {
  const all = await fetchLogs();

  // Only show public/anon entries
  const visible = all
    .filter((e) => e.privacy !== "private")
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  // Sort cycles by start descending
  const plans = cycles.slice().sort((a, b) => (a.start < b.start ? 1 : -1));

  return (
    <main className="p-8 max-w-3xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cycles</h1>
        <Link href="/" className="text-sm underline underline-offset-2">
          ← Library
        </Link>
      </header>

      {plans.length === 0 && (
        <p className="text-sm opacity-70">
          No cycles defined yet. Add one in <code>src/app/data/cycles.ts</code>.
        </p>
      )}

      <section className="space-y-8">
        {plans.map((plan) => {
          // inclusive range match
          const entries = visible.filter((e) => inRange(e.date, plan.start, plan.end ?? plan.start));

          const tagCounts = new Map<string, number>();
          const herbsCounts = new Map<string, number>();
          entries.forEach((e) => {
            (e.tags || []).forEach((t) => tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1));
            (e.herbs || []).forEach((h) => herbsCounts.set(h, (herbsCounts.get(h) ?? 0) + 1));
          });

          const topTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
          const topHerbs = [...herbsCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

          return (
            <article
                id={plan.cycle_id}
                key={plan.cycle_id}
                className="p-5 rounded-xl border border-[var(--line)] bg-[var(--surface)]/70"
            >
              <header className="mb-3">
                <h2 className="text-lg font-semibold">{plan.title}</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {plan.start} → {plan.end}
                </p>
              </header>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                    Threads
                  </p>
                  <p className="text-sm">
                    {plan.threads?.length
                      ? plan.threads.map((t, i) => (
                          <Link
                            key={t}
                            href={`/thread/${encodeURIComponent(t)}`}
                            className="hover:underline"
                          >
                            {i ? ", " : ""}
                            {t}
                          </Link>
                        ))
                      : "—"}
                  </p>

                  <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] mt-3">
                    Herb of cycle
                  </p>
                  <p className="text-sm">{plan.herb ?? "—"}</p>

                  {plan.baseline_prompt && (
                    <>
                      <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] mt-3">
                        Prompt
                      </p>
                      <p className="text-sm">{plan.baseline_prompt}</p>
                    </>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                    This cycle at a glance
                  </p>
                  <p className="text-sm">
                    Entries: <span className="font-medium">{entries.length}</span>
                  </p>
                  {topHerbs.length > 0 && (
                    <p className="text-sm">
                      Herbs:{" "}
                      {topHerbs.map(([h, c], i) => (
                        <span key={h}>
                          {i ? ", " : ""}
                          {h} ({c})
                        </span>
                      ))}
                    </p>
                  )}
                  {topTags.length > 0 && (
                    <p className="text-sm">
                      Tags:{" "}
                      {topTags.map(([t, c], i) => (
                        <span key={t}>
                          {i ? ", " : ""}
                          {t} ({c})
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              </div>

              {/* Entries list */}
              <div className="mt-5 pt-5 border-t border-[var(--line)] space-y-2">
                {entries.length === 0 ? (
                  <p className="text-sm text-[var(--text-secondary)]">
                    No entries in this window yet.
                  </p>
                ) : (
                  entries.map((e) => (
                    <div key={e.id} className="text-sm">
                      <Link
                        href={`/entry/${e.id}`}
                        className="underline underline-offset-2 decoration-[var(--accent)]/40"
                      >
                        {e.date} —{" "}
                        {e.cycle_day !== null ? `CD ${e.cycle_day}` : "CD —"}
                      </Link>
                      {e.threads?.length ? (
                        <span className="ml-2 text-[var(--text-tertiary)]">
                          [{e.threads.join(", ")}]
                        </span>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}