import React from "react";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import ScheduleMeetingContent from "@/lawyer/components/cases/meetings/ScheduleMeetingContent";
import { toast } from "sonner";
import { updateCaseMeeting } from "@/api/services/caseService";

// Action buttons inside MeetingDialog for physical meetings (update/cancel)
function PhysicalMeetingActions({
  meeting,
  canScheduleMeetings,
  scheduleForm,
  setScheduleForm,
  isUpdating,
  setIsUpdating,
  onClose,
}) {
  if (meeting.method !== "physical" || !canScheduleMeetings) return null;

  // Update handler uses same 24h and "no past" rules as online meetings
  const handleUpdate = async () => {
    const now = new Date();
    const meetingDateOrig = meeting.date
      ? new Date(`${meeting.date}T${meeting.time || "00:00"}`)
      : null;
    const diffMinutes = meetingDateOrig
      ? (meetingDateOrig.getTime() - now.getTime()) / 60000
      : Infinity;
    const updateAllowed = diffMinutes > 24 * 60;
    if (!updateAllowed) {
      toast.error("Cannot update meetings within 24 hours of the start time.");
      return;
    }

    setIsUpdating(true);
    try {
      const meetingDateNew = new Date(
        `${scheduleForm.date}T${scheduleForm.time}`,
      );
      if (Number.isNaN(meetingDateNew.getTime())) {
        throw new Error("Invalid date or time");
      }
      if (meetingDateNew.getTime() <= now.getTime()) {
        throw new Error("Cannot set meeting in the past");
      }

      await updateCaseMeeting(meeting._id, {
        date: scheduleForm.date,
        time: scheduleForm.time,
        method: scheduleForm.method,
        ...(scheduleForm.method === "physical" && {
          location: scheduleForm.location,
        }),
      });
      toast.success("Meeting updated");
      onClose();
      window.dispatchEvent(new CustomEvent("meetings:refresh"));
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to update meeting",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Cancel handler obeys 24h rule and confirms via window.confirm
  const handleCancel = async () => {
    const now = new Date();
    const meetingDate = meeting.date
      ? new Date(`${meeting.date}T${meeting.time || "00:00"}`)
      : null;
    const diffMinutes = meetingDate
      ? (meetingDate.getTime() - now.getTime()) / 60000
      : Infinity;
    const cancelAllowed = diffMinutes > 24 * 60;
    if (!cancelAllowed) {
      toast.error("Cannot cancel meetings within 24 hours of the start time.");
      return;
    }

    const ok = window.confirm("Are you sure you want to cancel this meeting?");
    if (!ok) return;

    try {
      await updateCaseMeeting(meeting._id, {
        status: "cancelled",
      });
      toast.success("Meeting cancelled");
      onClose();
      window.dispatchEvent(new CustomEvent("meetings:refresh"));
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to cancel meeting",
      );
    }
  };

  return (
    <div className="flex gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className="bg-amber-50 text-amber-700 hover:bg-amber-100">
            Update Meeting
          </Button>
        </AlertDialogTrigger>

        <ScheduleMeetingContent
          scheduleForm={scheduleForm}
          onChange={(field, value) =>
            setScheduleForm((p) => ({ ...p, [field]: value }))
          }
          onConfirm={handleUpdate}
          isScheduling={isUpdating}
          title="Update meeting"
          confirmLabel="Update meeting"
        />
      </AlertDialog>

      <Button variant="destructive" onClick={handleCancel}>
        Cancel Meeting
      </Button>
    </div>
  );
}

export default PhysicalMeetingActions;
