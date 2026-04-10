import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

function MeetingCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-background p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-3 w-40" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

export default MeetingCardSkeleton;
