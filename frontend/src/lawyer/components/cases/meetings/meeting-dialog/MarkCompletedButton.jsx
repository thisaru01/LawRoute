import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateCaseMeeting } from "@/api/services/caseService";
import ConfirmDialog from "@/components/consultation-requests/ConfirmDialog";

// Small confirm dialog wrapper for marking a meeting as completed
function MarkCompletedButton({ canMarkCompleted, meetingId, onAfterUpdate }) {
  if (!canMarkCompleted) return null;

  return (
    <ConfirmDialog
      trigger={
        <Button variant="secondary" className="mr-2">
          Mark as completed
        </Button>
      }
      title="Mark meeting as completed?"
      description={
        "This will mark the meeting as completed. You can still add notes afterwards."
      }
      confirmLabel="Yes, mark completed"
      confirmClass="bg-secondary text-secondary-foreground hover:bg-secondary/90"
      onConfirm={async () => {
        try {
          await updateCaseMeeting(meetingId, { status: "completed" });
          toast.success("Meeting marked as completed");
          onAfterUpdate?.();
          window.dispatchEvent(new CustomEvent("meetings:refresh"));
        } catch (err) {
          toast.error(
            err.response?.data?.message ||
              err.message ||
              "Failed to update meeting",
          );
        }
      }}
    />
  );
}

export default MarkCompletedButton;
