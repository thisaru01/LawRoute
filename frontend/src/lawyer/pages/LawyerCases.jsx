import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getMyCases } from "@/api/services/caseService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import CaseCard from "@/lawyer/components/cases/CaseCard";

const allowedStatuses = new Set(["opened", "closed"]);

export default function LawyerCases() {
  const { status } = useParams();
  const navigate = useNavigate();

  const normalizedStatus = (status ?? "opened").toLowerCase();
  const safeStatus = allowedStatuses.has(normalizedStatus)
    ? normalizedStatus
    : "opened";

  // Backend uses "open" / "closed" while route uses "opened" / "closed"
  const backendStatus = safeStatus === "opened" ? "open" : "closed";

  const label =
    safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1).toLowerCase();

  const statusBadgeClass =
    backendStatus === "closed"
      ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
      : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300";

  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCases = () => {
    setIsLoading(true);
    setError(null);
    getMyCases()
      .then((response) => {
        const list = response?.data?.data;
        setCases(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        setError(err);
        setCases([]);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getMyCases()
      .then((response) => {
        if (cancelled) return;
        const list = response?.data?.data;
        setCases(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        setCases([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCases = useMemo(
    () =>
      (Array.isArray(cases) ? cases : []).filter(
        (c) => (c?.status || "").toLowerCase() === backendStatus
      ),
    [cases, backendStatus]
  );

  const handleOpenCase = (caseItem) => {
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
  };

  // Shared page header 
  const PageHeader = () => (
    <div className="flex items-center gap-3">
      <h1 className="text-2xl font-semibold">Cases</h1>
      <Badge className={statusBadgeClass}>{label}</Badge>
    </div>
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader />
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state 
  if (error) {
    return (
      <div className="space-y-4">
        <PageHeader />
        <Card className="mt-2">
          <CardHeader>
            <CardTitle>Couldn't load cases</CardTitle>
            <CardDescription className="text-destructive">
              {error.message || "Request failed"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={fetchCases}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state 
  if (filteredCases.length === 0) {
    return (
      <div className="space-y-4">
        <PageHeader />
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground mt-2">
          <p className="font-medium">No {backendStatus} cases</p>
          <p className="mt-1 text-xs">Cases will appear here once assigned.</p>
        </div>
      </div>
    );
  }

  // Cases grid
  return (
    <div className="space-y-4">
      <PageHeader />
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
