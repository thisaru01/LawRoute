import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { getMyConsultationRequests } from "@/api/services/consultationRequestService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFetchList } from "@/hooks/useFetchList";
import PageHeader from "@/components/consultation-requests/PageHeader";
import CardGridSkeleton from "@/components/consultation-requests/CardGridSkeleton";
import EmptyState from "@/components/consultation-requests/EmptyState";
import CitizenConsultationRequestCard from "@/citizen/components/consultation-requests/CitizenConsultationRequestCard";

const allowedStatuses = new Set(["pending", "accepted", "rejected"]);

const STATUS_BADGE = {
  accepted: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  rejected: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  pending: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
};

export default function CitizenConsultationRequests() {
  const { status } = useParams();
  const normalizedStatus = (status ?? "pending").toLowerCase();
  const safeStatus = allowedStatuses.has(normalizedStatus) ? normalizedStatus : "pending";
  const label = safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1);

  const { data: requests, isLoading, error, refresh } = useFetchList(getMyConsultationRequests);

  const filteredRequests = useMemo(
    () => requests.filter((r) => (r?.status || "").toLowerCase() === safeStatus),
    [requests, safeStatus]
  );

  const headerProps = {
    title: "Consultation Requests",
    badgeLabel: label,
    badgeClass: STATUS_BADGE[safeStatus],
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
          <CardTitle>Couldn't load requests</CardTitle>
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

  if (filteredRequests.length === 0) return (
    <div className="space-y-4">
      <PageHeader {...headerProps} />
      <EmptyState
        title={`No ${safeStatus} requests`}
        message="Your requests will appear here."
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <PageHeader {...headerProps} />
      <div className="grid gap-3 sm:grid-cols-2">
        {filteredRequests.map((request) => (
          <CitizenConsultationRequestCard
            key={request?._id}
            request={request}
          />
        ))}
      </div>
    </div>
  );
}
