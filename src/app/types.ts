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
    privacy: Privacy;
    notes: string;
    schema_version?: number;
  };