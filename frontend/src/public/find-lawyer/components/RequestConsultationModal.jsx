import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { createConsultationRequest } from "@/api/services/consultationRequestService";

export default function RequestConsultationModal({
  isOpen,
  onClose,
  lawyerId,
  lawyerName,
}) {
  const [summary, setSummary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!summary.trim()) {
      setError("Please provide a summary of your legal issue.");
      return;
    }

    if (summary.length > 2000) {
      setError("Summary must not exceed 2000 characters.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await createConsultationRequest({
        lawyerId,
        summary: summary.trim(),
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to submit request."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (open) => {
    // React strict mode / dialog event can pass boolean
    if (open === false || typeof open === "undefined" || open?.type) {
      // Reset state on close with timeout to prevent visual flash
      onClose();
      setTimeout(() => {
        setSummary("");
        setError("");
        setSuccess(false);
      }, 300);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {!success ? (
          <>
            <DialogHeader>
              <DialogTitle>Request a Consultation</DialogTitle>
              <DialogDescription>
                Briefly describe your legal issue to {lawyerName}. They will review your request and get back to you.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="summary">Case Summary</Label>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="E.g., I have a contract dispute with a vendor..."
                  className="min-h-[150px] resize-y"
                  disabled={isSubmitting}
                />
                <div className="flex justify-end">
                  <span className={`text-xs ${summary.length > 2000 ? "text-destructive" : "text-muted-foreground"}`}>
                    {summary.length} / 2000
                  </span>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !summary.trim() || summary.length > 2000}>
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center space-y-4 py-6 text-center">
              <div className="rounded-full bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <DialogTitle className="text-xl">Request Submitted</DialogTitle>
              <DialogDescription className="text-center text-base">
                Your consultation request has been sent to {lawyerName}. You can track its status in your dashboard.
              </DialogDescription>
            </div>
            <DialogFooter className="sm:justify-center">
              <Button onClick={handleClose} className="w-full sm:w-auto">
                Got it
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
