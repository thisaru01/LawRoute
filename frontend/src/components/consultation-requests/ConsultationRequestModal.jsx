import { Clock } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/formatDateTime";

const STATUS_BADGE = {
  accepted: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  rejected: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  pending: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
};

export default function ConsultationRequestModal({
  request,
  children,
  showCitizen = false,
}) {
  const displayName = showCitizen
    ? request?.user?.name || "Citizen"
    : request?.lawyer?.name || "Lawyer";
  const displayEmail = showCitizen
    ? request?.user?.email || ""
    : request?.lawyer?.email || "";
  const createdAt = formatDateTime(request?.createdAt);
  const summary = request?.summary || "(No summary)";
  const status = (request?.status || "pending").toLowerCase();
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  const badgeClass = STATUS_BADGE[status] ?? STATUS_BADGE.pending;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl p-6">
        <DialogHeader>
          <div className="flex items-start justify-between mt-3 gap-3">
            <div>
              <DialogTitle>Consultation Request</DialogTitle>
              <DialogDescription className="mt-4">
                <div className="text-sm text-foreground font-semibold">
                  {displayName}
                </div>
                {displayEmail && (
                  <div className="text-xs text-muted-foreground">
                    {displayEmail}
                  </div>
                )}
              </DialogDescription>
            </div>
            <Badge
              className={`${badgeClass} shrink-0 text-[10px] mr-2 uppercase tracking-wide`}
            >
              {statusLabel}
            </Badge>
          </div>
        </DialogHeader>

        <div className="mt-4 text-sm text-muted-foreground leading-relaxed">
          {summary}
        </div>

        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>Requested on: {createdAt}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
