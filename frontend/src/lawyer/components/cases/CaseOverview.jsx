import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function CaseOverview({
  caseLoading,
  caseError,
  citizenName,
  citizenEmail,
  createdAtLabel,
  summary,
  normalizedStatus,
  label,
}) {
  return (
    <div className="space-y-5">
      {caseError && (
        <p className="text-sm text-destructive">
          {caseError.message || "Failed to load case details"}
        </p>
      )}

      {/* Status & Date */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="font-medium text-foreground">Status:</span>
          {caseLoading ? (
            <Skeleton className="h-5 w-16" />
          ) : (
            <Badge
              className={
                normalizedStatus === "closed"
                  ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                  : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
              }
            >
              {label}
            </Badge>
          )}
        </span>

        {createdAtLabel && (
          <span className="flex items-center gap-1">
            <span className="font-medium text-foreground">Opened:</span>
            {caseLoading ? <Skeleton className="h-4 w-32" /> : createdAtLabel}
          </span>
        )}
      </div>

      <Separator />

      {/* Involved person */}
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Involved Person
        </p>
        {caseLoading ? (
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-52" />
          </div>
        ) : (
          <div className="space-y-0.5 text-sm">
            <p className="font-medium text-foreground">{citizenName}</p>
            {citizenEmail && (
              <p className="text-muted-foreground">{citizenEmail}</p>
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* Summary */}
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Summary
        </p>
        {caseLoading ? (
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ) : (
          <p className="whitespace-pre-line text-sm text-foreground leading-relaxed">
            {summary}
          </p>
        )}
      </div>
    </div>
  );
}
