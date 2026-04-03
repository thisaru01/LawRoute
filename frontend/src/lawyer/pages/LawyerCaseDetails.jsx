import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import ScheduleMeetingContent from "@/lawyer/components/cases/ScheduleMeetingContent";
import UploadDocumentContent from "@/lawyer/components/cases/UploadDocumentContent";
import {
  getCaseById,
  getCaseDocuments,
  getCaseMeetings,
  scheduleCaseMeeting,
  uploadCaseDocument,
} from "@/api/services/caseService";

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

  const [caseDetails, setCaseDetails] = useState(null);
  const [caseLoading, setCaseLoading] = useState(Boolean(caseId));
  const [caseError, setCaseError] = useState(null);

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

  const effectiveCase = useMemo(() => {
    if (!caseDetails) return null;
    return caseDetails;
  }, [caseDetails]);

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

  useEffect(() => {
    if (!caseId) return;

    const loadCase = async () => {
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

    loadCase();
  }, [caseId]);

  useEffect(() => {
    if (!caseId) return;

    const loadMeetings = async () => {
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

    loadMeetings();
  }, [caseId]);

  useEffect(() => {
    if (!caseId) return;

    const loadDocuments = async () => {
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

    loadDocuments();
  }, [caseId]);

  const handleScheduleChange = (field, value) => {
    setScheduleForm((prev) => ({ ...prev, [field]: value }));
  };

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

  return (
    <div className="space-y-6">
      {/* Case details section */}
      <Card>
        <CardHeader>
          <CardTitle>Case details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {caseError && (
            <p className="text-sm text-destructive">
              {caseError.message || "Failed to load case details"}
            </p>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="font-medium text-foreground">Status:</span>
              {caseLoading ? (
                <span>Loading...</span>
              ) : (
                <Badge
                  variant={
                    normalizedStatus === "closed" ? "secondary" : "default"
                  }
                  className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                >
                  {label}
                </Badge>
              )}
            </span>
            {createdAtLabel && (
              <span>
                <span className="font-medium text-foreground">Opened: </span>
                {createdAtLabel}
              </span>
            )}
          </div>

          <Separator />

          <div className="space-y-1">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Involved person
            </p>
            <div className="space-y-0.5">
              <p className="text-foreground">{citizenName}</p>
              {citizenEmail && (
                <p className="text-foreground">{citizenEmail}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Summary
            </p>
            <p className="whitespace-pre-line text-foreground">
              {caseLoading && !summary ? "Loading..." : summary}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming meetings section */}
      <Card>
        <AlertDialog>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Upcoming meetings</CardTitle>
              <CardDescription>
                See and schedule meetings for this case.
              </CardDescription>
            </div>
            <AlertDialogTrigger asChild>
              <Button size="sm" disabled={!caseId}>
                Schedule meeting
              </Button>
            </AlertDialogTrigger>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            {meetingsError && (
              <p className="text-sm text-destructive">
                {meetingsError.message || "Failed to load meetings"}
              </p>
            )}

            {meetingsLoading ? (
              <p>Loading meetings...</p>
            ) : meetings.length === 0 ? (
              <p>No meetings scheduled yet.</p>
            ) : (
              <ul className="space-y-2">
                {meetings.map((meeting) => {
                  const when = `${meeting.date} at ${meeting.time}`;
                  const methodLabel =
                    meeting.method === "physical" ? "In person" : "Online";
                  const locationText =
                    meeting.method === "physical"
                      ? meeting.location
                      : meeting.meetingLink;

                  return (
                    <li
                      key={meeting._id}
                      className="rounded-md border bg-background px-3 py-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-foreground">
                          {when}
                        </span>
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="uppercase tracking-wide">
                            {methodLabel}
                          </span>
                          <Badge
                            variant="outline"
                            className="px-1.5 py-0 text-[10px] uppercase tracking-wide"
                          >
                            {meeting.status || "scheduled"}
                          </Badge>
                        </span>
                      </div>
                      {locationText &&
                        (meeting.method === "online" ? (
                          <a
                            href={locationText}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 block break-all text-xs text-primary underline underline-offset-2"
                          >
                            {locationText}
                          </a>
                        ) : (
                          <p className="mt-1 text-xs">{locationText}</p>
                        ))}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>

          <ScheduleMeetingContent
            scheduleForm={scheduleForm}
            onChange={handleScheduleChange}
            onConfirm={handleScheduleConfirm}
            isScheduling={isScheduling}
            timeOptions={timeOptions}
          />
        </AlertDialog>
      </Card>

      {/* Documents section */}
      <Card>
        <AlertDialog>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Documents attached to this case.
              </CardDescription>
            </div>
            <AlertDialogTrigger asChild>
              <Button size="sm" disabled={isUploading || !caseId}>
                {isUploading ? "Uploading..." : "Add document"}
              </Button>
            </AlertDialogTrigger>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {documentsError && (
              <p className="text-sm text-destructive">
                {documentsError.message || "Failed to load documents"}
              </p>
            )}

            {documentsLoading ? (
              <p>Loading documents...</p>
            ) : documents.length === 0 ? (
              <p>No documents attached yet.</p>
            ) : (
              <ul className="space-y-2">
                {documents.map((doc) => (
                  <li
                    key={doc._id}
                    className="rounded-md border bg-background px-3 py-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-foreground">
                        {doc.fileType}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(doc.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 break-all text-xs text-muted-foreground">
                      {doc.fileUrl}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>

          <UploadDocumentContent
            selectedFile={selectedFile}
            onSelectFile={handleSelectFile}
            onConfirm={handleUploadDocumentConfirm}
            isUploading={isUploading}
          />
        </AlertDialog>
      </Card>
    </div>
  );
}
