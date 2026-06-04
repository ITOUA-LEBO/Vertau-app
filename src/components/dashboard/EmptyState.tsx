import Link from "next/link";
import { Video } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-[#171310] border border-[#302B27] flex items-center justify-center">
        <Video className="w-7 h-7 text-[#5C5248]" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-[#FAF7F4]">
          Aucune vidéo encore
        </h3>
        <p className="text-sm text-[#5C5248] max-w-xs">
          Importe ta première vidéo pour générer tes clips viraux.
        </p>
      </div>
      <Link
        href="/dashboard/new"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FBBF24] text-[#0C0A09] text-sm font-semibold hover:bg-[#F59E0B] transition-colors"
      >
        Importer une vidéo
      </Link>
    </div>
  );
}
