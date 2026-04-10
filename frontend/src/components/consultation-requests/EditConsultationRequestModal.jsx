import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateConsultationRequest } from "@/api/services/consultationRequestService";

export default function EditConsultationRequestModal({
  request,
  open,
  onOpenChange,
  onSaved,
}) {
  const [summary, setSummary] = useState(request?.summary || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSummary(request?.summary || "");
    setError("");
  }, [request, open]);

  const handleClose = (v) => {
    if (v === false || typeof v === "undefined" || v?.type) {
      onOpenChange(false);
    }
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    if (!summary || !summary.trim()) {
      setError("Please provide a summary.");
      return;
    }
    if (summary.length > 2000) {
      setError("Summary must not exceed 2000 characters.");
      return;
    }

    setError("");
    setIsSaving(true);
    try {
      await updateConsultationRequest(request._id, { summary: summary.trim() });
      toast.success("Request updated");
      onSaved?.();
      handleClose(false);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to update request",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-140">
        <DialogHeader>
          <DialogTitle>Edit Consultation Request</DialogTitle>
          <DialogDescription>Update your request summary.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="summary">Case Summary</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="min-h-37.5 resize-y"
              disabled={isSaving}
            />
            <div className="flex justify-end">
              <span
                className={`text-xs ${summary.length > 2000 ? "text-destructive" : "text-muted-foreground"}`}
              >
                {summary.length} / 2000
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !summary.trim() || summary.length > 2000}
            >
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
