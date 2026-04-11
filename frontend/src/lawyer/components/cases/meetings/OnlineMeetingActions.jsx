import React from "react";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import ScheduleMeetingContent from "@/lawyer/components/cases/meetings/ScheduleMeetingContent";
import { toast } from "sonner";
import { updateCaseMeeting } from "@/api/services/caseService";
import ConfirmDialog from "@/components/consultation-requests/ConfirmDialog";

// Action buttons inside MeetingDialog for online meetings (update/cancel/join)
function OnlineMeetingActions({
  meeting,
  canScheduleMeetings,
  scheduleForm,
  setScheduleForm,
  isUpdating,
  setIsUpdating,
  editOpen,
  setEditOpen,
  onClose,
  onJoin,
}) {
  if (meeting.method !== "online") return null;

  const now = new Date();
  const meetingDate = meeting.date
    ? new Date(`${meeting.date}T${meeting.time || "00:00"}`)
    : null;
  const diffMinutes = meetingDate
    ? (meetingDate.getTime() - now.getTime()) / 60000
    : Infinity;

  const isLawyer = Boolean(canScheduleMeetings);
  const lawyerUnlocked = isLawyer && diffMinutes <= 10;
  const citizenUnlocked = !isLawyer && diffMinutes <= 0;

  const joinDisabled =
    meeting.status === "cancelled" ||
    meeting.status === "completed" ||
    !meetingDate ||
    (isLawyer ? !lawyerUnlocked : !citizenUnlocked);

  const handleJoin = () => {
    if (joinDisabled) return;
    onClose();
    onJoin && onJoin(meeting._id);
  };

  // For citizens: single Join button that respects unlock rules
  if (!canScheduleMeetings) {
    return (
      <Button onClick={handleJoin} disabled={joinDisabled}>
        Join
      </Button>
    );
  }

  const cancelAllowedLocal = diffMinutes > 24 * 60;
  const updateAllowedLocal = diffMinutes > 24 * 60;

  // Inside 24h window: block cancellation with an explanatory button
  if (!cancelAllowedLocal) {
    return (
      <>
        <Button
          variant="destructive"
          className="mr-2"
          onClick={() =>
            toast.error(
              "Cannot cancel meetings within 24 hours of the start time.",
            )
          }
        >
          Cancel Meeting
        </Button>
        <Button onClick={handleJoin} disabled={joinDisabled}>
          Start / Join
        </Button>
      </>
    );
  }

  const updateButton = !updateAllowedLocal ? (
    <Button
      className="mr-2 bg-amber-50 text-amber-700 hover:bg-amber-100"
      onClick={() =>
        toast.error("Cannot update meetings within 24 hours of the start time.")
      }
    >
      Update Meeting
    </Button>
  ) : (
    <AlertDialog open={editOpen} onOpenChange={setEditOpen}>
      <AlertDialogTrigger asChild>
        <Button className="mr-2 bg-amber-50 text-amber-700 hover:bg-amber-100">
          Update Meeting
        </Button>
      </AlertDialogTrigger>

      <ScheduleMeetingContent
        scheduleForm={scheduleForm}
        onChange={(field, value) =>
          setScheduleForm((p) => ({ ...p, [field]: value }))
        }
        onConfirm={async () => {
          setIsUpdating(true);
          try {
            const meetingDateNew = new Date(
              `${scheduleForm.date}T${scheduleForm.time}`,
            );
            if (Number.isNaN(meetingDateNew.getTime())) {
              throw new Error("Invalid date or time");
            }
            const nowLocal2 = new Date();
            if (meetingDateNew.getTime() <= nowLocal2.getTime()) {
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
            setEditOpen(false);
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
        }}
        isScheduling={isUpdating}
        title="Update meeting"
        confirmLabel="Update meeting"
      />
    </AlertDialog>
  );

  return (
    <>
      {updateButton}
      <ConfirmDialog
        trigger={
          <Button variant="destructive" className="mr-2">
            Cancel Meeting
          </Button>
        }
        title="Cancel this meeting?"
        description={
          "Are you sure you want to cancel this meeting? This action cannot be undone."
        }
        confirmLabel="Yes, cancel"
        confirmClass="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        onConfirm={async () => {
          try {
            await updateCaseMeeting(meeting._id, {
              status: "cancelled",
            });
            toast.success("Meeting cancelled");
            window.dispatchEvent(new CustomEvent("meetings:refresh"));
          } catch (err) {
            toast.error(
              err.response?.data?.message ||
                err.message ||
                "Failed to cancel meeting",
            );
          }
        }}
      />
      <Button onClick={handleJoin} disabled={joinDisabled}>
        Start / Join
      </Button>
    </>
  );
}

export default OnlineMeetingActions;
