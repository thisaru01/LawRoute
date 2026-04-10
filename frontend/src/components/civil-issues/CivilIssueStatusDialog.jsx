import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateCivilIssueStatus, rejectCivilIssue } from "@/api/services/civilIssueService";
import { toast } from "sonner";
import { Loader2, ShieldAlert, CheckCircle2, PlayCircle } from "lucide-react";

/**
 * A specialized dialog that adapts to different civil issue status transitions.
 * 
 */
export default function CivilIssueStatusDialog({ issue, targetStatus, open, onOpenChange, onSuccess }) {
  const [note, setNote] = useState("");
  const [resolutionSummary, setResolutionSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const isReject = targetStatus === "rejected";
  const isResolve = targetStatus === "resolved";
  const isProgress = targetStatus === "in_progress";

  const getTheme = () => {
    if (isReject) return { color: "text-red-600", bg: "bg-red-50", border: "border-red-100", icon: ShieldAlert, label: "Reject Issue" };
    if (isResolve) return { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", icon: CheckCircle2, label: "Mark as Resolved" };
    return { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", icon: PlayCircle, label: "Start Progress" };
  };

  const theme = getTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isReject) {
        await rejectCivilIssue(issue._id, note);
        toast.success("Civil issue rejected successfully.");
      } else {
        await updateCivilIssueStatus(issue._id, {
          status: targetStatus,
          note,
          resolutionSummary: isResolve ? resolutionSummary : undefined,
        });
        toast.success(`Civil issue status updated to ${targetStatus.replace("_", " ")}.`);
      }

      setNote("");
      setResolutionSummary("");
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("[CivilIssueStatusDialog] Transition failed:", err);
      toast.error(err.response?.data?.message || "Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${theme.bg}`}>
              <theme.icon className={`h-6 w-6 ${theme.color}`} />
            </div>
            <DialogTitle className="text-xl">{theme.label}</DialogTitle>
            <DialogDescription>
              {isReject && "Please provide a reason for rejecting this civil issue. The citizen will be notified."}
              {isResolve && "Summarize the actions taken to resolve this issue and any final notes."}
              {isProgress && "Confirm that you are beginning work on this civil issue."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="note" className="text-sm font-semibold">
                {isResolve ? "Final Note" : isReject ? "Rejection Reason" : "Internal Note (Optional)"}
              </Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={isReject ? "Briefly explain why this is being rejected..." : "Add any relevant context..."}
                required={isReject || isResolve}
                className="min-h-[100px] resize-none"
              />
            </div>

            {isResolve && (
              <div className="space-y-2">
                <Label htmlFor="summary" className="text-sm font-semibold">
                  Resolution Summary
                </Label>
                <Textarea
                  id="summary"
                  value={resolutionSummary}
                  onChange={(e) => setResolutionSummary(e.target.value)}
                  placeholder="Detail the steps taken to address this issue..."
                  required={isResolve}
                  className="min-h-[120px] resize-none"
                />
                <p className="text-[11px] text-muted-foreground animate-pulse">
                  This summary will be visible to the citizen.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={isReject ? "bg-red-600 hover:bg-red-700" : isResolve ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isReject ? "Reject Case" : isResolve ? "Complete Resolution" : "Confirm & Start"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
