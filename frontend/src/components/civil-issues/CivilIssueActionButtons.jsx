import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle, CheckCircle2, XCircle } from "lucide-react";
import CivilIssueStatusDialog from "./CivilIssueStatusDialog";

/**
 * Dynamic action buttons component that responds to the issue status.
 * Responsibility: Handles button visibility logic and triggers the status dialog.
 */
export default function CivilIssueActionButtons({ issue, onRefresh }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState(null);

  const status = issue.status?.toLowerCase();

  const handleAction = (status) => {
    setTargetStatus(status);
    setDialogOpen(true);
  };

  const isPending = status === "pending";
  const isInProgress = status === "in_progress";

  if (!isPending && !isInProgress) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {/* Start Progress - Visible for Pending issues */}
      {isPending && (
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
          onClick={() => handleAction("in_progress")}
        >
          <PlayCircle className="h-4 w-4" />
          Start Progress
        </Button>
      )}

      {/* Resolve - Visible for In Progress issues */}
      {isInProgress && (
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
          onClick={() => handleAction("resolved")}
        >
          <CheckCircle2 className="h-4 w-4" />
          Mark as Resolved
        </Button>
      )}

      {/* Reject - Visible for both Pending and In Progress issues */}
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={() => handleAction("rejected")}
      >
        <XCircle className="h-4 w-4" />
        Reject Issue
      </Button>

      {/* Reusable Dialog Orchestration */}
      {targetStatus && (
        <CivilIssueStatusDialog
          issue={issue}
          targetStatus={targetStatus}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}
