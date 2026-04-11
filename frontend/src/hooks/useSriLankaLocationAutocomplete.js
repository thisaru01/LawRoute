import { useEffect, useState } from "react";
import { getLocationAutocomplete } from "@/api/services/locationService";

const isTimeoutError = (error) => {
  const message = (error?.message || "").toLowerCase();
  return message.includes("timeout") || message.includes("timed out");
};

const toKeyPart = (value) =>
  (typeof value === "string" ? value.trim().toLowerCase() : "");

const dedupeSuggestions = (items) => {
  const seen = new Set();
  const unique = [];

  for (const item of items) {
    const key = [
      toKeyPart(item?.locationName),
      toKeyPart(item?.postcode),
      toKeyPart(item?.district),
      toKeyPart(item?.formatted),
    ].join("|");

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(item);
  }

  return unique;
};

export function useSriLankaLocationAutocomplete({ query, enabled = true, debounceMs = 300, minChars = 2 }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("general");
  const [matchedDistrict, setMatchedDistrict] = useState("");

  useEffect(() => {
    const text = typeof query === "string" ? query.trim() : "";

    if (!enabled || text.length < minChars) {
      setSuggestions([]);
      setLoading(false);
      setError("");
      setMode("general");
      setMatchedDistrict("");
      return undefined;
    }

    let active = true;

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getLocationAutocomplete({ text, limit: 5 });

        if (!active) {
          return;
        }

        const incoming = Array.isArray(res?.data?.data) ? res.data.data : [];
        setSuggestions(dedupeSuggestions(incoming));
        setMode(typeof res?.data?.meta?.mode === "string" ? res.data.meta.mode : "general");
        setMatchedDistrict(typeof res?.data?.meta?.matchedDistrict === "string" ? res.data.meta.matchedDistrict : "");
      } catch (err) {
        if (!active) {
          return;
        }

        setSuggestions([]);
        setMode("general");
        setMatchedDistrict("");
        if (isTimeoutError(err)) {
          // Autocomplete should fail silently on transient timeouts.
          setError("");
        } else {
          setError(err?.message || "Unable to fetch location suggestions.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [debounceMs, enabled, minChars, query]);

  return {
    suggestions,
    loading,
    error,
    mode,
    matchedDistrict,
  };
}