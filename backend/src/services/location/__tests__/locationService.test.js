import { jest } from "@jest/globals";
import { autocompleteSriLankaLocations } from "../locationService.js";

describe("Location Service - Unit Tests", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    jest.useRealTimers();

    process.env.GEOAPIFY_API_KEY = "test-api-key";
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("throws 500 when GEOAPIFY_API_KEY is missing", async () => {
    delete process.env.GEOAPIFY_API_KEY;

    await expect(
      autocompleteSriLankaLocations({ text: "Colombo" }),
    ).rejects.toMatchObject({
      message: "Geoapify API key is not configured.",
      statusCode: 500,
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("calls Geoapify with Sri Lanka filter and default limit", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [
          {
            properties: {
              formatted: "Bambalapitiya, Colombo, Sri Lanka",
              city: "Bambalapitiya",
              county: "Colombo",
              postcode: "00400",
            },
          },
        ],
      }),
    });

    const result = await autocompleteSriLankaLocations({ text: "Bamba" });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    const calledUrl = new URL(global.fetch.mock.calls[0][0]);
    expect(calledUrl.searchParams.get("text")).toBe("Bamba");
    expect(calledUrl.searchParams.get("filter")).toBe("countrycode:lk");
    expect(calledUrl.searchParams.get("limit")).toBe("5");
    expect(calledUrl.searchParams.get("apiKey")).toBe("test-api-key");

    const calledOptions = global.fetch.mock.calls[0][1];
    expect(calledOptions.method).toBe("GET");
    expect(calledOptions.headers).toEqual({ Accept: "application/json" });
    expect(result.meta).toEqual({ mode: "general", matchedDistrict: null });
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toEqual({
      formatted: "Bambalapitiya, Colombo, Sri Lanka",
      locationName: "Bambalapitiya",
      district: "Colombo",
      postcode: "00400",
      matchType: "location",
    });
  });

  it("normalizes location fields using fallback hierarchy", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [
          {
            properties: {
              formatted: "Some Formatted Place",
              town: "Town Name",
              state_district: "Gampaha",
              postcode: "11300",
            },
          },
        ],
      }),
    });

    const result = await autocompleteSriLankaLocations({ text: "Town" });

    expect(result.data[0]).toEqual({
      formatted: "Some Formatted Place",
      locationName: "Town Name",
      district: "Gampaha",
      postcode: "11300",
      matchType: "location",
    });
  });

  it("prioritizes postcode prefix matches over generic text matches", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [
          {
            properties: {
              formatted: "Galle, Sri Lanka",
              city: "Galle",
              county: "Galle",
              postcode: "80000",
            },
          },
          {
            properties: {
              formatted: "Random Place, Sri Lanka",
              city: "Random Place",
              county: "Colombo",
              postcode: "00400",
            },
          },
        ],
      }),
    });

    const result = await autocompleteSriLankaLocations({ text: "004" });

    expect(result.data[0].locationName).toBe("Random Place");
    expect(result.data[0].matchType).toBe("postcode");
  });

  it("sorts ties alphabetically by location name", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [
          {
            properties: {
              formatted: "Zeta Ville",
              city: "Zeta",
              county: "Colombo",
              postcode: "10000",
            },
          },
          {
            properties: {
              formatted: "Alpha Ville",
              city: "Alpha",
              county: "Colombo",
              postcode: "10000",
            },
          },
        ],
      }),
    });

    const result = await autocompleteSriLankaLocations({ text: "ville" });

    expect(result.data.map((item) => item.locationName)).toEqual(["Alpha", "Zeta"]);
  });

  it("uses district mode and boosts limit when district intent is detected", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [
          {
            properties: {
              formatted: "Borella, Colombo, Sri Lanka",
              city: "Borella",
              county: "Colombo",
              postcode: "00800",
            },
          },
          {
            properties: {
              formatted: "Somewhere, Galle, Sri Lanka",
              city: "Somewhere",
              county: "Galle",
              postcode: "80000",
            },
          },
        ],
      }),
    });

    const result = await autocompleteSriLankaLocations({ text: "Colombo", limit: 3 });

    const calledUrl = new URL(global.fetch.mock.calls[0][0]);
    expect(calledUrl.searchParams.get("text")).toBe("Colombo, Sri Lanka");
    expect(calledUrl.searchParams.get("limit")).toBe("15");

    expect(result.meta).toEqual({ mode: "district", matchedDistrict: "Colombo" });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].district).toBe("Colombo");
    expect(result.data[0].matchType).toBe("district");
  });

  it("falls back to raw suggestions if district-filtered list is empty", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [
          {
            properties: {
              formatted: "Galle Fort, Sri Lanka",
              city: "Galle Fort",
              county: "Galle",
              postcode: "80000",
            },
          },
        ],
      }),
    });

    const result = await autocompleteSriLankaLocations({ text: "Colombo", limit: 5 });

    expect(result.meta).toEqual({ mode: "district", matchedDistrict: "Colombo" });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].locationName).toBe("Galle Fort");
  });

  it("returns only up to the requested limit after ranking", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [
          { properties: { formatted: "A", city: "A", county: "Colombo", postcode: "10000" } },
          { properties: { formatted: "B", city: "B", county: "Colombo", postcode: "10001" } },
          { properties: { formatted: "C", city: "C", county: "Colombo", postcode: "10002" } },
          { properties: { formatted: "D", city: "D", county: "Colombo", postcode: "10003" } },
        ],
      }),
    });

    const result = await autocompleteSriLankaLocations({ text: "1", limit: 2 });

    expect(result.data).toHaveLength(2);
  });

  it("throws upstream status when Geoapify returns non-ok response", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({}),
    });

    await expect(
      autocompleteSriLankaLocations({ text: "Colombo" }),
    ).rejects.toMatchObject({
      message: "Failed to fetch location suggestions.",
      statusCode: 429,
    });
  });

  it("maps abort errors to a 504 timeout error", async () => {
    const abortError = new Error("aborted");
    abortError.name = "AbortError";

    global.fetch.mockRejectedValue(abortError);

    await expect(
      autocompleteSriLankaLocations({ text: "Colombo" }),
    ).rejects.toMatchObject({
      message: "Location lookup timed out. Please try again.",
      statusCode: 504,
    });
  });

  it("handles malformed Geoapify payloads with no features array", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ notFeatures: true }),
    });

    const result = await autocompleteSriLankaLocations({ text: "Colombo" });

    expect(result.data).toEqual([]);
    expect(result.meta).toEqual({ mode: "district", matchedDistrict: "Colombo" });
  });
});
