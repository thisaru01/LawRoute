import { useCallback, useEffect, useState } from "react";

import { getMyCases } from "@/api/services/caseService";
import { getMyConsultationRequests } from "@/api/services/consultationRequestService";
import { getMyCivilIssues } from "@/api/services/civilIssueService";

/**
 * Aggregates data for the citizen dashboard from three endpoints.
 * Returns stat counts, recent items, and loading/error state.
 */
export function useCitizenDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [consultationRequests, setConsultationRequests] = useState([]);
  const [cases, setCases] = useState([]);
  const [civilIssues, setCivilIssues] = useState([]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [crRes, casesRes, issuesRes] = await Promise.all([
        getMyConsultationRequests(),
        getMyCases(),
        getMyCivilIssues(),
      ]);

      const cr = crRes?.data?.data;
      const c = casesRes?.data?.data;
      const ci = issuesRes?.data?.data;

      setConsultationRequests(Array.isArray(cr) ? cr : []);
      setCases(Array.isArray(c) ? c : []);
      setCivilIssues(Array.isArray(ci) ? ci : []);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ---- Derived stats ----
  const countByStatus = (arr, status) =>
    arr.filter((item) => (item?.status || "").toLowerCase() === status).length;

  const stats = {
    consultations: {
      total: consultationRequests.length,
      pending: countByStatus(consultationRequests, "pending"),
      accepted: countByStatus(consultationRequests, "accepted"),
      rejected: countByStatus(consultationRequests, "rejected"),
    },
    cases: {
      total: cases.length,
      open: countByStatus(cases, "open"),
      closed: countByStatus(cases, "closed"),
    },
    civilIssues: {
      total: civilIssues.length,
      pending: countByStatus(civilIssues, "pending"),
      inProgress: countByStatus(civilIssues, "in_progress"),
      resolved: countByStatus(civilIssues, "resolved"),
    },
  };

  // Most recent items (sorted newest first, max 3 each)
  const sortByDate = (a, b) =>
    new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);

  const recentConsultations = [...consultationRequests]
    .sort(sortByDate)
    .slice(0, 3);
  const recentCases = [...cases].sort(sortByDate).slice(0, 3);
  const recentCivilIssues = [...civilIssues].sort(sortByDate).slice(0, 3);

  return {
    isLoading,
    error,
    stats,
    recentConsultations,
    recentCases,
    recentCivilIssues,
    refresh: load,
  };
}
