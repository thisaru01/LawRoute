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

export default function AdminCaseModal({ caseItem, children }) {
  const citizenName = caseItem?.user?.name || "Citizen";
  const citizenEmail = caseItem?.user?.email || "";
  const lawyerName = caseItem?.lawyer?.name || "Lawyer";
  const lawyerEmail = caseItem?.lawyer?.email || "";
  const createdAt = formatDateTime(caseItem?.createdAt);
  const summary = caseItem?.consultationRequest?.summary || "(No summary)";
  const caseStatus = (caseItem?.status || "open").toLowerCase();

  const badgeClass =
    caseStatus === "closed"
      ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
      : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300";

  const statusLabel = caseStatus.charAt(0).toUpperCase() + caseStatus.slice(1);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl p-6">
        <DialogHeader>
          <div className="flex items-start justify-between mt-3 gap-3">
            <div>
              <DialogTitle>Case Details</DialogTitle>
              <DialogDescription className="mt-3">
                <div className="text-sm text-foreground font-semibold">
                  {citizenName}
                </div>
                {citizenEmail && (
                  <div className="text-xs text-muted-foreground">
                    {citizenEmail}
                  </div>
                )}
                <div className="mt-3 text-sm text-foreground font-semibold">
                  {lawyerName}
                </div>
                {lawyerEmail && (
                  <div className="text-xs text-muted-foreground">
                    {lawyerEmail}
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
          <span>Opened {createdAt}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
