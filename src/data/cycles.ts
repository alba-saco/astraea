export type Cycle = {
  cycle_id: string;        // e.g. "2025-10-new"
  new_moon: string;        // "2025-10-02"
  full_moon?: string;      // optional
  threads: string[];       // ["play_expression","pleasure_metabolism"]
  herb?: string;           // "linden"
  baseline_prompt?: string;
};

const cycles: Cycle[] = [
  {
    cycle_id: "2025-10-new",
    new_moon: "2025-10-02",
    full_moon: "2025-10-17",
    threads: ["play_expression", "pleasure_metabolism"],
    herb: "linden",
    baseline_prompt: "What reliably lifts my baseline this month?",
  },
];

export default cycles;