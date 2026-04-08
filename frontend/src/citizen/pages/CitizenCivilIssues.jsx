import { CheckCircle2, Clock3, LoaderCircle, RefreshCw } from "lucide-react";
import { CIVIL_ISSUE_CATEGORIES } from "@/constants/civilIssueConstants.js";
import { Badge } from "@/components/ui/badge";
import CitizenCivilIssueCard from "@/citizen/components/civil-issues/CitizenCivilIssueCard.jsx";
import { useCitizenCivilIssuesPage } from "@/citizen/hooks/useCitizenCivilIssuesPage.js";

const CATEGORY_LABELS = Object.fromEntries(
  CIVIL_ISSUE_CATEGORIES.map(({ value, label }) => [value, label]),
);

const STATUS_BADGE_STYLES = {
  Pending: {
    icon: Clock3,
    className: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50",
  },
  "In Progress": {
    icon: LoaderCircle,
    className: "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-50",
  },
  Resolved: {
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
  },
};

export default function CitizenCivilIssues() {
  const {
    error,
    fetchIssues,
    filteredIssues,
    label,
    loading,
    openIssues,
    setOpenIssues,
  } = useCitizenCivilIssuesPage();

  const statusBadge = STATUS_BADGE_STYLES[label] || STATUS_BADGE_STYLES.Pending;
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

        <button
          type="button"
          onClick={fetchIssues}
          className="inline-flex items-center gap-2 self-start rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading your civil issues...
        </div>
      ) : filteredIssues.length > 0 ? (
        <div className="space-y-4">
          {filteredIssues.map((issue) => {
            const isOpen = Boolean(openIssues[issue._id]);

            return (
              <CitizenCivilIssueCard
                key={issue._id}
                issue={issue}
                isOpen={isOpen}
                onToggle={(nextOpen) =>
                  setOpenIssues((prev) => ({ ...prev, [issue._id]: nextOpen }))
                }
                categoryLabels={CATEGORY_LABELS}
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
