import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getAssignedCivilIssues } from "@/api/services/civilIssueService";

const allowedStatuses = new Set(["pending", "in_progress", "resolved", "rejected"]);

export function useAuthorityCivilIssuesPage() {
  const { status } = useParams();
  const normalizedStatus = (status ?? "pending").toLowerCase();
  const safeStatus = allowedStatuses.has(normalizedStatus)
    ? normalizedStatus
    : "pending";

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openIssues, setOpenIssues] = useState({});
  const [districtFilter, setDistrictFilter] = useState("all");

  const fetchIssues = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getAssignedCivilIssues();
      setIssues(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch assigned civil issues", err);
      setError(err.message || "Failed to load assigned issues. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesStatus = issue.status === safeStatus;
      const matchesDistrict = districtFilter === "all" || issue.district === districtFilter;
      return matchesStatus && matchesDistrict;
    });
  }, [issues, safeStatus, districtFilter]);

  const label = safeStatus
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    error,
    fetchIssues,
    filteredIssues,
    rawIssues: issues,
    label,
    loading,
    openIssues,
    safeStatus,
    setOpenIssues,
    districtFilter,
    setDistrictFilter
  };
}