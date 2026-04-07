import { useCallback, useEffect, useState } from "react";
import axios from "@/api/axios";

export function useAdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/documents");
      setDocuments(res?.data?.documents || []);
    } catch (err) {
      setError(err?.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleSelectFile = useCallback((event) => {
    setSelectedFile(event.target.files?.[0] || null);
  }, []);

  const handleUploadDocumentConfirm = useCallback(
    async ({ title, description }) => {
      if (!selectedFile || !title?.trim()) return;
      setIsUploading(true);
      setError(null);
      try {
        const form = new FormData();
        form.append("file", selectedFile);
        form.append("title", title.trim());
        if (description?.trim()) form.append("description", description.trim());

        const res = await axios.post("/documents", form);
        const newDoc = res?.data?.document;
        if (newDoc) {
          setDocuments((prev) => [newDoc, ...prev]);
        }
        setSelectedFile(null);
      } catch (err) {
        setError(err?.message || "Failed to upload document");
      } finally {
        setIsUploading(false);
      }
    },
    [selectedFile],
  );

  return {
    documents,
    loading,
    error,
    isUploading,
    selectedFile,
    handleSelectFile,
    handleUploadDocumentConfirm,
  };
}
