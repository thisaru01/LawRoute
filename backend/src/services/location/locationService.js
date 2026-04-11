import { SRI_LANKA_DISTRICTS } from "../../constants/locationConstants.js";

const GEOAPIFY_BASE_URL = "https://api.geoapify.com/v1/geocode/autocomplete";

const DISTRICT_FETCH_LIMIT = 15;

const normalizeText = (value) =>
  (typeof value === "string" ? value.trim().toLowerCase().replace(/\s+/g, " ") : "");

const isDistrictMatch = (districtValue, districtTarget) => {
  const district = normalizeText(districtValue);
  const target = normalizeText(districtTarget);

  if (!district || !target) {
    return false;
  }

  return district === target || district.includes(target) || target.includes(district);
};

const detectDistrictIntent = (text) => {
  const query = normalizeText(text);

  if (!query) {
    return null;
  }

  const scored = SRI_LANKA_DISTRICTS.map((district) => {
    const normalizedDistrict = normalizeText(district);

    if (normalizedDistrict === query) {
      return { district, score: 3 };
    }

    if (normalizedDistrict.startsWith(query) || query.startsWith(normalizedDistrict)) {
      return { district, score: 2 };
    }

    if (normalizedDistrict.includes(query)) {
      return { district, score: 1 };
    }

    return { district, score: 0 };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.district.localeCompare(b.district));

  return scored.length > 0 ? scored[0].district : null;
};

const pickLocationName = (properties = {}) => {
  return (
    properties.city
    || properties.town
    || properties.village
    || properties.county
    || properties.state_district
    || properties.state
    || properties.formatted
    || ""
  );
};

const normalizeSuggestion = (feature = {}) => {
  const properties = feature.properties || {};
  return {
    formatted: properties.formatted || "",
    locationName: pickLocationName(properties),
    district: properties.county || properties.state_district || properties.state || "",
    postcode: properties.postcode || "",
  };
};

const classifyMatchType = ({ suggestion, query, matchedDistrict }) => {
  if (matchedDistrict && isDistrictMatch(suggestion?.district, matchedDistrict)) {
    return "district";
  }

  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return "location";
  }

  const postcode = normalizeText(suggestion?.postcode);
  if (postcode && postcode.includes(normalizedQuery)) {
    return "postcode";
  }

  return "location";
};

const scoreSuggestion = ({ suggestion, query, matchedDistrict }) => {
  const normalizedQuery = normalizeText(query);
  const locationName = normalizeText(suggestion?.locationName);
  const district = normalizeText(suggestion?.district);
  const postcode = normalizeText(suggestion?.postcode);
  const formatted = normalizeText(suggestion?.formatted);

  if (matchedDistrict && isDistrictMatch(district, matchedDistrict)) {
    return 100;
  }

  if (!normalizedQuery) {
    return 0;
  }

  if (postcode && postcode.startsWith(normalizedQuery)) {
    return 90;
  }

  if (locationName && locationName.startsWith(normalizedQuery)) {
    return 80;
  }

  if (district && district.startsWith(normalizedQuery)) {
    return 70;
  }

  if (locationName && locationName.includes(normalizedQuery)) {
    return 60;
  }

  if (district && district.includes(normalizedQuery)) {
    return 50;
  }

  if (formatted && formatted.includes(normalizedQuery)) {
    return 40;
  }

  return 0;
};

const fetchGeoapifySuggestions = async ({ text, limit, apiKey, signal }) => {
  const params = new URLSearchParams({
    text,
    filter: "countrycode:lk",
    limit: String(limit),
    apiKey,
  });

  const response = await fetch(`${GEOAPIFY_BASE_URL}?${params.toString()}`, {
    method: "GET",
    signal,
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const error = new Error("Failed to fetch location suggestions.");
    error.statusCode = response.status;
    throw error;
  }

  const data = await response.json();
  const features = Array.isArray(data?.features) ? data.features : [];
  return features.map(normalizeSuggestion).filter((item) => item.locationName);
};

export async function autocompleteSriLankaLocations({ text, limit = 5 }) {
  const apiKey = process.env.GEOAPIFY_API_KEY;

  if (!apiKey) {
    const error = new Error("Geoapify API key is not configured.");
    error.statusCode = 500;
    throw error;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  const matchedDistrict = detectDistrictIntent(text);
  const mode = matchedDistrict ? "district" : "general";
  const effectiveLimit = matchedDistrict
    ? Math.max(limit, DISTRICT_FETCH_LIMIT)
    : limit;
  const requestText = matchedDistrict ? `${matchedDistrict}, Sri Lanka` : text;

  try {
    const rawSuggestions = await fetchGeoapifySuggestions({
      text: requestText,
      limit: effectiveLimit,
      apiKey,
      signal: controller.signal,
    });

    const districtScopedSuggestions = matchedDistrict
      ? rawSuggestions.filter((item) => isDistrictMatch(item.district, matchedDistrict))
      : rawSuggestions;

    const selectedSuggestions = districtScopedSuggestions.length > 0
      ? districtScopedSuggestions
      : rawSuggestions;

    const rankedSuggestions = selectedSuggestions
      .map((suggestion) => {
        const score = scoreSuggestion({
          suggestion,
          query: text,
          matchedDistrict,
        });

        return {
          ...suggestion,
          matchType: classifyMatchType({
            suggestion,
            query: text,
            matchedDistrict,
          }),
          _score: score,
        };
      })
      .sort((a, b) => b._score - a._score || a.locationName.localeCompare(b.locationName))
      .slice(0, limit)
      .map(({ _score, ...item }) => item);

    return {
      data: rankedSuggestions,
      meta: {
        mode,
        matchedDistrict,
      },
    };
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error("Location lookup timed out. Please try again.");
      timeoutError.statusCode = 504;
      throw timeoutError;
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}