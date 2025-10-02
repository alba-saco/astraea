import Link from "next/link";
import raw from "../../data/logs.json";
import type { Entry } from "../../types";

type RouteParams = { id: string };

export default async function EntryPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { id } = await params;

  const all = raw as Entry[];
  const e = all.find((x) => x.id === id);

  if (!e || e.privacy === "private") {
    return (
      <main className="p-8 max-w-3xl mx-auto">
        <Link href="/" className="underline underline-offset-2">
          ← Back
        </Link>
        <p className="mt-6">Entry not found.</p>
      </main>
    );
  }

  const showNotes = e.privacy === "public";

  return (
    <main className="p-8 max-w-3xl mx-auto space-y-4">
      <Link href="/" className="underline underline-offset-2">
        ← Back
      </Link>

      <h1 className="text-xl font-semibold">
        {e.date} — {e.cycle_day ? `CD ${e.cycle_day}` : "CD —"}
      </h1>

      <div className="space-y-1 text-sm">
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
        <div>
          <span className="font-medium">Mood:</span> {e.mood ?? "—"}
        </div>
      </div>

      {showNotes ? (
        <section className="p-4 border rounded-xl">
          <h2 className="text-sm font-medium mb-2">Notes</h2>
          <p className="whitespace-pre-wrap text-sm">{e.notes || "—"}</p>
        </section>
      ) : (
        <p className="text-sm opacity-70 italic">
          Notes hidden for anonymized entry.
        </p>
      )}
    </main>
  );
}