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
const DEFAULT_DISTRICT = "All Districts";

const normalizeDistrictText = (value) =>
  (typeof value === "string" ? value.trim().toLowerCase().replace(/\s+/g, " ") : "");

const toCanonicalDistrict = (value) => {
  const normalized = normalizeDistrictText(value).replace(/\s+district$/, "").trim();

  if (!normalized) {
    return "";
  }

  const canonical = DISTRICTS.find((district) => normalizeDistrictText(district) === normalized);
  return canonical || "";
};

const isSpecificDistrict = (value) =>
  Boolean(value && normalizeDistrictText(value) !== normalizeDistrictText(DEFAULT_DISTRICT));

export function usePublicCivilIssuesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token } = useAuth();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDistrict, setFilterDistrict] = useState(DEFAULT_DISTRICT);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
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

      if (filterDistrict !== DEFAULT_DISTRICT) {
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

      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("action");
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams, token]);

  const filteredIssues = issues;

  const handleLocationQueryChange = (value) => {
    setLocationQuery(value);
    setLocationMessage("");

    if (!value.trim()) {
      setSelectedLocation("");
      setSelectedPostcode("");
    }
  };

  const handleLocationSelect = (suggestion) => {
    const isDistrictSuggestion = suggestion?.matchType === "district";
    const districtFromSuggestion =
      toCanonicalDistrict(suggestion?.district)
      || toCanonicalDistrict(suggestion?.locationName);
    const activeDistrict = isSpecificDistrict(filterDistrict)
      ? toCanonicalDistrict(filterDistrict)
      : "";

    const suggestionLabel =
      typeof suggestion?.locationName === "string" && suggestion.locationName.trim()
        ? suggestion.locationName.trim()
        : "The selected location";

    if (activeDistrict && districtFromSuggestion && districtFromSuggestion !== activeDistrict) {
      setLocationMessage(
        `${suggestionLabel} is not in ${activeDistrict} District. Please select a location within the chosen district or clear the district filter.`
      );
      setSelectedLocation("");
      setSelectedPostcode("");
      return;
    }

    setLocationQuery(suggestion.locationName);
    setLocationMessage("");

    if (isDistrictSuggestion && districtFromSuggestion) {
      setFilterDistrict(districtFromSuggestion);
      setSelectedLocation("");
      setSelectedPostcode("");
      return;
    }

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

  const handleDistrictChange = (districtValue) => {
    setFilterDistrict(districtValue);
    setLocationMessage("");
  };

  const loadNextPage = () => {
    if (loading || loadingMore || !hasNextPage) {
      return;
    }

    fetchIssues({ targetPage: page + 1, reset: false });
  };

  const handleCloseForm = () => {
    setShowForm(false);

    if (searchParams.get("action") === "submit") {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("action");
      setSearchParams(nextParams, { replace: true });
    }
  };
  const handleClearFilters = () => {
    setFilterCategory("all");
    setFilterDistrict(DEFAULT_DISTRICT);
    setLocationQuery("");
    setLocationMessage("");
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
    handleDistrictChange,
    handleClearFilters,
    handleCloseForm,
    handleStartSubmission,
    loadNextPage,
    loading,
    loadingMore,
    locationQuery,
    locationMessage,
    openIssues,
    page,
    setFilterCategory,
    setOpenIssues,
    showForm,
    totalPages,
  };
}
