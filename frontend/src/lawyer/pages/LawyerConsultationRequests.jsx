import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { getMyConsultationRequests } from "@/api/services/consultationRequestService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ConsultationRequestCard from "@/lawyer/components/consultationRequests/ConsultationRequestCard";

const allowedStatuses = new Set(["pending", "accepted", "rejected"]);

const STATUS_BADGE = {
  accepted: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  rejected: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  pending: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
};

export default function LawyerConsultationRequests() {
  const { status } = useParams();
  const normalizedStatus = (status ?? "pending").toLowerCase();
  const safeStatus = allowedStatuses.has(normalizedStatus)
    ? normalizedStatus
    : "pending";

  const label =
    safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1).toLowerCase();

  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = () => {
    setIsLoading(true);
    setError(null);
    getMyConsultationRequests()
      .then((response) => {
        const list = response?.data?.data;
        setRequests(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        setError(err);
        setRequests([]);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getMyConsultationRequests()
      .then((response) => {
        if (cancelled) return;
        const list = response?.data?.data;
        setRequests(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        setRequests([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRequests = useMemo(
    () =>
      (Array.isArray(requests) ? requests : []).filter(
        (r) => (r?.status || "").toLowerCase() === safeStatus
      ),
    [requests, safeStatus]
  );

  const PageHeader = () => (
    <div className="flex items-center gap-3">
      <h1 className="text-2xl font-semibold">Consultation Requests</h1>
      <Badge className={STATUS_BADGE[safeStatus]}>{label}</Badge>
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
            <CardTitle>Couldn't load requests</CardTitle>
            <CardDescription className="text-destructive">
              {error.message || "Request failed"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={fetchRequests}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (filteredRequests.length === 0) {
    return (
      <div className="space-y-4">
        <PageHeader />
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground mt-2">
          <p className="font-medium">No {safeStatus} requests</p>
          <p className="mt-1 text-xs">
            Requests will appear here once received.
          </p>
        </div>
      </div>
    );
  }

  // Requests grid
  return (
    <div className="space-y-4">
      <PageHeader />
      <div className="grid gap-3 sm:grid-cols-2">
        {filteredRequests.map((request) => (
          <ConsultationRequestCard
            key={request?._id}
            request={request}
            showActions={safeStatus === "pending"}
            onAction={fetchRequests}
          />
        ))}
      </div>
    </div>
  );
}
