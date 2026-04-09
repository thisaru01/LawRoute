import { useLocation, useParams } from "react-router-dom";
import { formatDateTime } from "@/lib/formatDateTime";
import { useAuth } from "@/context/auth/useAuth";
import { useCaseDetails } from "@/hooks/cases/useCaseDetails";
import { useCaseMeetings } from "@/hooks/cases/useCaseMeetings";
import { useCaseDocuments } from "@/hooks/cases/useCaseDocuments";

/**
 * Encapsulates all state, effects, and handlers for the Case View page.
 * Composes smaller hooks for details, meetings, and documents.
 */
export function useCaseView() {
  const { status, caseId: caseIdFromParams } = useParams();
  const location = useLocation();
  const { role } = useAuth();

  const navState = location.state || {};
  const caseId = caseIdFromParams || navState.caseId;

  //  Role-based capabilities
  const canManageCase = role === "lawyer";
  const canScheduleMeetings = role === "lawyer";
  const canCloseCase = role === "lawyer";

  //  Data hooks
  const {
    caseDetails,
    caseLoading,
    caseError,
    isClosing,
    closeError,
    handleCloseCase,
  } = useCaseDetails(caseId, canCloseCase);

  const {
    meetings,
    meetingsLoading,
    meetingsError,
    isScheduling,
    scheduleForm,
    handleScheduleChange,
    handleScheduleConfirm,
    handleJoinMeeting,
    refreshMeetings,
  } = useCaseMeetings(caseId, canScheduleMeetings);

  const {
    documents,
    documentsLoading,
    documentsError,
    isUploading,
    isUpdating,
    isDeleting,
    selectedFile,
    handleSelectFile,
    handleUploadDocumentConfirm,
    handleUpdateDocument,
    handleDeleteDocument,
  } = useCaseDocuments(caseId);

  //  Fallbacks from navigation state while API loads
  const fallbackCitizenName = navState.citizenName || "Citizen";
  const fallbackCitizenEmail = navState.citizenEmail || "";
  const fallbackCreatedAtLabel = formatDateTime(navState.createdAt);
  const fallbackSummary = navState.summary || "(No summary provided)";
  const fallbackStatus = navState.status || status || "opened";

  //  Derived display values
  const personName =
    role === "user"
      ? caseDetails?.lawyer?.name || fallbackCitizenName
      : caseDetails?.user?.name ||
        caseDetails?.citizen?.name ||
        fallbackCitizenName;

  const personEmail =
    role === "user"
      ? caseDetails?.lawyer?.email || fallbackCitizenEmail
      : caseDetails?.user?.email ||
        caseDetails?.citizen?.email ||
        fallbackCitizenEmail;

  const citizenName = personName;
  const citizenEmail = personEmail;
  const createdAtLabel =
    formatDateTime(caseDetails?.createdAt || navState.createdAt) ||
    fallbackCreatedAtLabel;
  const summary = caseDetails?.consultationRequest?.summary || fallbackSummary;
  const statusSource = caseDetails?.status || fallbackStatus;
  const normalizedStatus = String(statusSource ?? "opened").toLowerCase();
  const label =
    normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);

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
    canManageCase,
    canScheduleMeetings,
    canCloseCase,
    // Meetings
    meetings,
    meetingsLoading,
    meetingsError,
    isScheduling,
    scheduleForm,
    handleScheduleChange,
    handleScheduleConfirm,
    handleJoinMeeting,
    refreshMeetings,
    // Documents
    documents,
    documentsLoading,
    documentsError,
    isUploading,
    isUpdating,
    isDeleting,
    selectedFile,
    handleSelectFile,
    handleUploadDocumentConfirm,
    handleUpdateDocument,
    handleDeleteDocument,
    // Close case
    isClosing,
    closeError,
    handleCloseCase,
  };
}
