import { Clock, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/formatDateTime";

/**
 * CaseCard
 * @param {object}   caseItem       - raw case object from the API
 * @param {boolean}  clickable      - whether the card navigates on click
 * @param {function} onClick        - called when the card is clicked
 * @param {object}   primaryPerson  - optional { name, email } to display instead of caseItem.user
 */
export default function CaseCard({
  caseItem,
  clickable = false,
  onClick,
  primaryPerson,
  meta,
}) {
  const displayName = primaryPerson?.name || caseItem?.user?.name || "Citizen";
  const displayEmail = primaryPerson?.email || caseItem?.user?.email || "";
  const createdAt = formatDateTime(caseItem?.createdAt);
  const summary = caseItem?.consultationRequest?.summary || "(No summary)";
  const caseStatus = (caseItem?.status || "open").toLowerCase();

  const badgeClass =
    caseStatus === "closed"
      ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
      : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300";

  const statusLabel = caseStatus.charAt(0).toUpperCase() + caseStatus.slice(1);

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? onClick : undefined}
      onKeyDown={
        clickable
          ? (e) => (e.key === "Enter" || e.key === " ") && onClick?.()
          : undefined
      }
      className={[
        "group flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm text-card-foreground",
        clickable
          ? "cursor-pointer transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          : "",
      ]
        .join(" ")
        .trim()}
    >
      {/* Top row: avatar + name + status badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar initial */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-sm text-foreground">
              {displayName}
            </p>
            {displayEmail && (
              <p className="truncate text-xs text-muted-foreground">
                {displayEmail}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Badge
            className={`${badgeClass} text-[10px] uppercase tracking-wide`}
          >
            {statusLabel}
          </Badge>
          {clickable && (
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </div>
      </div>

      {/* Summary */}
      <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
        {summary}
      </p>

      {/* Meta (e.g. lawyer info for admin cards) */}
      {meta && (
        <div className="mt-2 px-2 py-1.5 rounded bg-secondary/50 border border-secondary">
          <p className="text-xs font-medium text-foreground truncate">{meta}</p>
        </div>
      )}

      {/* Footer: opened date */}
      {createdAt && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>Opened {createdAt}</span>
        </div>
      )}
    </div>
  );
}
