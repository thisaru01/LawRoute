import { useState, useEffect } from "react";
import { getPublicLawyerProfile } from "@/api/services/lawyerProfileService";

/**
 * Hook to fetch and manage a single public lawyer profile.
 * @param {string} id - The lawyer profile ID or user ID.
 * @returns {object} { lawyer, isLoading, error, refresh }
 */
export function useLawyerProfile(id) {
  const [lawyer, setLawyer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await getPublicLawyerProfile(id);
      setLawyer(response.data.lawyerProfile);
    } catch (err) {
      console.error("Error fetching lawyer profile:", err);
      setError(err.response?.data?.message || "Failed to load lawyer profile");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  return {
    lawyer,
    isLoading,
    error,
    refresh: fetchProfile
  };
}
