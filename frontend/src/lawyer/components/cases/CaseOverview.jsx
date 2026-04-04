import { User, Calendar, FileText, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCaseContext } from "@/lawyer/components/cases/CaseContext";
import ConfirmDialog from "@/lawyer/components/shared/ConfirmDialog";

export default function CaseOverview() {
  const {
    caseLoading,
    caseError,
    citizenName,
    citizenEmail,
    createdAtLabel,
    summary,
    normalizedStatus,
    label,
    isClosing,
    closeError,
    handleCloseCase,
  } = useCaseContext();

  const isAlreadyClosed = normalizedStatus === "closed";

  return (
    <div className="space-y-4">
      {/* Errors */}
      {caseError && (
        <p className="text-sm text-destructive">
          {caseError.message || "Failed to load case details"}
        </p>
      )}
      {closeError && (
        <p className="text-sm text-destructive">
          {closeError.message || "Failed to close case. Please try again."}
        </p>
      )}

      {/* Status + date row + Close button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="flex items-center gap-2">
            <span className="font-medium text-foreground">Status:</span>
            {caseLoading ? (
              <Skeleton className="h-5 w-16" />
            ) : (
              <Badge
                className={
                  isAlreadyClosed
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

        {/* Close case — only shown when case is open and loaded */}
        {!caseLoading && !isAlreadyClosed && (
          <ConfirmDialog
            trigger={
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5"
                disabled={isClosing}
              >
                <XCircle className="h-4 w-4" />
                {isClosing ? "Closing…" : "Close case"}
              </Button>
            }
            title="Close this case?"
            description="This will mark the case as closed. The case will no longer be active and cannot be reopened. This action cannot be undone."
            confirmLabel="Yes, close case"
            confirmClass="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onConfirm={handleCloseCase}
          />
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
