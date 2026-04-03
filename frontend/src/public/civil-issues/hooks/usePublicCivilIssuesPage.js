import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/auth/useAuth";
import { getPublicCivilIssues } from "@/api/services/civilIssueService";
import { CIVIL_ISSUE_CATEGORIES, CIVIL_ISSUE_DISTRICTS } from "@/constants/civilIssueConstants.js";

export const CATEGORY_LABELS = Object.fromEntries(
  CIVIL_ISSUE_CATEGORIES.map(({ value, label }) => [value, label])
);

export const DISTRICTS = CIVIL_ISSUE_DISTRICTS;

export function usePublicCivilIssuesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useAuth();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDistrict, setFilterDistrict] = useState("All Districts");
  const [openIssues, setOpenIssues] = useState({});
  const [showForm, setShowForm] = useState(false);

  const fetchIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPublicCivilIssues();
      setIssues(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch public issues", err);
      setError(err.message || "Failed to load issues. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  useEffect(() => {
    if (searchParams.get("action") === "submit" && token) {
      setShowForm(true);
    }
  }, [searchParams, token]);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchCategory = filterCategory === "all" || issue.category === filterCategory;
      const matchDistrict = filterDistrict === "All Districts" || issue.district === filterDistrict;
      return matchCategory && matchDistrict;
    });
  }, [issues, filterCategory, filterDistrict]);

  const handleStartSubmission = () => {
    if (!token) {
      navigate("/auth?redirect=/civil-issues?action=submit");
    } else {
      setShowForm(true);
    }
  };

  const handleCloseForm = () => setShowForm(false);
  const handleClearFilters = () => {
    setFilterCategory("all");
    setFilterDistrict("All Districts");
  };

  return {
    CATEGORY_LABELS,
    DISTRICTS,
    error,
    filteredIssues,
    fetchIssues,
    filterCategory,
    filterDistrict,
    handleClearFilters,
    handleCloseForm,
    handleStartSubmission,
    loading,
    openIssues,
    setFilterCategory,
    setFilterDistrict,
    setOpenIssues,
    showForm,
  };
}
