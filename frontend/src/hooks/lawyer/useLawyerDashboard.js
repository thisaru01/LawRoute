import { useState, useCallback, useEffect } from "react";
import { getLawyerDashboardStats } from "@/api/services/lawyerProfileService";

export function useLawyerDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getLawyerDashboardStats();
      setData(response.data);
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    data,
    isLoading,
    error,
    refresh: loadDashboard,
  };
}
