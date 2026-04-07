import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { getCaseDocuments, uploadCaseDocument } from "@/api/services/caseService";

export function useCaseDocuments(caseId) {
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(Boolean(caseId));
  const [documentsError, setDocumentsError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (!caseId) return;
    let cancelled = false;
    setDocumentsLoading(true);
    setDocumentsError(null);
    getCaseDocuments(caseId)
      .then((res) => {
        if (!cancelled) {
          const list = res?.data?.data;
          setDocuments(Array.isArray(list) ? list : []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setDocumentsError(err);
          setDocuments([]);
        }
      })
      .finally(() => {
        if (!cancelled) setDocumentsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [caseId]);

  const handleSelectFile = useCallback((event) => {
    setSelectedFile(event.target.files?.[0] || null);
  }, []);

  const handleUploadDocumentConfirm = useCallback(async ({ title, description }) => {
    if (!caseId || !selectedFile || !title?.trim()) return;
    setIsUploading(true);
    try {
      await uploadCaseDocument(caseId, selectedFile, title.trim(), description?.trim());
      setSelectedFile(null);
      const res = await getCaseDocuments(caseId);
      const list = res?.data?.data;
      setDocuments(Array.isArray(list) ? list : []);
      toast.success("Document uploaded successfully");
    } catch (err) {
      setDocumentsError(err);
      toast.error("Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  }, [caseId, selectedFile]);

  return {
    documents,
    documentsLoading,
    documentsError,
    isUploading,
    selectedFile,
    handleSelectFile,
    handleUploadDocumentConfirm,
  };
}
