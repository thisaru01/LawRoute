import React from "react";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import ScheduleMeetingContent from "@/lawyer/components/cases/ScheduleMeetingContent";
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
import ConfirmDialog from "@/components/consultation-requests/ConfirmDialog";

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

          {canMarkCompleted && (
            <ConfirmDialog
              trigger={
                <Button variant="secondary" className="mr-2">
                  Mark as completed
                </Button>
              }
              title="Mark meeting as completed?"
              description={
                "This will mark the meeting as completed. You can still add notes afterwards."
              }
              confirmLabel="Yes, mark completed"
              confirmClass="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              onConfirm={async () => {
                try {
                  await updateCaseMeeting(meeting._id, { status: "completed" });
                  toast.success("Meeting marked as completed");
                  close();
                  window.dispatchEvent(new CustomEvent("meetings:refresh"));
                } catch (err) {
                  toast.error(
                    err.response?.data?.message ||
                      err.message ||
                      "Failed to update meeting",
                  );
                }
              }}
            />
          )}

          {meeting.method === "online" && (
            <>
              {canScheduleMeetings &&
                (() => {
                  const nowLocal = new Date();
                  const meetingDateLocal = meeting.date
                    ? new Date(`${meeting.date}T${meeting.time || "00:00"}`)
                    : null;
                  const diffMinutesLocal = meetingDateLocal
                    ? (meetingDateLocal.getTime() - nowLocal.getTime()) / 60000
                    : Infinity;
                  const cancelAllowedLocal = diffMinutesLocal > 24 * 60;
                  const updateAllowedLocal = diffMinutesLocal > 24 * 60;

                  if (!cancelAllowedLocal) {
                    return (
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
                    );
                  }
                  // Show Update button when allowed (uses the same 24h rule)
                  const updateButton = !updateAllowedLocal ? (
                    <Button
                      className="mr-2 bg-amber-50 text-amber-700 hover:bg-amber-100"
                      onClick={() =>
                        toast.error(
                          "Cannot update meetings within 24 hours of the start time.",
                        )
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
                            // Prevent scheduling in the past
                            const meetingDateNew = new Date(
                              `${scheduleForm.date}T${scheduleForm.time}`,
                            );
                            if (Number.isNaN(meetingDateNew.getTime())) {
                              throw new Error("Invalid date or time");
                            }
                            const nowLocal2 = new Date();
                            if (
                              meetingDateNew.getTime() <= nowLocal2.getTime()
                            ) {
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
                            close();
                            window.dispatchEvent(
                              new CustomEvent("meetings:refresh"),
                            );
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
                            close();
                            window.dispatchEvent(
                              new CustomEvent("meetings:refresh"),
                            );
                          } catch (err) {
                            toast.error(
                              err.response?.data?.message ||
                                err.message ||
                                "Failed to cancel meeting",
                            );
                          }
                        }}
                      />
                    </>
                  );
                })()}

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
                  onConfirm={async () => {
                    // Use same 24h rule as cancel: original meeting must be >24h away
                    const now = new Date();
                    const meetingDateOrig = meeting.date
                      ? new Date(`${meeting.date}T${meeting.time || "00:00"}`)
                      : null;
                    const diffMinutes = meetingDateOrig
                      ? (meetingDateOrig.getTime() - now.getTime()) / 60000
                      : Infinity;
                    const updateAllowed = diffMinutes > 24 * 60;
                    if (!updateAllowed) {
                      toast.error(
                        "Cannot update meetings within 24 hours of the start time.",
                      );
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
                      close();
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
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
