import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, LoaderCircle, RefreshCw, Trash2, XCircle } from "lucide-react";
import { CIVIL_ISSUE_CATEGORIES } from "@/constants/civilIssueConstants.js";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CitizenCivilIssueCard from "@/citizen/components/civil-issues/CitizenCivilIssueCard.jsx";
import { useCitizenCivilIssuesPage } from "@/citizen/hooks/useCitizenCivilIssuesPage.js";
import { deleteCivilIssue } from "@/api/services/civilIssueService";
import { toast } from "sonner";

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

export default function CitizenCivilIssues() {
  const [deletingIssueId, setDeletingIssueId] = useState("");
  const [actionError, setActionError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const {
    error,
    fetchIssues,
    filteredIssues,
    label,
    loading,
    openIssues,
    safeStatus,
    setOpenIssues,
  } = useCitizenCivilIssuesPage();

  const finalIssues = useMemo(() => {
    if (selectedCategory === "all") return filteredIssues;
    return filteredIssues.filter((issue) => issue.category === selectedCategory);
  }, [filteredIssues, selectedCategory]);

  const statusBadge = STATUS_BADGE_STYLES[safeStatus] || STATUS_BADGE_STYLES.pending;
  const StatusIcon = statusBadge.icon;

  const handleDeleteIssue = async (issue) => {
    if (!issue?._id) {
      return;
    }

    setActionError("");
    setDeletingIssueId(issue._id);

    try {
      await deleteCivilIssue(issue._id);
      toast("Civil issue deleted successfully.", {
        icon: <Trash2 className="h-4 w-4 relative top-0.5" />,
        className: "!bg-slate-800 !text-slate-50 !border-slate-700 [&_svg]:!text-slate-50",
      });
      await fetchIssues();
    } catch (err) {
      const msg = err?.message || "Failed to delete this issue. Please try again.";
      toast.error(msg);
      setActionError(msg);
    } finally {
      setDeletingIssueId("");
    }
  };

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

        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px] bg-white sm:w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CIVIL_ISSUE_CATEGORIES.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            type="button"
            onClick={fetchIssues}
            className="inline-flex h-10 items-center gap-2 self-start rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {actionError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {actionError}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading your civil issues...
        </div>
      ) : finalIssues.length > 0 ? (
        <div className="space-y-4">
          {finalIssues.map((issue) => {
            const isOpen = Boolean(openIssues[issue._id]);

            return (
              <CitizenCivilIssueCard
                key={issue._id}
                issue={issue}
                isOpen={isOpen}
                onToggle={(nextOpen) =>
                  setOpenIssues((prev) => ({ ...prev, [issue._id]: nextOpen }))
                }
                onDelete={handleDeleteIssue}
                deleting={deletingIssueId === issue._id}
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
