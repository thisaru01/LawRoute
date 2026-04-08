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

  const handleScheduleChange = useCallback((field, value) => {
    setScheduleForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleScheduleConfirm = useCallback(async () => {
    if (!canScheduleMeetings) return;
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
      const message =
        err?.message ||
        err?.original?.response?.data?.message ||
        "Failed to schedule meeting";
      toast.error(message);
    } finally {
      setIsScheduling(false);
    }
  }, [caseId, scheduleForm, canScheduleMeetings]);

  return {
    meetings,
    meetingsLoading,
    meetingsError,
    isScheduling,
    scheduleForm,
    handleScheduleChange,
    handleScheduleConfirm,
  };
}
