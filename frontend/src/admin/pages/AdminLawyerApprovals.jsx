import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getAdminLawyerProfiles,
  updateAdminLawyerVerificationStatus,
} from "@/api/services/adminLawyerService";
import PendingLawyerApprovalList from "@/admin/components/lawyers/PendingLawyerApprovalList";

const STATUS = {
  all: "all",
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
};

export default function AdminLawyerApprovals() {
  const [lawyers, setLawyers] = useState([]);
  const [statusFilter, setStatusFilter] = useState(STATUS.pending);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actingUserId, setActingUserId] = useState("");

  const fetchLawyers = async (status = statusFilter) => {
    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (status !== STATUS.all) {
        params.verificationStatus = status;
        
        // Only show completed profiles for pending status as requested
        if (status === STATUS.pending) {
          params.profileCompleted = true;
        }
      }
      
      const res = await getAdminLawyerProfiles(params);
      setLawyers(res?.data?.lawyerProfiles || []);
    } catch (err) {
      setError(err?.message || "Failed to load lawyer profiles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLawyers();
  }, [statusFilter]);

  const handleVerificationUpdate = async (userId, newStatus) => {
    if (!userId) return;

    setActionError(null);
    setActingUserId(userId);

    try {
      await updateAdminLawyerVerificationStatus(userId, newStatus);
      
      // If we are filtering by a specific status (that is NOT "all"), 
      // remove the lawyer from the current view.
      if (statusFilter !== STATUS.all) {
        setLawyers((prev) => 
          prev.filter((item) => String(item?.user?.id) !== String(userId))
        );
      } else {
        // If we are in "All" view, just update the status in-place.
        setLawyers((prev) => 
          prev.map((item) => 
            String(item?.user?.id) === String(userId) 
              ? { ...item, verificationStatus: newStatus } 
              : item
          )
        );
      }
    } catch (err) {
      setActionError(err?.message || "Failed to update verification status");
    } finally {
      setActingUserId("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Lawyer Verifications</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review and manage verification status for lawyer profiles.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => fetchLawyers()}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      <Tabs
        value={statusFilter}
        onValueChange={setStatusFilter}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value={STATUS.pending}>Pending</TabsTrigger>
          <TabsTrigger value={STATUS.approved}>Approved</TabsTrigger>
          <TabsTrigger value={STATUS.rejected}>Rejected</TabsTrigger>
          <TabsTrigger value={STATUS.all}>All</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {actionError && <p className="text-sm text-destructive">{actionError}</p>}

      {!loading && !error && lawyers.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          No {statusFilter !== STATUS.all ? statusFilter : ""} lawyer profiles found.
        </p>
      )}

      <PendingLawyerApprovalList
        lawyers={lawyers}
        actingUserId={actingUserId}
        onApprove={(userId) => handleVerificationUpdate(userId, STATUS.approved)}
        onReject={(userId) => handleVerificationUpdate(userId, STATUS.rejected)}
      />
    </div>
  );
}
