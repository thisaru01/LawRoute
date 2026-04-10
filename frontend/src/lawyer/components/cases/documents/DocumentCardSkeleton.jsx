import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton placeholder while documents are loading
function DocumentCardSkeleton() {
  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-background p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-3 w-8" />
      </div>
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-2.5 w-1/2" />
    </div>
  );
}

export default DocumentCardSkeleton;
