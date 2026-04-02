import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getMyCases } from "@/api/services/caseService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const allowedStatuses = new Set(["opened", "closed"]);

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

export default function LawyerCases() {
  const { status } = useParams();
  const navigate = useNavigate();
  const normalizedStatus = (status ?? "opened").toLowerCase();

  const safeStatus = allowedStatuses.has(normalizedStatus)
    ? normalizedStatus
    : "opened";

  const label =
    safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1).toLowerCase();

  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCases = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getMyCases();
      const list = response?.data?.data;
      setCases(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err);
      setCases([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getMyCases();
        const list = response?.data?.data;
        if (!cancelled) {
          setCases(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setCases([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  // Backend uses "open"/"closed" while route uses "opened"/"closed"
  const backendStatus = safeStatus === "opened" ? "open" : "closed";

  const filteredCases = useMemo(() => {
    return (Array.isArray(cases) ? cases : []).filter((c) => {
      const statusValue = (c?.status || "").toLowerCase();
      return statusValue === backendStatus;
    });
  }, [cases, backendStatus]);

  const handleOpenCase = (caseItem) => {
    const id = caseItem?._id;
    if (!id) return;
    if (backendStatus !== "open") return;
    const citizenName = caseItem?.user?.name || "Citizen";
    const citizenEmail = caseItem?.user?.email;
    const createdAt = caseItem?.createdAt;
    const summary = caseItem?.consultationRequest?.summary || "(No summary)";

    navigate(`/lawyer/cases/opened/${id}`, {
      state: {
        caseId: id,
        citizenName,
        citizenEmail,
        createdAt,
        summary,
        status: caseItem?.status,
      },
    });
  };

  const statusBadgeClassName = useMemo(() => {
    switch (backendStatus) {
      case "closed":
        return "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300";
      case "open":
      default:
        return "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
    }
  }, [backendStatus]);

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Cases</h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span>Status:</span>
          <Badge className={statusBadgeClassName}>{label}</Badge>
        </div>

        <div className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Cases</h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span>Status:</span>
          <Badge className={statusBadgeClassName}>{label}</Badge>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Couldn’t load cases</CardTitle>
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

  if (!Array.isArray(filteredCases) || filteredCases.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Cases</h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span>Status:</span>
          <Badge className={statusBadgeClassName}>{label}</Badge>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          No {backendStatus} cases.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Cases</h1>
      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        <span>Status:</span>
        <Badge className={statusBadgeClassName}>{label}</Badge>
      </div>

      <div className="mt-6 space-y-4">
        {filteredCases.map((caseItem) => {
          const citizenName = caseItem?.user?.name || "Citizen";
          const citizenEmail = caseItem?.user?.email;
          const createdAt = formatDateTime(caseItem?.createdAt);
          const caseStatus = (caseItem?.status || "open").toLowerCase();
          const statusLabel =
            caseStatus.charAt(0).toUpperCase() +
            caseStatus.slice(1).toLowerCase();

          const badgeClassName =
            caseStatus === "closed"
              ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
              : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300";

          const summary =
            caseItem?.consultationRequest?.summary || "(No summary)";

          return (
            <Card
              key={caseItem?._id || `${citizenName}-${createdAt}`}
              className={
                backendStatus === "open"
                  ? "cursor-pointer transition-colors hover:bg-muted/50"
                  : undefined
              }
              onClick={
                backendStatus === "open"
                  ? () => handleOpenCase(caseItem)
                  : undefined
              }
            >
              <CardHeader>
                <CardTitle>Case with {citizenName}</CardTitle>
                <CardDescription>
                  {createdAt ? `Opened: ${createdAt}` : ""}
                  {citizenEmail ? ` • ${citizenEmail}` : ""}
                </CardDescription>
                <CardAction>
                  <Badge className={badgeClassName}>{statusLabel}</Badge>
                </CardAction>
              </CardHeader>

              <CardContent>
                <p className="whitespace-pre-line text-sm">{summary}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
