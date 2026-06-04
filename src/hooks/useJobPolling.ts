import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useJobPolling(jobId: string | null) {
  return useQuery({
    queryKey: ["job", jobId],
    queryFn: () => api.getJobStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status || ["done", "failed"].includes(status)) return false;
      return 3000;
    },
    staleTime: 0,
  });
}
