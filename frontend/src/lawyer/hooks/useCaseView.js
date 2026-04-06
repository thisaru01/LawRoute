import { useCallback, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { toast } from "sonner";

import {
  closeCase,
  getCaseById,
  getCaseDocuments,
  getCaseMeetings,
  scheduleCaseMeeting,
  uploadCaseDocument,
} from "@/api/services/caseService";
import { formatDateTime } from "@/lib/formatDateTime";

const INITIAL_SCHEDULE_FORM = {
  date: "",
  time: "",
  method: "online",
  meetingLink: "",
  location: "",
};

/**
 * Encapsulates all state, effects, and handlers for the Lawyer Case View page.
 * Exposes the full context value needed by CaseProvider.
 */
export function useCaseView() {
  const { status, caseId: caseIdFromParams } = useParams();
  const location = useLocation();

  const navState = location.state || {};
  const caseId = caseIdFromParams || navState.caseId;

  //  Case
  const [caseDetails, setCaseDetails] = useState(null);
  const [caseLoading, setCaseLoading] = useState(Boolean(caseId));
  const [caseError, setCaseError] = useState(null);

  //  Meetings
  const [meetings, setMeetings] = useState([]);
  const [meetingsLoading, setMeetingsLoading] = useState(Boolean(caseId));
  const [meetingsError, setMeetingsError] = useState(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleForm, setScheduleForm] = useState(INITIAL_SCHEDULE_FORM);

  //  Documents
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(Boolean(caseId));
  const [documentsError, setDocumentsError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  //  Close case
  const [isClosing, setIsClosing] = useState(false);
  const [closeError, setCloseError] = useState(null);

  //  Fallbacks from navigation state while API loads
  const fallbackCitizenName = navState.citizenName || "Citizen";
  const fallbackCitizenEmail = navState.citizenEmail || "";
  const fallbackCreatedAtLabel = formatDateTime(navState.createdAt);
  const fallbackSummary = navState.summary || "(No summary provided)";
  const fallbackStatus = navState.status || status || "opened";

  //  Derived display values
  const citizenName =
    caseDetails?.user?.name || caseDetails?.citizen?.name || fallbackCitizenName;
  const citizenEmail =
    caseDetails?.user?.email || caseDetails?.citizen?.email || fallbackCitizenEmail;
  const createdAtLabel =
    formatDateTime(caseDetails?.createdAt || navState.createdAt) || fallbackCreatedAtLabel;
  const summary = caseDetails?.consultationRequest?.summary || fallbackSummary;
  const statusSource = caseDetails?.status || fallbackStatus;
  const normalizedStatus = String(statusSource ?? "opened").toLowerCase();
  const label =
    normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);

  //  Effects
  useEffect(() => {
    if (!caseId) return;
    let cancelled = false;
    setCaseLoading(true);
    setCaseError(null);
    getCaseById(caseId)
      .then((res) => { if (!cancelled) setCaseDetails(res?.data?.data || null); })
      .catch((err) => { if (!cancelled) setCaseError(err); })
      .finally(() => { if (!cancelled) setCaseLoading(false); });
    return () => { cancelled = true; };
  }, [caseId]);

  useEffect(() => {
    if (!caseId) return;
    let cancelled = false;
    setMeetingsLoading(true);
    setMeetingsError(null);
    getCaseMeetings(caseId)
      .then((res) => {
        if (!cancelled) {
          const list = res?.data?.data;
          setMeetings(Array.isArray(list) ? list : []);
        }
      })
      .catch((err) => { if (!cancelled) { setMeetingsError(err); setMeetings([]); } })
      .finally(() => { if (!cancelled) setMeetingsLoading(false); });
    return () => { cancelled = true; };
  }, [caseId]);

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
      .catch((err) => { if (!cancelled) { setDocumentsError(err); setDocuments([]); } })
      .finally(() => { if (!cancelled) setDocumentsLoading(false); });
    return () => { cancelled = true; };
  }, [caseId]);

  //  Stable handlers (useCallback prevents unnecessary re-renders)
  const handleScheduleChange = useCallback((field, value) => {
    setScheduleForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleScheduleConfirm = useCallback(async () => {
    if (!caseId) return;
    setIsScheduling(true);
    try {
      await scheduleCaseMeeting(caseId, scheduleForm);
      setScheduleForm(INITIAL_SCHEDULE_FORM);
      const res = await getCaseMeetings(caseId);
      const list = res?.data?.data;
      setMeetings(Array.isArray(list) ? list : []);
      toast.success("Meeting scheduled successfully");
    } catch (err) {
      setMeetingsError(err);
      toast.error("Failed to schedule meeting");
    } finally {
      setIsScheduling(false);
    }
  }, [caseId, scheduleForm]);

  const handleSelectFile = useCallback((event) => {
    setSelectedFile(event.target.files?.[0] || null);
  }, []);

  const handleUploadDocumentConfirm = useCallback(async () => {
    if (!caseId || !selectedFile) return;
    setIsUploading(true);
    try {
      await uploadCaseDocument(caseId, selectedFile);
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

  const handleCloseCase = useCallback(async () => {
    if (!caseId) return;
    setIsClosing(true);
    setCloseError(null);
    try {
      await closeCase(caseId);
      // Refresh case details so status badge updates immediately
      const res = await getCaseById(caseId);
      setCaseDetails(res?.data?.data || null);
      toast.success("Case closed successfully");
    } catch (err) {
      setCloseError(err);
      toast.error("Failed to close case");
    } finally {
      setIsClosing(false);
    }
  }, [caseId]);

  return {
    // Case
    caseId,
    caseDetails,
    caseLoading,
    caseError,
    citizenName,
    citizenEmail,
    createdAtLabel,
    summary,
    normalizedStatus,
    label,
    // Meetings
    meetings,
    meetingsLoading,
    meetingsError,
    isScheduling,
    scheduleForm,
    handleScheduleChange,
    handleScheduleConfirm,
    // Documents
    documents,
    documentsLoading,
    documentsError,
    isUploading,
    selectedFile,
    handleSelectFile,
    handleUploadDocumentConfirm,
    // Close case
    isClosing,
    closeError,
    handleCloseCase,
  };
}
