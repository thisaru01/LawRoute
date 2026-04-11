const HIPOLABS_UNIVERSITY_API = "https://universities.hipolabs.com/search";

const COMMON_UNIVERSITIES = [
  "University of Colombo",
  "University of Peradeniya",
  "University of Moratuwa",
  "University of Kelaniya",
  "University of Sri Jayewardenepura",
  "SLIIT (Sri Lanka Institute of Information Technology)",
  "IIT (Informatics Institute of Technology)",
  "NSBM Green University",
  "General Sir John Kotelawala Defence University (KDU)",
  "Open University of Sri Lanka",
  "Harvard University",
  "University of Oxford",
  "University of Cambridge",
  "Stanford University",
  "Yale Law School",
  "London School of Economics (LSE)",
];

const normalizeText = (value) =>
  (typeof value === "string" ? value.trim().toLowerCase().replace(/\s+/g, " ") : "");

const getLocalUniversityMatches = (query, limit) => {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return COMMON_UNIVERSITIES.slice(0, limit);
  }

  return COMMON_UNIVERSITIES.filter((university) =>
    normalizeText(university).includes(normalizedQuery),
  ).slice(0, limit);
};

const fetchRemoteUniversities = async ({ query, limit, signal }) => {
  const params = new URLSearchParams({ name: query });
  const response = await fetch(`${HIPOLABS_UNIVERSITY_API}?${params.toString()}`, {
    method: "GET",
    signal,
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const error = new Error("Failed to fetch university suggestions.");
    error.statusCode = response.status;
    throw error;
  }

  const data = await response.json();
  const remoteUniversities = Array.isArray(data)
    ? data.map((item) => item?.name).filter((name) => typeof name === "string" && name.trim())
    : [];

  return remoteUniversities.slice(0, limit);
};

export async function autocompleteUniversities({ text, limit = 8 }) {
  const query = typeof text === "string" ? text.trim() : "";
  const safeLimit = Math.min(Math.max(Number(limit) || 8, 1), 12);
  const localMatches = getLocalUniversityMatches(query, Math.max(5, safeLimit));

  if (query.length < 3) {
    return { data: localMatches.slice(0, safeLimit), meta: { source: "local" } };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const remoteMatches = await fetchRemoteUniversities({
      query,
      limit: safeLimit,
      signal: controller.signal,
    });

    const merged = Array.from(new Set([...localMatches, ...remoteMatches]));

    return {
      data: merged.slice(0, safeLimit),
      meta: { source: "hipolabs" },
    };
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error("University lookup timed out. Please try again.");
      timeoutError.statusCode = 504;
      throw timeoutError;
    }

    return {
      data: localMatches.slice(0, safeLimit),
      meta: { source: "local" },
    };
  } finally {
    clearTimeout(timeout);
  }
}