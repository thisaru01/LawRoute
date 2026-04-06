import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

/**
 * Skeleton placeholder that matches LawyerCard's layout.
 * @param {{ count?: number }} props
 */
export default function LawyerCardSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden border border-border bg-card shadow-sm">
          <CardContent className="flex flex-col gap-4 p-5">
            {/* header */}
            <div className="flex items-start gap-3">
              <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            {/* badges row */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            {/* bio */}
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-4/5" />
            </div>
            {/* tags */}
            <div className="flex flex-wrap gap-1.5">
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-md" />
              <Skeleton className="h-5 w-14 rounded-md" />
            </div>
            {/* languages */}
            <div className="flex items-center gap-2 border-t border-border pt-3">
              <Skeleton className="h-3.5 w-3.5 rounded-full" />
              <Skeleton className="h-3 w-28" />
            </div>
          </CardContent>
          <CardFooter className="mt-auto flex flex-col gap-2 border-t p-4 sm:flex-row sm:justify-end">
             <Skeleton className="h-9 w-full rounded-md sm:w-28" />
             <Skeleton className="h-9 w-full rounded-md sm:w-44" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
