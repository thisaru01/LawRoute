import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAdminCivilIssues } from "../hooks/useAdminCivilIssues";
import AdminCivilIssueCard from "../components/civil-issues/AdminCivilIssueCard";
import AdminCivilIssueStats from "../components/civil-issues/AdminCivilIssueStats";
import DistrictFilter from "@/components/civil-issues/DistrictFilter";
import { Button } from "@/components/ui/button";
import { RefreshCcw, ShieldAlert } from "lucide-react";

const allowedStatuses = new Set(["pending", "in_progress", "resolved", "rejected"]);

export default function AdminCivilIssues() {
  const { status } = useParams();
  const normalizedStatus = (status ?? "pending").toLowerCase();
  const [refreshKey, setRefreshKey] = useState(0);

  const safeStatus = allowedStatuses.has(normalizedStatus)
    ? normalizedStatus
    : "pending";

  const { 
    issues, 
    loading, 
    error, 
    fetchIssues, 
    districtFilter, 
    setDistrictFilter 
  } = useAdminCivilIssues(safeStatus);

  const handleRefresh = () => {
    fetchIssues();
    setRefreshKey((prev) => prev + 1);
  };

  const label = safeStatus
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return (
    <div className="space-y-6">
      {/* Real-time Status Counters for "Other" Category */}
      <AdminCivilIssueStats refreshKey={refreshKey} />

      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Civil Issues</h1>
          <p className="mt-1 text-sm text-slate-500">
            Triage Queue &mdash; Status: <span className="font-medium text-indigo-600">{label}</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <DistrictFilter 
            value={districtFilter} 
            onValueChange={setDistrictFilter} 
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="h-9 gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      ) : loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 w-full animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : issues.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-20 text-center">
          <div className="rounded-full bg-slate-50 p-4">
            <ShieldAlert className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-slate-900">No {label.toLowerCase()} issues</h3>
          <p className="mt-1 text-sm text-slate-500">
            The triage queue for this category is currently empty.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <AdminCivilIssueCard key={issue._id} issue={issue} onRefresh={handleRefresh} />
          ))}
        </div>
      )}
    </div>
  );
}
