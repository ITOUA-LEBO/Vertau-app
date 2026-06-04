import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Job, Clip } from "@/types";

export function useJobs() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("processing_jobs")
        .select("*, clips(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data ?? []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        status: row.status,
        sourceType: row.source_type,
        sourceUrl: row.source_url,
        sourceTitle: row.source_title,
        durationSec: row.duration_sec,
        minutesUsed: row.minutes_used,
        platforms: row.platforms ?? [],
        template: row.template,
        subtitleStyle: row.subtitle_style,
        errorMessage: row.error_message,
        clips: (row.clips ?? []).map((c: Record<string, unknown>) => ({
          id: c.id,
          jobId: c.job_id,
          title: c.title,
          hook: c.hook,
          score: c.score,
          startTime: c.start_time,
          endTime: c.end_time,
          platform: c.platform,
          template: c.template,
          filePath: c.file_path,
          status: c.status,
          expiresAt: c.expires_at,
          createdAt: c.created_at,
        })) as Clip[],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })) as Job[];
    },
    staleTime: 10_000,
  });
}

export function useJob(jobId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["job-detail", jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("processing_jobs")
        .select("*, clips(*)")
        .eq("id", jobId)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 5_000,
  });
}
