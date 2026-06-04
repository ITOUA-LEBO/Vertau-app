const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Erreur API");
  }
  return res.json();
}

export const api = {
  createJob: (payload: {
    user_id: string;
    source_type: "youtube" | "upload";
    source_url?: string;
    source_path?: string;
    platforms: string[];
    template: string;
    subtitle_style: string;
  }) =>
    apiFetch<{ job_id: string; status: string }>("/jobs/create", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getJobStatus: (jobId: string) =>
    apiFetch<{
      job_id: string;
      status: string;
      progress: number;
      current_step?: string;
      clips_count?: number;
      clips?: unknown[];
      error_message?: string;
    }>(`/jobs/${jobId}/status`),

  getDownloadUrl: (clipId: string) =>
    apiFetch<{ download_url: string; expires_in: number }>(
      `/jobs/${clipId}/download`
    ),
};
