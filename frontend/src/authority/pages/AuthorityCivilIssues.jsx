import { CheckCircle2, Clock3, LoaderCircle, RefreshCw, XCircle } from "lucide-react";
import { CIVIL_ISSUE_CATEGORIES } from "@/constants/civilIssueConstants.js";
import AuthorityCivilIssueCard from "@/authority/components/civil-issues/AuthorityCivilIssueCard.jsx";
import { useAuthorityCivilIssuesPage } from "@/authority/hooks/useAuthorityCivilIssuesPage.js";
import DistrictFilter from "@/components/civil-issues/DistrictFilter";
import { Badge } from "@/components/ui/badge";

const CATEGORY_LABELS = Object.fromEntries(
  CIVIL_ISSUE_CATEGORIES.map(({ value, label }) => [value, label]),
);

const STATUS_BADGE_STYLES = {
  pending: {
    icon: Clock3,
    className: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50",
  },
  in_progress: {
    icon: LoaderCircle,
    className: "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-50",
  },
  resolved: {
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
  },
  rejected: {
    icon: XCircle,
    className: "border-red-200 bg-red-50 text-red-700 hover:bg-red-50",
  },
};

export default function AuthorityCivilIssues() {
  const {
    error,
    fetchIssues,
    filteredIssues,
    label,
    loading,
    openIssues,
    safeStatus,
    setOpenIssues,
    districtFilter,
    setDistrictFilter
  } = useAuthorityCivilIssuesPage();

  const statusBadge = STATUS_BADGE_STYLES[safeStatus] || STATUS_BADGE_STYLES.pending;
  const StatusIcon = statusBadge.icon;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">Civil Issues</h1>
            <Badge
              variant="outline"
              className={`gap-2.5 px-4 py-1.5 text-base font-medium ${statusBadge.className}`}
            >
              <StatusIcon className="h-4.5 w-4.5" />
              {label}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <DistrictFilter 
            value={districtFilter} 
            onValueChange={setDistrictFilter} 
          />
          
          <button
            type="button"
            onClick={fetchIssues}
            className="inline-flex h-9 items-center gap-2 self-start rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading assigned civil issues...
        </div>
      ) : filteredIssues.length > 0 ? (
        <div className="space-y-4">
          {filteredIssues.map((issue) => {
            const isOpen = Boolean(openIssues[issue._id]);

            return (
              <AuthorityCivilIssueCard
                key={issue._id}
                issue={issue}
                isOpen={isOpen}
                onToggle={(nextOpen) =>
                  setOpenIssues((prev) => ({ ...prev, [issue._id]: nextOpen }))
                }
                categoryLabels={CATEGORY_LABELS}
                onRefresh={fetchIssues}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          No {label.toLowerCase()} issues found.
        </div>
      )}
    </div>
  );
}
