import { User, Calendar, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="space-y-4">
      {/* Error */}
      {caseError && (
        <p className="text-sm text-destructive">
          {caseError.message || "Failed to load case details"}
        </p>
      )}

      {/* Status + date row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
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
        {(caseLoading || createdAtLabel) && (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {caseLoading ? <Skeleton className="h-4 w-36" /> : createdAtLabel}
          </span>
        )}
      </div>

      <Separator />

      {/* Involved Person */}
      <div>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Involved Person
          </CardTitle>
        </CardHeader>
        <CardContent>
          {caseLoading ? (
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-52" />
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                {citizenName?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="space-y-0.5 text-sm">
                <p className="font-medium text-foreground">{citizenName}</p>
                {citizenEmail && (
                  <p className="text-muted-foreground">{citizenEmail}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </div>

      <Separator />


      {/* Summary */}
      <div>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </div>
    </div>
  );
}
