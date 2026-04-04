const GEOAPIFY_BASE_URL = "https://api.geoapify.com/v1/geocode/autocomplete";

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

export async function autocompleteSriLankaLocations({ text, limit = 5 }) {
  const apiKey = process.env.GEOAPIFY_API_KEY;

  if (!apiKey) {
    const error = new Error("Geoapify API key is not configured.");
    error.statusCode = 500;
    throw error;
  }

  const params = new URLSearchParams({
    text,
    filter: "countrycode:lk",
    limit: String(limit),
    apiKey,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(`${GEOAPIFY_BASE_URL}?${params.toString()}`, {
      method: "GET",
      signal: controller.signal,
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