import { useCallback, useEffect, useState } from "react";
import { getApprovedLawyerProfiles } from "@/api/services/lawyerProfileService";

/**
 * Fetches approved lawyer profiles, re-fetching whenever any filter value changes.
 * Each primitive param is a dependency so the effect is stable.
 *
 * @param {string}  search    - Name / keyword text
 * @param {string}  expertise - Expertise enum value or ""
 * @param {boolean} isFree    - Free-consultation toggle
 */
export function useFindLawyers({ search = "", expertise = "", isFree = false } = {}) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(
    (signal) => {
      setIsLoading(true);
      setError(null);

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (expertise) params.expertise = expertise;
      if (isFree) params.isFree = true;

      getApprovedLawyerProfiles(params)
        .then((res) => {
          if (signal?.cancelled) return;
          const list = res?.data?.lawyerProfiles;
          setData(Array.isArray(list) ? list : []);
        })
        .catch((err) => {
          if (signal?.cancelled) return;
          setError(err);
          setData([]);
        })
        .finally(() => {
          if (!signal?.cancelled) setIsLoading(false);
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search, expertise, isFree],
  );

  useEffect(() => {
    const signal = { cancelled: false };
    load(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [load]);

  const refresh = useCallback(() => load({}), [load]);

  return { data, isLoading, error, refresh };
}
