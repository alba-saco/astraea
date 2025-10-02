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
  date: string;               // YYYY-MM-DD
  cycle_day: number | null;
  lunar_phase: Phase | string; // allow string to tolerate legacy values
  tags: string[];
  symptoms: string[];
  practices: string[];
  herbs?: string[];           // optional for now
  threads: string[];          // narrative journeys
  mood: string | null;
  privacy: Privacy;
  notes: string;
  schema_version?: number;
};