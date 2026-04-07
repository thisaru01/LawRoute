import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { closeCase, getCaseById } from "@/api/services/caseService";

export function useCaseDetails(caseId, canCloseCase) {
  const [caseDetails, setCaseDetails] = useState(null);
  const [caseLoading, setCaseLoading] = useState(Boolean(caseId));
  const [caseError, setCaseError] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [closeError, setCloseError] = useState(null);

  useEffect(() => {
    if (!caseId) return;
    let cancelled = false;
    setCaseLoading(true);
    setCaseError(null);
    getCaseById(caseId)
      .then((res) => {
        if (!cancelled) setCaseDetails(res?.data?.data || null);
      })
      .catch((err) => {
        if (!cancelled) setCaseError(err);
      })
      .finally(() => {
        if (!cancelled) setCaseLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [caseId]);

  const handleCloseCase = useCallback(async () => {
    if (!canCloseCase) return;
    if (!caseId) return;
    setIsClosing(true);
    setCloseError(null);
    try {
      await closeCase(caseId);
      const res = await getCaseById(caseId);
      setCaseDetails(res?.data?.data || null);
      toast.success("Case closed successfully");
    } catch (err) {
      setCloseError(err);
      toast.error("Failed to close case");
    } finally {
      setIsClosing(false);
    }
  }, [caseId, canCloseCase]);

  return {
    caseDetails,
    caseLoading,
    caseError,
    isClosing,
    closeError,
    handleCloseCase,
  };
}
