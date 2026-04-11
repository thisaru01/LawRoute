import { useState, useEffect, useCallback, useMemo } from "react";
import { getAdminCivilIssues } from "@/api/services/civilIssueService";

/**
 * Custom hook to handle administrative civil issue fetching and state management.
 * Follows the Single Responsibility Principle by isolating data logic from the UI.
 */
export function useAdminCivilIssues(status) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [districtFilter, setDistrictFilter] = useState("all");

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminCivilIssues(status);
      setIssues(res.data?.data || []);
    } catch (err) {
      console.error("[useAdminCivilIssues] Failed to fetch issues:", err);
      setError(err.response?.data?.message || "Failed to load civil issues. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // Client-side filtering by district
  const filteredIssues = useMemo(() => {
    if (districtFilter === "all") return issues;
    return issues.filter((issue) => issue.district === districtFilter);
  }, [issues, districtFilter]);

  return { 
    issues: filteredIssues, 
    rawIssues: issues, // For badge counts if needed
    loading, 
    error, 
    fetchIssues,
    districtFilter,
    setDistrictFilter
  };
}
