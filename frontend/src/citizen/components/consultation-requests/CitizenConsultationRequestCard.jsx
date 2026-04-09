import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/formatDateTime";
import ConsultationRequestModal from "@/components/consultation-requests/ConsultationRequestModal";

const STATUS_BADGE = {
  accepted: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  rejected: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  pending: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
};

/**
 * CitizenConsultationRequestCard
 * @param {object} request - raw request object from the API
 */
export default function CitizenConsultationRequestCard({ request }) {
  const lawyerName = request?.lawyer?.name || "Lawyer";
  const lawyerEmail = request?.lawyer?.email || "";
  const createdAt = formatDateTime(request?.createdAt);
  const summary = request?.summary || "(No summary)";
  const status = (request?.status || "pending").toLowerCase();
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  const badgeClass = STATUS_BADGE[status] ?? STATUS_BADGE.pending;

  return (
    <ConsultationRequestModal request={request}>
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm text-card-foreground cursor-pointer hover:shadow-md">
        {/* Top row: avatar + name/email + status badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {lawyerName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-sm text-foreground">
                {lawyerName}
              </p>
              {lawyerEmail && (
                <p className="truncate text-xs text-muted-foreground">
                  {lawyerEmail}
                </p>
              )}
            </div>
          </div>
          <Badge
            className={`${badgeClass} shrink-0 text-[10px] uppercase tracking-wide`}
          >
            {statusLabel}
          </Badge>
        </div>

        {/* Summary */}
        <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
          {summary}
        </p>

        {/* Footer row: date */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-auto">
          {createdAt && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>Requested on: {createdAt}</span>
            </div>
          )}
        </div>
      </div>
    </ConsultationRequestModal>
  );
}
