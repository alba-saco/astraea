export type Cycle = {
  cycle_id: string;        // e.g. "2025-10-new"
  start: string;           // new moon → used as start
  full_moon?: string;      // optional
  end: string;         // quick range lookup
  threads: string[];       // ["play_expression","vitality"]
  herb?: string;           // "tulsi"
  baseline_prompt?: string;
  title?: string;          // friendly label, auto-generated
};

// define and post-process cycles
const cycles: Cycle[] = [
  {
    cycle_id: "2025-10-new",
    start: "2025-10-21",       // renamed from new_moon
    full_moon: "2025-11-05",
    end: "2025-11-19",
    threads: ["play_expression", "vitality"],
    herb: "tulsi",
    baseline_prompt: "What reliably lifts my baseline this month?",
    title: "Libra New Moon Cycle"
  },
].map((c, i, arr) => {
  // auto-assign end date (start of next cycle or +29 days fallback)
  const next = arr[i + 1];
  const end = next ? next.start : new Date(
    new Date(c.start).getTime() + 29 * 24 * 60 * 60 * 1000
  ).toISOString().slice(0, 10);

  return {
    ...c,
    end,
    title: c.title ?? `Cycle starting ${c.start}`,
  };
});

export default cycles;

export function cycleFor(dateISO: string): Cycle | undefined {
  return cycles.find(c => dateISO >= c.start && dateISO <= (c.end ?? c.start));
}