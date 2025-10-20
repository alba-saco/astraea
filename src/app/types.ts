export type Phase =
  | "new"
  | "waxing_crescent"
  | "first_quarter"
  | "waxing_gibbous"
  | "full"
  | "waning_gibbous"
  | "last_quarter"
  | "waning_crescent";

export type Privacy = "public" | "anon" | "private";

export type Entry = {
    id: string;
    date: string;
    cycle_day: number | null;
    lunar_phase: Phase | string;
    tags: string[];
    symptoms: string[];
    practices: string[];
    threads: string[];
    herbs?: string[];               // future
    mood: string | null;
    /** NEW */
    digestion_notes?: string | null;
    digestion_tags?: string[];
    baseline_prompt?: string | null;   // e.g., "What lifted my baseline today?"
    baseline_response?: string | null; // your short answer for the day
    what_helped?: string[];            // tags: walk, sunlight, nettle, phone_call
    what_hindered?: string[];          // tags: sugar, weed, doomscrolling
    thread_notes?: string | null;      // free text for play_expression / pleasure_metabolism
    privacy: Privacy;
    notes: string;
    schema_version?: number;
  };

export type CyclePlan = {
  id: string;            // e.g. "2025-10-new-moon"
  start: string;         // "YYYY-MM-DD" (inclusive)
  end: string;           // "YYYY-MM-DD" (inclusive)
  threads: string[];
  herb?: string | null;
  baseline_prompt?: string | null;
  notes?: string | null; // optional framing
};