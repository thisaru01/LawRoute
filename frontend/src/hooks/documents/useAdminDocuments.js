import { useCallback, useEffect, useState } from "react";
import axios from "@/api/axios";
import { toast } from "sonner";

export function useAdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
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
      if (!selectedFile || !title?.trim()) {
        toast.error("Please select a file and provide a title");
        return;
      }
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
          toast.success("Document uploaded successfully");
        }
        setSelectedFile(null);
      } catch (err) {
        const msg = err?.message || "Failed to upload document";
        setError(msg);
        toast.error(msg);
      } finally {
        setIsUploading(false);
      }
    },
    [selectedFile],
  );

  const handleDelete = useCallback(
    async (id) => {
      try {
        await axios.delete(`/documents/${id}`);
        setDocuments((prev) => prev.filter((doc) => (doc._id || doc.id) !== id));
        return true;
      } catch (err) {
        setError(err?.message || "Failed to delete document");
        return false;
      }
    },
    [],
  );

  const handleUpdateDocument = useCallback(async (docId, title, description) => {
    if (!docId) return false;
    setIsUpdating(true);
    try {
      const res = await axios.patch(`/documents/${docId}`, { title, description });
      const updated = res?.data?.document;
      if (updated) {
        setDocuments((prev) => prev.map((d) => ((d._id || d.id) === (updated._id || updated.id) ? updated : d)));
        toast.success("Document updated successfully");
        return true;
      }
      return false;
    } catch (err) {
      setError(err?.message || "Failed to update document");
      toast.error(err?.message || "Failed to update document");
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    documents,
    loading,
    error,
    isUploading,
    isUpdating,
    selectedFile,
    handleSelectFile,
    handleUploadDocumentConfirm,
    handleDelete,
    handleUpdateDocument,
  };
}
