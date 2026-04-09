import React from "react";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/formatDateTime";
import ConsultationRequestModal from "@/components/consultation-requests/ConsultationRequestModal";
import ConfirmDialog from "@/components/consultation-requests/ConfirmDialog";
import EditConsultationRequestModal from "@/components/consultation-requests/EditConsultationRequestModal";
import { deleteConsultationRequest } from "@/api/services/consultationRequestService";
import { toast } from "sonner";

const STATUS_BADGE = {
  accepted: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  rejected: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  pending: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
};

/**
 * CitizenConsultationRequestCard
 * @param {object} request - raw request object from the API
 */
export default function CitizenConsultationRequestCard({ request, onAction }) {
  const lawyerName = request?.lawyer?.name || "Lawyer";
  const lawyerEmail = request?.lawyer?.email || "";
  const createdAt = formatDateTime(request?.createdAt);
  const summary = request?.summary || "(No summary)";
  const status = (request?.status || "pending").toLowerCase();
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  const badgeClass = STATUS_BADGE[status] ?? STATUS_BADGE.pending;
  const [editOpen, setEditOpen] = React.useState(false);

  return (
    <>
      <EditConsultationRequestModal
        request={request}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={() => onAction?.()}
      />

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

          {/* Footer row: date + actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-auto">
            {createdAt && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span>Requested on: {createdAt}</span>
              </div>
            )}
            {status === "pending" && (
              <div className="ml-auto flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditOpen(true);
                  }}
                >
                  Edit
                </Button>

                <ConfirmDialog
                  trigger={
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Delete
                    </Button>
                  }
                  title="Delete request?"
                  description="Are you sure you want to delete this consultation request? This cannot be undone."
                  confirmLabel="Yes, delete"
                  confirmClass="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onConfirm={async () => {
                    try {
                      await deleteConsultationRequest(request._id);
                      toast.success("Request deleted");
                      onAction?.();
                    } catch (err) {
                      toast.error(
                        err.response?.data?.message ||
                          err.message ||
                          "Failed to delete request",
                      );
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </ConsultationRequestModal>
    </>
  );
}
