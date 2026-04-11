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

const validateNoteQuality = (value, { required = false } = {}) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return required ? "This note is required." : "";
  }

  // Blocks long repeated character sequences such as "aaaaaa" or "111111".
  if (/(.)\1{5,}/i.test(trimmed)) {
    return "Please enter a normal note without repeated characters.";
  }

  // Blocks repeated words like "test test test test".
  if (/\b([a-z0-9]+)(?:\s+\1){3,}\b/i.test(trimmed)) {
    return "Please provide a meaningful note instead of repeating words.";
  }

  const alphaNumChars = (trimmed.match(/[a-z0-9]/gi) || []).map((ch) =>
    ch.toLowerCase(),
  );
  if (alphaNumChars.length >= 10) {
    const uniqueCount = new Set(alphaNumChars).size;
    const uniqueRatio = uniqueCount / alphaNumChars.length;

    if (uniqueRatio < 0.2) {
      return "Please provide a more realistic note.";
    }
  }

  return "";
};

/**
 * A specialized dialog that adapts to different civil issue status transitions.
 * 
 */
export default function CivilIssueStatusDialog({ issue, targetStatus, open, onOpenChange, onSuccess }) {
  const [note, setNote] = useState("");
  const [resolutionSummary, setResolutionSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [noteError, setNoteError] = useState("");

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

    const noteValidationMessage = validateNoteQuality(note, {
      required: isReject || isResolve,
    });
    if (noteValidationMessage) {
      setNoteError(noteValidationMessage);
      toast.error(noteValidationMessage);
      return;
    }

    setNoteError("");
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
      setNoteError("");
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
                onChange={(e) => {
                  const nextNote = e.target.value;
                  setNote(nextNote);

                  if (noteError) {
                    setNoteError(
                      validateNoteQuality(nextNote, {
                        required: isReject || isResolve,
                      }),
                    );
                  }
                }}
                placeholder={isReject ? "Briefly explain why this is being rejected..." : "Add any relevant context..."}
                required={isReject || isResolve}
                aria-invalid={noteError ? "true" : "false"}
                className="min-h-[100px] resize-none"
              />
              {noteError && (
                <p className="text-xs text-destructive">{noteError}</p>
              )}
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
