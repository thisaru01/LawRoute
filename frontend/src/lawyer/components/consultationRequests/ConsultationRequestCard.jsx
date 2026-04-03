import { useState } from "react";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  acceptConsultationRequest,
  rejectConsultationRequest,
} from "@/api/services/consultationRequestService";

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

const STATUS_BADGE = {
  accepted: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  rejected: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  pending: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
};

/**
 * ConsultationRequestCard
 * @param {object}   request   – raw request object from the API
 * @param {boolean}  showActions – show Accept / Reject buttons (pending only)
 * @param {function} onAction  – called after a successful accept / reject
 */
export default function ConsultationRequestCard({
  request,
  showActions = false,
  onAction,
}) {
  const [busyId, setBusyId] = useState(null);

  const citizenName = request?.user?.name || "Citizen";
  const citizenEmail = request?.user?.email || "";
  const createdAt = formatDateTime(request?.createdAt);
  const summary = request?.summary || "(No summary)";
  const status = (request?.status || "pending").toLowerCase();
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  const badgeClass = STATUS_BADGE[status] ?? STATUS_BADGE.pending;

  const act = async (fn) => {
    try {
      setBusyId(request?._id);
      await fn(request?._id);
      onAction?.();
    } catch (err) {
      console.error(err);
    } finally {
      setBusyId(null);
    }
  };

  const isBusy = busyId === request?._id;

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm text-card-foreground">
      {/* Top row: avatar + name/email + status badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {citizenName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-sm text-foreground">
              {citizenName}
            </p>
            {citizenEmail && (
              <p className="truncate text-xs text-muted-foreground">
                {citizenEmail}
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

      {/* Footer row: date + actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {createdAt && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{createdAt}</span>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 ml-auto">
            <Button
              size="sm"
              className="bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300"
              disabled={isBusy}
              onClick={() => act(acceptConsultationRequest)}
            >
              {isBusy ? "Working..." : "Accept"}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={isBusy}
              onClick={() => act(rejectConsultationRequest)}
            >
              {isBusy ? "Working..." : "Reject"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
