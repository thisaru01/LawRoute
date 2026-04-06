import LawyerApprovalCard from "@/admin/components/lawyers/LawyerApprovalCard";

export default function PendingLawyerApprovalList({
  lawyers,
  actingUserId,
  onApprove,
  onReject,
}) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      {lawyers.map((lawyer) => (
        <LawyerApprovalCard
          key={lawyer?.id || lawyer?.user?.id || lawyer?.user?.name || "lawyer-card"}
          lawyer={lawyer}
          actingUserId={actingUserId}
          onApprove={onApprove}
          onReject={onReject}
        />
      ))}
    </div>
  );
}
