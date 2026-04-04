import { useEffect, useState } from "react";
import { getLocationAutocomplete } from "@/api/services/locationService";

const isTimeoutError = (error) => {
  const message = (error?.message || "").toLowerCase();
  return message.includes("timeout") || message.includes("timed out");
};

export function useSriLankaLocationAutocomplete({ query, enabled = true, debounceMs = 300, minChars = 2 }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const text = typeof query === "string" ? query.trim() : "";

    if (!enabled || text.length < minChars) {
      setSuggestions([]);
      setLoading(false);
      setError("");
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

        setSuggestions(Array.isArray(res?.data?.data) ? res.data.data : []);
      } catch (err) {
        if (!active) {
          return;
        }

        setSuggestions([]);
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
  };
}