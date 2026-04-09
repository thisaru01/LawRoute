import { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { getAllCasesForAdmin } from "@/api/services/caseService";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/consultation-requests/PageHeader";
import CardGridSkeleton from "@/components/consultation-requests/CardGridSkeleton";
import EmptyState from "@/components/consultation-requests/EmptyState";
import { useFetchList } from "@/hooks/useFetchList";
import AdminCaseCard from "@/admin/components/cases/AdminCaseCard";

const allowedStatuses = new Set(["open", "closed"]);

const STATUS_BADGE = {
  open: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  closed: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
};

export default function AdminCases() {
  const { status } = useParams();
  const normalizedStatus = (status ?? "open").toLowerCase();

  const safeStatus = allowedStatuses.has(normalizedStatus)
    ? normalizedStatus
    : "open";

  const label = safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1);

  const [search, setSearch] = useState("");

  const fetcher = useCallback(
    () => getAllCasesForAdmin(safeStatus),
    [safeStatus],
  );
  const { data: cases, isLoading, error, refresh } = useFetchList(fetcher);

  const filteredCases = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return cases;

    return cases.filter((c) => {
      const citizenName = c?.user?.name || "";
      const citizenEmail = c?.user?.email || "";
      const lawyerName = c?.lawyer?.name || "";
      const lawyerEmail = c?.lawyer?.email || "";
      const summary = c?.consultationRequest?.summary || "";

      const haystack = [
        citizenName,
        citizenEmail,
        lawyerName,
        lawyerEmail,
        summary,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [cases, search]);

  const headerProps = {
    title: "Cases",
    badgeLabel: label,
    badgeClass: STATUS_BADGE[safeStatus] ?? STATUS_BADGE.open,
  };

  if (isLoading)
    return (
      <div className="space-y-4">
        <PageHeader {...headerProps} />
        <CardGridSkeleton count={4} />
      </div>
    );

  if (error)
    return (
      <div className="space-y-4">
        <PageHeader {...headerProps} />
        <Card>
          <CardHeader>
            <CardTitle>Couldn't load cases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-destructive">
              {error.message || "Request failed"}
            </p>
            <Button variant="outline" onClick={refresh}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );

  if (filteredCases.length === 0)
    return (
      <div className="space-y-4">
        <PageHeader {...headerProps} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Search by citizen, lawyer or summary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <EmptyState
          title={`No ${safeStatus} cases`}
          message="Cases will appear here once created."
        />
      </div>
    );

  return (
    <div className="space-y-4">
      <PageHeader {...headerProps} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by citizen, lawyer or summary"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {filteredCases.map((caseItem) => (
          <AdminCaseCard
            key={caseItem?._id}
            caseItem={caseItem}
            clickable={false}
          />
        ))}
      </div>
    </div>
  );
}
