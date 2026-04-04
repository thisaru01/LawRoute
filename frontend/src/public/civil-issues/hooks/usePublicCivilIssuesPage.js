import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/auth/useAuth";
import { getPublicCivilIssues } from "@/api/services/civilIssueService";
import { CIVIL_ISSUE_CATEGORIES, CIVIL_ISSUE_DISTRICTS } from "@/constants/civilIssueConstants.js";

export const CATEGORY_LABELS = Object.fromEntries(
  CIVIL_ISSUE_CATEGORIES.map(({ value, label }) => [value, label])
);

export const DISTRICTS = CIVIL_ISSUE_DISTRICTS;
const PAGE_LIMIT = 10;

export function usePublicCivilIssuesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useAuth();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDistrict, setFilterDistrict] = useState("All Districts");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedPostcode, setSelectedPostcode] = useState("");
  const [openIssues, setOpenIssues] = useState({});
  const [showForm, setShowForm] = useState(false);

  const fetchIssues = async ({ targetPage = 1, reset = true } = {}) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    setError(null);

    try {
      const params = {};

      if (filterCategory !== "all") {
        params.category = filterCategory;
      }

      if (filterDistrict !== "All Districts") {
        params.district = filterDistrict;
      }

      if (selectedLocation) {
        params.location = selectedLocation;
      }

      if (selectedPostcode) {
        params.postcode = selectedPostcode;
      }

      params.page = targetPage;
      params.limit = PAGE_LIMIT;

      const res = await getPublicCivilIssues(params);
      const incoming = Array.isArray(res?.data?.data) ? res.data.data : [];
      const pagination = res?.data?.pagination || {};

      setIssues((prev) => (reset ? incoming : [...prev, ...incoming]));
      setPage(Number(pagination.page) || targetPage);
      setHasNextPage(Boolean(pagination.hasNextPage));
      setTotalPages(Number(pagination.totalPages) || 0);
    } catch (err) {
      console.error("Failed to fetch public issues", err);
      setError(err.message || "Failed to load issues. Please try again.");
    } finally {
      if (reset) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    fetchIssues({ targetPage: 1, reset: true });
  }, [filterCategory, filterDistrict, selectedLocation, selectedPostcode]);

  useEffect(() => {
    if (searchParams.get("action") === "submit" && token) {
      setShowForm(true);
    }
  }, [searchParams, token]);

  const filteredIssues = issues;

  const handleLocationQueryChange = (value) => {
    setLocationQuery(value);

    if (!value.trim()) {
      setSelectedLocation("");
      setSelectedPostcode("");
    }
  };

  const handleLocationSelect = (suggestion) => {
    setLocationQuery(suggestion.locationName);
    setSelectedLocation(suggestion.locationName || "");
    setSelectedPostcode(suggestion.postcode || "");
  };

  const handleStartSubmission = () => {
    if (!token) {
      navigate("/auth?redirect=/civil-issues?action=submit");
    } else {
      setShowForm(true);
    }
  };

  const loadNextPage = () => {
    if (loading || loadingMore || !hasNextPage) {
      return;
    }

    fetchIssues({ targetPage: page + 1, reset: false });
  };

  const handleCloseForm = () => setShowForm(false);
  const handleClearFilters = () => {
    setFilterCategory("all");
    setFilterDistrict("All Districts");
    setLocationQuery("");
    setSelectedLocation("");
    setSelectedPostcode("");
  };

  return {
    CATEGORY_LABELS,
    DISTRICTS,
    error,
    filteredIssues,
    fetchIssues: () => fetchIssues({ targetPage: 1, reset: true }),
    filterCategory,
    filterDistrict,
    hasNextPage,
    handleLocationQueryChange,
    handleLocationSelect,
    handleClearFilters,
    handleCloseForm,
    handleStartSubmission,
    loadNextPage,
    loading,
    loadingMore,
    locationQuery,
    openIssues,
    page,
    setFilterCategory,
    setFilterDistrict,
    setOpenIssues,
    showForm,
    totalPages,
  };
}
