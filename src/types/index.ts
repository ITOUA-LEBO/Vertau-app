export type JobStatus =
  | "pending"
  | "extracting"
  | "transcribing"
  | "analyzing"
  | "cutting"
  | "rendering"
  | "done"
  | "failed";

export type Platform = "tiktok" | "reels" | "shorts";

export type SubtitleStyle = "karaoke" | "highlight" | "impact";

export type Template = "minimal" | "bold" | "modern" | "clean";

export type Plan = "free" | "creator" | "pro" | "agency";

export type Job = {
  id: string;
  userId: string;
  status: JobStatus;
  sourceType: "youtube" | "upload";
  sourceUrl?: string;
  sourceTitle?: string;
  durationSec?: number;
  minutesUsed?: number;
  platforms: Platform[];
  template: Template;
  subtitleStyle: SubtitleStyle;
  errorMessage?: string;
  clips: Clip[];
  createdAt: string;
  updatedAt: string;
};

export type Clip = {
  id: string;
  jobId: string;
  title: string;
  hook?: string;
  score: number;
  startTime: number;
  endTime: number;
  platform: Platform;
  template: Template;
  filePath?: string;
  status: "pending" | "ready" | "failed";
  expiresAt: string;
  createdAt: string;
};

export type UserProfile = {
  id: string;
  email: string;
  name?: string;
  plan: Plan;
  minutesIncluded: number;
  minutesUsed: number;
  overageRate?: number;
  brandLogoUrl?: string;
  brandColor: string;
  subtitleStyle: SubtitleStyle;
  defaultTemplate: Template;
  createdAt: string;
};

export const PLAN_LIMITS: Record<Plan, { minutes: number; overageRate: number | null; label: string }> = {
  free:    { minutes: 30,   overageRate: null,  label: "Free" },
  creator: { minutes: 150,  overageRate: 0.08,  label: "Creator" },
  pro:     { minutes: 600,  overageRate: 0.06,  label: "Pro" },
  agency:  { minutes: 2000, overageRate: 0.04,  label: "Agency" },
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  pending:      "En attente",
  extracting:   "Import",
  transcribing: "Transcription",
  analyzing:    "Analyse IA",
  cutting:      "Découpe",
  rendering:    "Rendu final",
  done:         "Terminé",
  failed:       "Échec",
};
