"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Link2, Upload, ChevronRight, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Job, JOB_STATUS_LABELS } from "@/types";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  return `Il y a ${Math.floor(hours / 24)} j`;
}

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}min` : `${m} min`;
}

const PROCESSING_STEPS = [
  "extracting",
  "transcribing",
  "analyzing",
  "cutting",
  "rendering",
] as const;

function StatusBadge({ status }: { status: Job["status"] }) {
  const isProcessing = !["done", "failed", "pending"].includes(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
        status === "done"
          ? "bg-[#052e16] text-[#4ADE80]"
          : status === "failed"
          ? "bg-[#2d0808] text-[#F87171]"
          : status === "pending"
          ? "bg-[#211D1A] text-[#5C5248]"
          : "bg-[#2d1f00] text-[#FBBF24]"
      )}
    >
      {isProcessing && (
        <Loader2 className="w-3 h-3 animate-spin" />
      )}
      {status === "done" && <CheckCircle2 className="w-3 h-3" />}
      {status === "failed" && <XCircle className="w-3 h-3" />}
      {JOB_STATUS_LABELS[status]}
    </span>
  );
}

function ProgressSteps({ status }: { status: Job["status"] }) {
  const currentIdx = PROCESSING_STEPS.indexOf(status as typeof PROCESSING_STEPS[number]);
  if (currentIdx === -1) return null;
  const pct = Math.round(((currentIdx + 0.5) / PROCESSING_STEPS.length) * 100);

  return (
    <div className="mt-3 space-y-1.5">
      <div className="h-0.5 bg-[#211D1A] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#FBBF24] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <p className="text-[11px] text-[#5C5248]">
        {JOB_STATUS_LABELS[status]}...
      </p>
    </div>
  );
}

export function JobCard({ job }: { job: Job }) {
  const isDone = job.status === "done";
  const isProcessing = !["done", "failed", "pending"].includes(job.status);

  return (
    <Link href={isDone ? `/dashboard/jobs/${job.id}` : "#"}>
      <div
        className={cn(
          "group relative rounded-xl p-5 border transition-all duration-200",
          "bg-[#171310] border-[#302B27]",
          isDone && "hover:border-[#5C5248] cursor-pointer"
        )}
      >
        <div className="flex items-start gap-4">
          {/* Icône source */}
          <div className="w-10 h-10 rounded-lg bg-[#211D1A] border border-[#302B27] flex items-center justify-center flex-shrink-0 mt-0.5">
            {job.sourceType === "youtube" ? (
              <Link2 className="w-5 h-5 text-[#FBBF24]" />
            ) : (
              <Upload className="w-5 h-5 text-[#A8988A]" />
            )}
          </div>

          {/* Infos */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-[#FAF7F4] truncate">
                  {job.sourceTitle ?? "Vidéo sans titre"}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {job.durationSec && (
                    <span className="text-xs text-[#5C5248]">
                      {formatDuration(job.durationSec)}
                    </span>
                  )}
                  <span className="text-[#302B27]">·</span>
                  <span className="text-xs text-[#5C5248]">
                    {timeAgo(job.createdAt)}
                  </span>
                  {isDone && job.clips.length > 0 && (
                    <>
                      <span className="text-[#302B27]">·</span>
                      <span className="text-xs text-[#4ADE80]">
                        {job.clips.length} clips
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={job.status} />
                {isDone && (
                  <ChevronRight className="w-4 h-4 text-[#5C5248] group-hover:text-[#A8988A] transition-colors" />
                )}
              </div>
            </div>

            {/* Barre de progression */}
            {isProcessing && <ProgressSteps status={job.status} />}
          </div>
        </div>
      </div>
    </Link>
  );
}
