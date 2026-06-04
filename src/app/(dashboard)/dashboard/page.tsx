"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { JobCard } from "@/components/dashboard/JobCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useJobs } from "@/hooks/useJobs";

export default function DashboardPage() {
  const { data: jobs, isLoading, error } = useJobs();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-5 h-5 text-[#5C5248] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm text-[#F87171]">Erreur de chargement. Recharge la page.</p>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs text-[#5C5248] uppercase tracking-widest font-medium">
          Vidéos récentes
        </h2>
        <span className="text-xs text-[#5C5248]">
          {jobs.length} vidéo{jobs.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-3">
        {jobs.map((job, i) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
          >
            <JobCard job={job} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
