import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import MeetingDetails from "./meeting-dialog/MeetingDetails";
import MeetingInstructions from "./meeting-dialog/MeetingInstructions";
import MarkCompletedButton from "./meeting-dialog/MarkCompletedButton";
import OnlineMeetingActions from "./OnlineMeetingActions";
import PhysicalMeetingActions from "./PhysicalMeetingActions";

//  dialog showing details + controls for a single meeting
export default function MeetingDialog({
  open,
  onOpenChange,
  meeting,
  canScheduleMeetings,
  onJoin,
}) {
  const close = () => onOpenChange(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [scheduleForm, setScheduleForm] = React.useState({
    date: "",
    time: "",
    method: "online",
    location: "",
  });

  // When a meeting is loaded, sync its values into the local form state
  React.useEffect(() => {
    if (!meeting) return;
    setScheduleForm({
      date: meeting.date || "",
      time: meeting.time || "",
      method: meeting.method || "online",
      location: meeting.location || "",
    });
  }, [meeting]);

  if (!meeting) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-150"> </DialogContent>
      </Dialog>
    );
  }

  const now = new Date();
  const meetingDate = meeting.date
    ? new Date(`${meeting.date}T${meeting.time || "00:00"}`)
    : null;
  const diffMinutes = meetingDate
    ? (meetingDate.getTime() - now.getTime()) / 60000
    : Infinity;
  // Only allow marking completed once time has passed and it's not cancelled
  const canMarkCompleted =
    canScheduleMeetings &&
    meeting.status !== "completed" &&
    meeting.status !== "cancelled" &&
    meetingDate &&
    diffMinutes <= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>
            {meeting.method === "online"
              ? "Online Meeting"
              : "In-person Meeting"}
          </DialogTitle>
          <DialogDescription>
            {meeting.date} {meeting.time ? `at ${meeting.time}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          <MeetingDetails meeting={meeting} />
          <MeetingInstructions
            meeting={meeting}
            canScheduleMeetings={canScheduleMeetings}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Close
          </Button>

          <MarkCompletedButton
            canMarkCompleted={canMarkCompleted}
            meetingId={meeting._id}
            onAfterUpdate={close}
          />

          <OnlineMeetingActions
            meeting={meeting}
            canScheduleMeetings={canScheduleMeetings}
            scheduleForm={scheduleForm}
            setScheduleForm={setScheduleForm}
            isUpdating={isUpdating}
            setIsUpdating={setIsUpdating}
            editOpen={editOpen}
            setEditOpen={setEditOpen}
            onClose={close}
            onJoin={onJoin}
          />

          <PhysicalMeetingActions
            meeting={meeting}
            canScheduleMeetings={canScheduleMeetings}
            scheduleForm={scheduleForm}
            setScheduleForm={setScheduleForm}
            isUpdating={isUpdating}
            setIsUpdating={setIsUpdating}
            onClose={close}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
