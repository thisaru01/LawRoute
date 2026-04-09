import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getCaseMeetings,
  scheduleCaseMeeting,
} from "@/api/services/caseService";

const INITIAL_SCHEDULE_FORM = {
  date: "",
  time: "",
  method: "online",
  meetingLink: "",
  location: "",
};

export function useCaseMeetings(caseId, canScheduleMeetings) {
  const [meetings, setMeetings] = useState([]);
  const [meetingsLoading, setMeetingsLoading] = useState(Boolean(caseId));
  const [meetingsError, setMeetingsError] = useState(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleForm, setScheduleForm] = useState(INITIAL_SCHEDULE_FORM);

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
      .catch((err) => {
        if (!cancelled) {
          setMeetingsError(err);
          setMeetings([]);
        }
      })
      .finally(() => {
        if (!cancelled) setMeetingsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [caseId]);

  const refreshMeetings = useCallback(async () => {
    if (!caseId) return;
    setMeetingsLoading(true);
    try {
      const res = await getCaseMeetings(caseId);
      const list = res?.data?.data;
      setMeetings(Array.isArray(list) ? list : []);
      setMeetingsError(null);
    } catch (err) {
      setMeetingsError(err);
      setMeetings([]);
    } finally {
      setMeetingsLoading(false);
    }
  }, [caseId]);

  // Listen for global refresh events (used by dialog after cancel)
  useEffect(() => {
    const handler = () => {
      refreshMeetings();
    };
    window.addEventListener("meetings:refresh", handler);
    return () => window.removeEventListener("meetings:refresh", handler);
  }, [refreshMeetings]);

  const handleScheduleChange = useCallback((field, value) => {
    setScheduleForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleScheduleConfirm = useCallback(async () => {
    if (!canScheduleMeetings) return;
    if (!caseId) return;
    setIsScheduling(true);
    try {
      const payload = {
        date: scheduleForm.date,
        time: scheduleForm.time,
        method: scheduleForm.method,
      };

      if (scheduleForm.method === "physical") {
        payload.location = scheduleForm.location;
      }

      await scheduleCaseMeeting(caseId, payload);
      setScheduleForm(INITIAL_SCHEDULE_FORM);
      const res = await getCaseMeetings(caseId);
      const list = res?.data?.data;
      setMeetings(Array.isArray(list) ? list : []);
      toast.success("Meeting scheduled successfully");
    } catch (err) {
      const message =
        err?.message ||
        err?.original?.response?.data?.message ||
        "Failed to schedule meeting";
      toast.error(message);
    } finally {
      setIsScheduling(false);
    }
  }, [caseId, scheduleForm, canScheduleMeetings]);

  const handleJoinMeeting = useCallback(async (meetingId) => {
    try {
      const { joinCaseMeeting } = await import("@/api/services/caseService");
      const res = await joinCaseMeeting(meetingId);
      const link = res?.data?.data?.meetingLink;
      if (!link) {
        throw new Error("Meeting link not available");
      }
      window.open(link, "_blank", "noopener,noreferrer");
    } catch (err) {
      const message =
        err?.message ||
        err?.original?.response?.data?.message ||
        "Failed to join meeting";
      toast.error(message);
    }
  }, []);

  return {
    meetings,
    meetingsLoading,
    meetingsError,
    isScheduling,
    scheduleForm,
    handleScheduleChange,
    handleScheduleConfirm,
    handleJoinMeeting,
    refreshMeetings,
  };
}
