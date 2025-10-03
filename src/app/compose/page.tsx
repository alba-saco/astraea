"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Privacy, Entry, Phase } from "../types";

const makeId = (date: string, part: "am" | "pm") => `${date}-${part}`;

function download(text: string, filename: string, type = "application/json") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Compose() {
  // optional lightweight gate
  const [key, setKey] = useState<string>("");
  const allowed = useMemo(() => {
    const expected = process.env.NEXT_PUBLIC_COMPOSE_KEY || "";
    return expected ? key === expected : true;
  }, [key]);

    // form state
    const [date, setDate] = useState<string>("");
    const [part, setPart] = useState<"am" | "pm">("am");
    const [cycleDay, setCycleDay] = useState<number | "">("");
    const [phase, setPhase] = useState<Phase>("full");
    const [tags, setTags] = useState<string>("");
    const [symptoms, setSymptoms] = useState<string>("");
    const [practices, setPractices] = useState<string>("");
    const [threads, setThreads] = useState<string>("");
    const [mood, setMood] = useState<string>("");
    const [privacy, setPrivacy] = useState<Privacy>("public");
    const [notes, setNotes] = useState<string>("");
    const [digestionNotes, setDigestionNotes] = useState<string>("");
    const [digestionTags, setDigestionTags] = useState<string>("");

  const id = date ? makeId(date, part) : "";

  const entry: Entry = {
    id,
    date,
    cycle_day: cycleDay === "" ? null : Number(cycleDay),
    lunar_phase: phase,
    tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
    symptoms: symptoms.split(",").map((s) => s.trim()).filter(Boolean),
    practices: practices.split(",").map((s) => s.trim()).filter(Boolean),
    // add herbs later if/when you introduce the field in Entry
    threads: threads.split(",").map((s) => s.trim()).filter(Boolean),
    mood: mood || null,
    privacy,
    notes,
    schema_version: 1,
  };

  const json = JSON.stringify(entry, null, 2);

  const addToLocal = () => {
    try {
      const currRaw = localStorage.getItem("astraea_drafts");
      const curr: Entry[] = currRaw ? (JSON.parse(currRaw) as Entry[]) : [];
      localStorage.setItem("astraea_drafts", JSON.stringify([entry, ...curr]));
      alert("Added to local drafts. It will appear in the library until you clear storage.");
    } catch {
      alert("Could not save to local drafts.");
    }
  };

  return (
    <main className="p-8 max-w-3xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Compose entry</h1>
        <div className="flex gap-4">
          <Link href="/" className="text-sm underline underline-offset-2">
            ← Library
          </Link>
        </div>
      </header>

      {process.env.NEXT_PUBLIC_COMPOSE_KEY && !allowed ? (
        <div className="p-4 border rounded-xl space-y-3">
          <p className="text-sm opacity-80">Enter passphrase to compose.</p>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Passphrase"
            className="h-11 w-full rounded-xl border px-3"
          />
        </div>
      ) : (
        <>
          <section className="p-5 border rounded-2xl grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs uppercase opacity-70">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 rounded-xl border px-3"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs uppercase opacity-70">AM/PM</span>
                <select
                    value={part}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setPart(e.target.value as "am" | "pm")
                    }
                    className="h-11 rounded-xl border px-3"
                    >
                    <option value="am">AM</option>
                    <option value="pm">PM</option>
                </select>
            </label>

            <label className="grid gap-2">
              <span className="text-xs uppercase opacity-70">Cycle day</span>
              <input
                type="number"
                min={1}
                max={30}
                value={cycleDay}
                onChange={(e) => setCycleDay(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="e.g. 13"
                className="h-11 rounded-xl border px-3"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs uppercase opacity-70">Lunar phase</span>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value as Phase)}
                className="h-11 rounded-xl border px-3"
              >
                {[
                  "new",
                  "waxing_crescent",
                  "first_quarter",
                  "waxing_gibbous",
                  "full",
                  "waning_gibbous",
                  "last_quarter",
                  "waning_crescent",
                ].map((p) => (
                  <option key={p} value={p}>
                    {p.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>

            <label className="md:col-span-2 grid gap-2">
              <span className="text-xs uppercase opacity-70">Tags (comma)</span>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="h-11 rounded-xl border px-3"
                placeholder="herbal, sleep, TCM"
              />
            </label>

            <label className="md:col-span-2 grid gap-2">
              <span className="text-xs uppercase opacity-70">Symptoms (comma)</span>
              <input
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="h-11 rounded-xl border px-3"
              />
            </label>

            <label className="md:col-span-2 grid gap-2">
              <span className="text-xs uppercase opacity-70">Practices (comma)</span>
              <input
                value={practices}
                onChange={(e) => setPractices(e.target.value)}
                className="h-11 rounded-xl border px-3"
              />
            </label>

            <label className="md:col-span-2 grid gap-2">
              <span className="text-xs uppercase opacity-70">Threads (comma separated)</span>
              <input
                value={threads}
                onChange={(e) => setThreads(e.target.value)}
                placeholder="heart_healing, skin_care"
                className="h-11 rounded-xl border px-3"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs uppercase opacity-70">Mood</span>
              <input
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="h-11 rounded-xl border px-3"
              />
            </label>

            <label className="md:col-span-2 grid gap-2">
                <span className="text-xs uppercase opacity-70">Digestion (free text)</span>
                <textarea
                    value={digestionNotes}
                    onChange={(e) => setDigestionNotes(e.target.value)}
                    className="min-h-[100px] rounded-xl border p-3"
                    placeholder="e.g., regular, slightly sluggish after late bread; infusion feels strong…"
                />
            </label>

            <label className="md:col-span-2 grid gap-2">
                <span className="text-xs uppercase opacity-70">Digestion keywords (comma)</span>
                <input
                    value={digestionTags}
                    onChange={(e) => setDigestionTags(e.target.value)}
                    className="h-11 rounded-xl border px-3"
                    placeholder="regular, sluggish, bloating"
                />
            </label>

            <fieldset className="grid gap-2">
              <legend className="text-xs uppercase opacity-70">Privacy</legend>
              <div className="flex gap-3">
                {(["public", "anon", "private"] as Privacy[]).map((p) => (
                  <label key={p} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="privacy"
                      value={p}
                      checked={privacy === p}
                      onChange={() => setPrivacy(p)}
                    />
                    {p}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="md:col-span-2 grid gap-2">
              <span className="text-xs uppercase opacity-70">Notes</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[140px] rounded-xl border p-3"
                placeholder="Free-form notes…"
              />
            </label>
          </section>

          <section className="p-5 border rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm opacity-80">Preview JSON</p>
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(json)}
                  className="inline-flex h-10 items-center rounded-full border px-4 text-sm hover:bg-neutral-800"
                >
                  Copy
                </button>
                <button
                  onClick={() => download(json, `${id || "entry"}.json`)}
                  className="inline-flex h-10 items-center rounded-full border px-4 text-sm hover:bg-neutral-800"
                  disabled={!id}
                >
                  Download
                </button>
                <button
                  onClick={addToLocal}
                  className="inline-flex h-10 items-center rounded-full border px-4 text-sm hover:bg-neutral-800"
                  disabled={!id}
                >
                  Add to local drafts
                </button>
              </div>
            </div>
            <pre className="text-xs overflow-x-auto rounded-lg p-3 bg-neutral-900/40 border">
{json}
            </pre>
            <p className="text-xs opacity-70">
              Local drafts merge into the library for preview; commit to JSON when ready.
            </p>
          </section>
        </>
      )}
    </main>
  );
}