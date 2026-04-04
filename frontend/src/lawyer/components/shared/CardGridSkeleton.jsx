import { Skeleton } from "@/components/ui/skeleton";

/**
 * Card-shaped loading skeleton grid.
 * Used by LawyerCases and LawyerConsultationRequests.
 * @param {number} count - Number of skeleton cards to render (default 4)
 */
export default function CardGridSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}
