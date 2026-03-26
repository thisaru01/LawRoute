import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { getMyConsultationRequests } from "@/api/services/consultationRequestService";
import PendingConsultationRequests from "@/lawyer/components/consultationRequests/PendingConsultationRequests";
import AcceptedConsultationRequests from "@/lawyer/components/consultationRequests/AcceptedConsultationRequests";
import RejectedConsultationRequests from "@/lawyer/components/consultationRequests/RejectedConsultationRequests";
import { Badge } from "@/components/ui/badge";

const allowedStatuses = new Set(["pending", "accepted", "rejected"]);

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

  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getMyConsultationRequests();
      const list = response?.data?.data;
      setRequests(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err);
      setRequests([]);
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
        const response = await getMyConsultationRequests();
        const list = response?.data?.data;
        if (!cancelled) {
          setRequests(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setRequests([]);
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

  const filteredRequests = useMemo(() => {
    return (Array.isArray(requests) ? requests : []).filter(
      (r) => (r?.status || "").toLowerCase() === safeStatus,
    );
  }, [requests, safeStatus]);

  const commonProps = {
    requests: filteredRequests,
    isLoading,
    error,
    onRetry: fetchRequests,
    onAction: fetchRequests,
  };

  const statusBadgeClassName = useMemo(() => {
    switch (safeStatus) {
      case "accepted":
        return "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300";
      case "rejected":
        return "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300";
      case "pending":
      default:
        return "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
    }
  }, [safeStatus]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Consultation Requests</h1>
      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        <span>Status:</span>
        <Badge className={statusBadgeClassName}>{label}</Badge>
      </div>

      {safeStatus === "pending" && (
        <PendingConsultationRequests {...commonProps} />
      )}
      {safeStatus === "accepted" && (
        <AcceptedConsultationRequests {...commonProps} />
      )}
      {safeStatus === "rejected" && (
        <RejectedConsultationRequests {...commonProps} />
      )}
    </div>
  );
}
