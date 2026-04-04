import { RefreshCw } from "lucide-react";
import { CIVIL_ISSUE_CATEGORIES } from "@/constants/civilIssueConstants.js";
import AuthorityCivilIssueCard from "@/authority/components/civil-issues/AuthorityCivilIssueCard.jsx";
import { useAuthorityCivilIssuesPage } from "@/authority/hooks/useAuthorityCivilIssuesPage.js";

const CATEGORY_LABELS = Object.fromEntries(
  CIVIL_ISSUE_CATEGORIES.map(({ value, label }) => [value, label]),
);

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
  } = useAuthorityCivilIssuesPage();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Civil Issues</h1>
          <p className="mt-2 text-sm text-muted-foreground">Status: {label}</p>
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
