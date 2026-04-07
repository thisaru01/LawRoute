import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { getCaseDocuments, uploadCaseDocument, updateCaseDocument } from "@/api/services/caseService";

export function useCaseDocuments(caseId) {
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(Boolean(caseId));
  const [documentsError, setDocumentsError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
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

  const handleUpdateDocument = useCallback(async (docId, title, description) => {
    if (!caseId || !docId || !title?.trim()) return;
    setIsUpdating(true);
    try {
      await updateCaseDocument(docId, title.trim(), description?.trim());
      const res = await getCaseDocuments(caseId);
      const list = res?.data?.data;
      setDocuments(Array.isArray(list) ? list : []);
      toast.success("Document updated successfully");
      return true; // Return true to indicate success
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update document");
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [caseId]);

  return {
    documents,
    documentsLoading,
    documentsError,
    isUploading,
    isUpdating,
    selectedFile,
    handleSelectFile,
    handleUploadDocumentConfirm,
    handleUpdateDocument,
  };
}
