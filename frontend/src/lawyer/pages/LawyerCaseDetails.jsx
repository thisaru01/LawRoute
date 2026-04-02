import { useEffect, useMemo, useRef, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getCaseById,
  getCaseDocuments,
  getCaseMeetings,
  scheduleCaseMeeting,
  uploadCaseDocument,
} from "@/api/services/caseService";

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

export default function LawyerCaseDetails() {
  const { status, caseId: caseIdFromParams } = useParams();
  const location = useLocation();

  const navState = location.state || {};
  const caseId = caseIdFromParams || navState.caseId;

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
  const fileInputRef = useRef(null);

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

  const handleScheduleSubmit = async (event) => {
    event.preventDefault();
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

  const handleTriggerUpload = () => {
    if (!caseId || !fileInputRef.current) return;
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !caseId) return;

    setIsUploading(true);
    try {
      await uploadCaseDocument(caseId, file);
      event.target.value = "";

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
          <CardDescription>
            Overview of this case, including the summary and the citizen
            involved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {caseError && (
            <p className="text-sm text-destructive">
              {caseError.message || "Failed to load case details"}
            </p>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">Case ID: </span>
              {caseId || "-"}
            </span>
            <span>
              <span className="font-medium text-foreground">Status: </span>
              {caseLoading ? "Loading..." : label}
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
            <p className="text-foreground">
              {citizenName}
              {citizenEmail ? ` \\u2022 ${citizenEmail}` : ""}
            </p>
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
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Upcoming meetings</CardTitle>
            <CardDescription>
              See and schedule meetings for this case.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          {meetingsError && (
            <p className="text-sm text-destructive">
              {meetingsError.message || "Failed to load meetings"}
            </p>
          )}

          <form
            onSubmit={handleScheduleSubmit}
            className="space-y-3 rounded-md border bg-muted/40 p-3 text-xs text-foreground"
          >
            <div className="grid gap-2 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="meeting-date">Date</Label>
                <Input
                  id="meeting-date"
                  type="date"
                  value={scheduleForm.date}
                  onChange={(e) => handleScheduleChange("date", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="meeting-time">Time</Label>
                <Input
                  id="meeting-time"
                  type="time"
                  value={scheduleForm.time}
                  onChange={(e) => handleScheduleChange("time", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="meeting-method">Method</Label>
                <Input
                  id="meeting-method"
                  value={scheduleForm.method}
                  onChange={(e) =>
                    handleScheduleChange("method", e.target.value)
                  }
                  placeholder="online or physical"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="meeting-location-link">
                  Meeting link or location
                </Label>
                <Input
                  id="meeting-location-link"
                  value={
                    scheduleForm.method === "online"
                      ? scheduleForm.meetingLink
                      : scheduleForm.location
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    if (scheduleForm.method === "online") {
                      handleScheduleChange("meetingLink", value);
                    } else {
                      handleScheduleChange("location", value);
                    }
                  }}
                  placeholder="Video link for online, address for physical"
                />
              </div>
            </div>

            <Button type="submit" size="sm" disabled={isScheduling || !caseId}>
              {isScheduling ? "Scheduling..." : "Schedule meeting"}
            </Button>
          </form>

          <Separator />

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
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        {methodLabel} \\u2022 {meeting.status || "scheduled"}
                      </span>
                    </div>
                    {locationText && (
                      <p className="mt-1 text-xs">{locationText}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Documents section */}
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Documents attached to this case.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              size="sm"
              onClick={handleTriggerUpload}
              disabled={isUploading || !caseId}
            >
              {isUploading ? "Uploading..." : "Add document"}
            </Button>
          </div>
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
      </Card>
    </div>
  );
}
