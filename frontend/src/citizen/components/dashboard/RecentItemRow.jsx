import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/formatDateTime";

const ACTIVITY_STATUS_STYLE = {
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  accepted:
    "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  rejected: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  open: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  closed: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  in_progress: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  resolved:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

/**
 * A single row in the recent-activity list.
 */
export default function RecentItemRow({ title, subtitle, status, date, href }) {
  const statusLabel =
    status === "in_progress"
      ? "In Progress"
      : status?.charAt(0).toUpperCase() + status?.slice(1);

  return (
    <Link
      to={href}
      className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/60"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        {subtitle && (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge
          className={`text-[10px] uppercase tracking-wide ${ACTIVITY_STATUS_STYLE[status] || ""}`}
        >
          {statusLabel}
        </Badge>
        {date && (
          <span className="hidden text-[11px] text-muted-foreground sm:inline">
            {formatDateTime(date)}
          </span>
        )}
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </Link>
  );
}
