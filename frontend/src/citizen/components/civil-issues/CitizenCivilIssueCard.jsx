import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/consultation-requests/ConfirmDialog.jsx";
import IssueCard from "@/public/civil-issues/components/IssueCard.jsx";

export default function CitizenCivilIssueCard({ issue, onDelete, deleting = false, ...props }) {
  const navigate = useNavigate();
  const canManage = issue?.status === "pending";

  const footerContent = canManage ? (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        onClick={() => navigate(`/citizen/civil-issues/edit/${issue._id}`)}
      >
        <Pencil className="h-4 w-4" />
        Update
      </Button>

      <ConfirmDialog
        trigger={
          <Button type="button" variant="destructive" className="gap-2" disabled={deleting}>
            <Trash2 className="h-4 w-4" />
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        }
        title="Delete this civil issue?"
        description="This will permanently remove the pending issue from your submissions."
        confirmLabel={deleting ? "Deleting..." : "Delete issue"}
        confirmClass="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        onConfirm={() => onDelete?.(issue)}
      />
    </div>
  ) : null;

  return (
    <IssueCard
      {...props}
      issue={issue}
      showContactNumber
      reporterLabel=""
      footerContent={footerContent}
    />
  );
}
