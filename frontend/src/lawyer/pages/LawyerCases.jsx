import { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getMyCases } from "@/api/services/caseService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFetchList } from "@/lawyer/hooks/useFetchList";
import PageHeader from "@/lawyer/components/shared/PageHeader";
import CardGridSkeleton from "@/lawyer/components/shared/CardGridSkeleton";
import EmptyState from "@/lawyer/components/shared/EmptyState";
import CaseCard from "@/lawyer/components/cases/CaseCard";

const allowedStatuses = new Set(["opened", "closed"]);

const STATUS_BADGE = {
  closed: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  opened: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
};

export default function LawyerCases() {
  const { status } = useParams();
  const navigate = useNavigate();

  const normalizedStatus = (status ?? "opened").toLowerCase();
  const safeStatus = allowedStatuses.has(normalizedStatus) ? normalizedStatus : "opened";
  const backendStatus = safeStatus === "opened" ? "open" : "closed";
  const label = safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1);

  const { data: cases, isLoading, error, refresh } = useFetchList(getMyCases);

  const filteredCases = useMemo(
    () => cases.filter((c) => (c?.status || "").toLowerCase() === backendStatus),
    [cases, backendStatus]
  );

  const handleOpenCase = useCallback((caseItem) => {
    const id = caseItem?._id;
    if (!id || backendStatus !== "open") return;
    navigate(`/lawyer/cases/opened/${id}`, {
      state: {
        caseId: id,
        citizenName: caseItem?.user?.name || "Citizen",
        citizenEmail: caseItem?.user?.email,
        createdAt: caseItem?.createdAt,
        summary: caseItem?.consultationRequest?.summary || "(No summary)",
        status: caseItem?.status,
      },
    });
  }, [backendStatus, navigate]);

  const headerProps = {
    title: "Cases",
    badgeLabel: label,
    badgeClass: STATUS_BADGE[safeStatus] ?? STATUS_BADGE.opened,
  };

  if (isLoading) return (
    <div className="space-y-4">
      <PageHeader {...headerProps} />
      <CardGridSkeleton count={4} />
    </div>
  );

  if (error) return (
    <div className="space-y-4">
      <PageHeader {...headerProps} />
      <Card>
        <CardHeader>
          <CardTitle>Couldn't load cases</CardTitle>
          <CardDescription className="text-destructive">
            {error.message || "Request failed"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={refresh}>Retry</Button>
        </CardContent>
      </Card>
    </div>
  );

  if (filteredCases.length === 0) return (
    <div className="space-y-4">
      <PageHeader {...headerProps} />
      <EmptyState
        title={`No ${backendStatus} cases`}
        message="Cases will appear here once assigned."
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <PageHeader {...headerProps} />
      <div className="grid gap-3 sm:grid-cols-2">
        {filteredCases.map((caseItem) => (
          <CaseCard
            key={caseItem?._id}
            caseItem={caseItem}
            clickable={backendStatus === "open"}
            onClick={() => handleOpenCase(caseItem)}
          />
        ))}
      </div>
    </div>
  );
}
