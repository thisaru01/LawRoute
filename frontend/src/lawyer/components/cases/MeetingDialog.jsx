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
import { toast } from "sonner";
import { updateCaseMeeting } from "@/api/services/caseService";

export default function MeetingDialog({
  open,
  onOpenChange,
  meeting,
  canScheduleMeetings,
  onJoin,
}) {
  const close = () => onOpenChange(false);

  if (!meeting) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-150"> </DialogContent>
      </Dialog>
    );
  }

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
          <div>
            <p className="font-medium">Details</p>
            {meeting.method === "physical" ? (
              <>
                <p className="text-muted-foreground">
                  Location: {meeting.location}
                </p>
                {meeting.contactInfo && (
                  <p className="text-muted-foreground">
                    Contact: {meeting.contactInfo}
                  </p>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">
                This is an online meeting using Jitsi. The join link is kept
                private and will be provided when you click Start.
              </p>
            )}
          </div>

          {meeting.method !== "physical" && (
            <div>
              <p className="font-medium">Instructions</p>

              {canScheduleMeetings ? (
                <ul className="list-disc ml-5 text-muted-foreground">
                  <li>
                    As the lawyer you may start the meeting up to 10 minutes
                    early.
                  </li>
                  <li>
                    When you start, you'll enter Jitsi as moderator - you can
                    set a meeting password for extra security.
                  </li>
                  <li>
                    Make sure your camera and microphone work before starting.
                  </li>
                </ul>
              ) : (
                <ul className="list-disc ml-5 text-muted-foreground">
                  <li>The Join button unlocks at the scheduled time.</li>
                  <li>Join on time and keep your documents ready.</li>
                  <li>Mute your microphone when not speaking.</li>
                </ul>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Close
          </Button>

          {meeting.method === "online" && (
            <>
              {canScheduleMeetings && (
                <Button
                  variant="destructive"
                  className="mr-2"
                  onClick={async () => {
                    const now = new Date();
                    const meetingDate = meeting.date
                      ? new Date(`${meeting.date}T${meeting.time || "00:00"}`)
                      : null;
                    const diffMinutes = meetingDate
                      ? (meetingDate.getTime() - now.getTime()) / 60000
                      : Infinity;
                    const cancelAllowed = diffMinutes > 24 * 60;
                    if (!cancelAllowed) {
                      toast.error(
                        "Cannot cancel meetings within 24 hours of the start time.",
                      );
                      return;
                    }

                    const ok = window.confirm(
                      "Are you sure you want to cancel this meeting?",
                    );
                    if (!ok) return;

                    try {
                      await updateCaseMeeting(meeting._id, {
                        status: "cancelled",
                      });
                      toast.success("Meeting cancelled");
                      close();
                      window.dispatchEvent(new CustomEvent("meetings:refresh"));
                    } catch (err) {
                      toast.error(
                        err.response?.data?.message ||
                          err.message ||
                          "Failed to cancel meeting",
                      );
                    }
                  }}
                >
                  Cancel Meeting
                </Button>
              )}

              <Button
                onClick={() => {
                  close();
                  onJoin && onJoin(meeting._id);
                }}
              >
                {canScheduleMeetings ? "Start / Join" : "Join"}
              </Button>
            </>
          )}

          {meeting.method === "physical" && canScheduleMeetings && (
            <Button
              variant="destructive"
              onClick={async () => {
                const now = new Date();
                const meetingDate = meeting.date
                  ? new Date(`${meeting.date}T${meeting.time || "00:00"}`)
                  : null;
                const diffMinutes = meetingDate
                  ? (meetingDate.getTime() - now.getTime()) / 60000
                  : Infinity;
                const cancelAllowed = diffMinutes > 24 * 60;
                if (!cancelAllowed) {
                  toast.error(
                    "Cannot cancel meetings within 24 hours of the start time.",
                  );
                  return;
                }

                const ok = window.confirm(
                  "Are you sure you want to cancel this meeting?",
                );
                if (!ok) return;

                try {
                  await updateCaseMeeting(meeting._id, { status: "cancelled" });
                  toast.success("Meeting cancelled");
                  close();
                  window.dispatchEvent(new CustomEvent("meetings:refresh"));
                } catch (err) {
                  toast.error(
                    err.response?.data?.message ||
                      err.message ||
                      "Failed to cancel meeting",
                  );
                }
              }}
            >
              Cancel Meeting
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
