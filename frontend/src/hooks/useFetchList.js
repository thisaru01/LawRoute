import { useCallback, useEffect, useState } from "react";

/**
 * Generic hook for fetching a list from an async API function.
 * Handles loading, error, and cancellation automatically.
 *
 * @param {() => Promise<any>} fetcher  - API call that returns { data: { data: [] } }
 * @returns {{ data: any[], isLoading: boolean, error: Error|null, refresh: () => void }}
 */
export function useFetchList(fetcher) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(
    (signal, { setLoading = true } = {}) => {
      const run = async () => {
        if (setLoading) {
          setIsLoading(true);
          setError(null);
        }

        try {
          const res = await fetcher();
          if (signal?.cancelled) return;
          const list = res?.data?.data;
          setData(Array.isArray(list) ? list : []);
        } catch (err) {
          if (signal?.cancelled) return;
          setError(err);
          setData([]);
        } finally {
          if (!signal?.cancelled) setIsLoading(false);
        }
      };
      Promise.resolve().then(run);
    },
    [fetcher],
  );

  useEffect(() => {
    const signal = { cancelled: false };
    load(signal, { setLoading: false });
    return () => {
      signal.cancelled = true;
    };
  }, [load]);

  // Manual refresh (fire-and-forget, no cancellation needed)
  const refresh = useCallback(() => load({}, { setLoading: true }), [load]);

  return { data, isLoading, error, refresh };
}
