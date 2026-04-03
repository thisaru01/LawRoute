import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

import {
  getCaseById,
  getCaseDocuments,
  getCaseMeetings,
  scheduleCaseMeeting,
  uploadCaseDocument,
} from "@/api/services/caseService";

import CaseOverview from "@/lawyer/components/cases/CaseOverview";
import CaseMeetings from "@/lawyer/components/cases/CaseMeetings";
import CaseDocuments from "@/lawyer/components/cases/CaseDocuments";

export default function LawyerCaseDetails() {
  const { status, caseId: caseIdFromParams } = useParams();
  const location = useLocation();

  const navState = location.state || {};
  const caseId = caseIdFromParams || navState.caseId;

  const formatDateTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString();
  };

  // ── Case ────────────────────────────────────────────────────────────────────
  const [caseDetails, setCaseDetails] = useState(null);
  const [caseLoading, setCaseLoading] = useState(Boolean(caseId));
  const [caseError, setCaseError] = useState(null);

  // ── Meetings ─────────────────────────────────────────────────────────────────
  const [meetings, setMeetings] = useState([]);
  const [meetingsLoading, setMeetingsLoading] = useState(Boolean(caseId));
  const [meetingsError, setMeetingsError] = useState(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    time: "",
    method: "online",
    meetingLink: "",
    location: "",
  });

  // ── Documents ────────────────────────────────────────────────────────────────
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(Boolean(caseId));
  const [documentsError, setDocumentsError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Fallbacks from navigation state while loading
  const fallbackCitizenName = navState.citizenName || "Citizen";
  const fallbackCitizenEmail = navState.citizenEmail || "";
  const fallbackCreatedAtLabel = formatDateTime(navState.createdAt);
  const fallbackSummary = navState.summary || "(No summary provided)";
  const fallbackStatus = navState.status || status || "opened";

  const effectiveCase = useMemo(() => caseDetails, [caseDetails]);

  const citizenName =
    effectiveCase?.user?.name ||
    effectiveCase?.citizen?.name ||
    fallbackCitizenName;
  const citizenEmail =
    effectiveCase?.user?.email ||
    effectiveCase?.citizen?.email ||
    fallbackCitizenEmail;
  const createdAtLabel =
    formatDateTime(effectiveCase?.createdAt || navState.createdAt) ||
    fallbackCreatedAtLabel;
  const summary =
    effectiveCase?.consultationRequest?.summary || fallbackSummary;
  const statusSource = effectiveCase?.status || fallbackStatus;

  const normalizedStatus = String(statusSource ?? "opened").toLowerCase();
  const label =
    normalizedStatus.charAt(0).toUpperCase() +
    normalizedStatus.slice(1).toLowerCase();

  // ── Effects ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!caseId) return;
    const load = async () => {
      setCaseLoading(true);
      setCaseError(null);
      try {
        const response = await getCaseById(caseId);
        setCaseDetails(response?.data?.data || null);
      } catch (err) {
        setCaseError(err);
      } finally {
        setCaseLoading(false);
      }
    };
    load();
  }, [caseId]);

  useEffect(() => {
    if (!caseId) return;
    const load = async () => {
      setMeetingsLoading(true);
      setMeetingsError(null);
      try {
        const response = await getCaseMeetings(caseId);
        const list = response?.data?.data;
        setMeetings(Array.isArray(list) ? list : []);
      } catch (err) {
        setMeetingsError(err);
        setMeetings([]);
      } finally {
        setMeetingsLoading(false);
      }
    };
    load();
  }, [caseId]);

  useEffect(() => {
    if (!caseId) return;
    const load = async () => {
      setDocumentsLoading(true);
      setDocumentsError(null);
      try {
        const response = await getCaseDocuments(caseId);
        const list = response?.data?.data;
        setDocuments(Array.isArray(list) ? list : []);
      } catch (err) {
        setDocumentsError(err);
        setDocuments([]);
      } finally {
        setDocumentsLoading(false);
      }
    };
    load();
  }, [caseId]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const generateTimeOptions = (intervalMinutes = 30) => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += intervalMinutes) {
        const hh = String(h).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        times.push(`${hh}:${mm}`);
      }
    }
    return times;
  };
  const timeOptions = generateTimeOptions(30);

  const handleScheduleChange = (field, value) => {
    setScheduleForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleScheduleConfirm = async () => {
    if (!caseId) return;
    setIsScheduling(true);
    try {
      await scheduleCaseMeeting(caseId, scheduleForm);
      setScheduleForm({
        date: "",
        time: "",
        method: "online",
        meetingLink: "",
        location: "",
      });
      const response = await getCaseMeetings(caseId);
      const list = response?.data?.data;
      setMeetings(Array.isArray(list) ? list : []);
    } catch (err) {
      setMeetingsError(err);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleSelectFile = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleUploadDocumentConfirm = async () => {
    if (!caseId || !selectedFile) return;
    setIsUploading(true);
    try {
      await uploadCaseDocument(caseId, selectedFile);
      setSelectedFile(null);
      const response = await getCaseDocuments(caseId);
      const list = response?.data?.data;
      setDocuments(Array.isArray(list) ? list : []);
    } catch (err) {
      setDocumentsError(err);
    } finally {
      setIsUploading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview">
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <Card className="mt-4">
          <CardContent className="pt-6">
            <TabsContent value="overview">
              <CaseOverview
                caseLoading={caseLoading}
                caseError={caseError}
                citizenName={citizenName}
                citizenEmail={citizenEmail}
                createdAtLabel={createdAtLabel}
                summary={summary}
                normalizedStatus={normalizedStatus}
                label={label}
              />
            </TabsContent>

            <TabsContent value="meetings">
              <CaseMeetings
                caseId={caseId}
                meetings={meetings}
                meetingsLoading={meetingsLoading}
                meetingsError={meetingsError}
                isScheduling={isScheduling}
                scheduleForm={scheduleForm}
                timeOptions={timeOptions}
                onScheduleChange={handleScheduleChange}
                onScheduleConfirm={handleScheduleConfirm}
              />
            </TabsContent>

            <TabsContent value="documents">
              <CaseDocuments
                caseId={caseId}
                documents={documents}
                documentsLoading={documentsLoading}
                documentsError={documentsError}
                isUploading={isUploading}
                selectedFile={selectedFile}
                onSelectFile={handleSelectFile}
                onUploadConfirm={handleUploadDocumentConfirm}
              />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
