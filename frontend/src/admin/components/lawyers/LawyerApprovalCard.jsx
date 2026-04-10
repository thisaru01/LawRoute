import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";

const STATUS = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
};

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusBadgeClasses(status) {
  if (status === STATUS.approved) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === STATUS.rejected) {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }

  return "bg-amber-50 text-amber-700 border-amber-200";
}

const ChecklistItem = ({ label, isCompleted }) => (
  <div className="flex items-center gap-2 text-sm">
    {isCompleted ? (
      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    ) : (
      <XCircle className="h-4 w-4 text-rose-500" />
    )}
    <span className={isCompleted ? "text-muted-foreground" : "font-medium text-rose-600"}>
      {label}
    </span>
  </div>
);

export default function LawyerApprovalCard({
  lawyer,
  actingUserId,
  onApprove,
  onReject,
}) {
  const userId = lawyer?.user?.id;
  const name = lawyer?.user?.name || "Unnamed lawyer";
  const email = lawyer?.user?.email || "No email";
  const status = String(lawyer?.verificationStatus || STATUS.pending).toLowerCase();
  const isBusy = actingUserId && String(actingUserId) === String(userId);

  // Requirement Data Calculation
  const basic = lawyer?.basicInfo || {};
  const edu = lawyer?.educationQualifications || {};
  
  const checklist = [
    { label: "Full Name", isCompleted: !!lawyer?.user?.name },
    { label: "Professional Title", isCompleted: !!basic.professionalTitle },
    { 
      label: "Contact Info", 
      isCompleted: basic.contactInfo && typeof basic.contactInfo === "object" && Object.keys(basic.contactInfo).length > 0 
    },
    { 
      label: "Practice Areas", 
      isCompleted: Array.isArray(basic.practiceAreas) && basic.practiceAreas.length > 0 
    },
    { 
      label: "Specific Expertise", 
      isCompleted: !!lawyer?.expertise && lawyer?.expertise !== "general" 
    },
    { 
      label: "Education", 
      isCompleted: Array.isArray(edu.education) && edu.education.length > 0 
    },
    { 
      label: "Memberships", 
      isCompleted: Array.isArray(lawyer?.memberships) && lawyer?.memberships.length > 0 
    },
    { label: "Bar Registration", isCompleted: !!lawyer?.barRegistrationNumber },
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{name}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{email}</p>
          </div>

          <Badge variant="outline" className={getStatusBadgeClasses(status)}>
            {status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Core Info */}
        <div className="grid grid-cols-2 gap-2 border-b pb-4 text-xs text-muted-foreground">
          <div>
            <span className="font-semibold text-foreground">Submitted: </span>
            {formatDate(lawyer?.createdAt)}
          </div>
          <div>
            <span className="font-semibold text-foreground">Overall Completed: </span>
            <span className={lawyer?.profileCompleted ? "text-emerald-600" : "text-rose-600"}>
              {lawyer?.profileCompleted ? "Yes" : "No"}
            </span>
          </div>
        </div>

        {/* Requirements Checklist */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Verification Checklist
          </h4>
          <div className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
            {checklist.map((item) => (
              <ChecklistItem key={item.label} {...item} />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            type="button"
            className="flex-1 sm:flex-none"
            onClick={() => onApprove?.(userId)}
            disabled={!userId || Boolean(isBusy) || status === STATUS.approved}
          >
            {isBusy ? "Updating..." : "Approve"}
          </Button>

          <Button
            type="button"
            variant="destructive"
            className="flex-1 sm:flex-none"
            onClick={() => onReject?.(userId)}
            disabled={!userId || Boolean(isBusy) || status === STATUS.rejected}
          >
            {isBusy ? "Updating..." : "Reject"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
