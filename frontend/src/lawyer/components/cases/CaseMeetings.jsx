import { CalendarPlus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import MeetingDialog from "./meetings/MeetingDialog";
import ScheduleMeetingContent from "@/lawyer/components/cases/ScheduleMeetingContent";
import { Separator } from "@/components/ui/separator";
import { useCaseContext } from "@/lawyer/components/cases/CaseContext";
import MeetingCard from "./MeetingCard";
import MeetingCardSkeleton from "./MeetingCardSkeleton";

export default function CaseMeetings() {
  const {
    caseId,
    meetings,
    meetingsLoading,
    meetingsError,
    isScheduling,
    scheduleForm,
    timeOptions,
    handleScheduleChange,
    handleScheduleConfirm,
    normalizedStatus,
    canScheduleMeetings,
    handleJoinMeeting,
  } = useCaseContext();
  const cancelledMeetings = meetings.filter((m) => m.status === "cancelled");

  const now = new Date();
  const toDate = (m) =>
    m.date ? new Date(`${m.date}T${m.time || "00:00"}`) : null;
  const within24h = (m) => {
    const d = toDate(m);
    if (!d) return false;
    const diff = now.getTime() - d.getTime();
    return diff >= 0 && diff <= 24 * 60 * 60 * 1000;
  };

  // Upcoming: scheduled OR incomplete but not yet passed 24 hours
  const upcomingMeetings = meetings.filter((m) => {
    if (m.status === "cancelled") return false;
    if (m.status === "scheduled") return true;
    if (m.status === "incomplete") return within24h(m);
    return false;
  });

  // History: completed OR incomplete that exceeded 24 hours since scheduled time
  const pastMeetings = meetings.filter((m) => {
    if (m.status === "cancelled") return false;
    if (m.status === "completed") return true;
    if (m.status === "incomplete") return !within24h(m);
    return false;
  });

  const isAlreadyClosed = normalizedStatus === "closed";
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedMeeting, setSelectedMeeting] = React.useState(null);

  const openMeetingDialog = (meeting) => {
    setSelectedMeeting(meeting);
    setDialogOpen(true);
  };

  const closeMeetingDialog = () => {
    setDialogOpen(false);
    setTimeout(() => setSelectedMeeting(null), 200);
  };

  return (
    <AlertDialog>
      <div className="space-y-4">
        {!isAlreadyClosed && canScheduleMeetings && (
          <>
            {/* Schedule Meeting Banner */}
            <div>
              <CardContent className="flex flex-col items-center justify-center gap-4 py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <CalendarPlus className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">
                    Schedule a Meeting
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Set up an online or in-person meeting with your client.
                  </p>
                </div>
                <AlertDialogTrigger asChild>
                  <Button disabled={!caseId} className="gap-2">
                    <CalendarPlus className="h-4 w-4" />
                    Schedule meeting
                  </Button>
                </AlertDialogTrigger>
              </CardContent>
            </div>

            <Separator className="h-px" />
          </>
        )}

        {!isAlreadyClosed && (
          <>
            {/* Upcoming Meetings */}
            <div>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Upcoming meetings</CardTitle>
              </CardHeader>
              <CardContent>
                {meetingsError && (
                  <p className="text-sm text-destructive mb-3">
                    {meetingsError.message || "Failed to load meetings"}
                  </p>
                )}

                {meetingsLoading ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MeetingCardSkeleton />
                    <MeetingCardSkeleton />
                    <MeetingCardSkeleton />
                    <MeetingCardSkeleton />
                  </div>
                ) : upcomingMeetings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                    <Calendar className="mb-2 h-7 w-7 opacity-30" />
                    No upcoming meetings scheduled.
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {upcomingMeetings.map((meeting) => (
                      <MeetingCard
                        key={meeting._id}
                        meeting={meeting}
                        onJoin={handleJoinMeeting}
                        isLawyer={canScheduleMeetings}
                        onOpen={openMeetingDialog}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </div>

            <Separator />
          </>
        )}

        {/* Cancelled Meetings */}
        <div>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cancelled meetings</CardTitle>
          </CardHeader>
          <CardContent>
            {meetingsLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <MeetingCardSkeleton />
                <MeetingCardSkeleton />
              </div>
            ) : cancelledMeetings.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                <Calendar className="mb-2 h-7 w-7 opacity-30" />
                No cancelled meetings.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {cancelledMeetings.map((meeting) => (
                  <MeetingCard
                    key={meeting._id}
                    meeting={meeting}
                    onJoin={handleJoinMeeting}
                    isLawyer={canScheduleMeetings}
                    onOpen={openMeetingDialog}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </div>

        <Separator className="h-px" />

        {/* Meeting History */}
        <div>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Meeting history</CardTitle>
          </CardHeader>
          <CardContent>
            {meetingsLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <MeetingCardSkeleton />
                <MeetingCardSkeleton />
              </div>
            ) : pastMeetings.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                <Calendar className="mb-2 h-7 w-7 opacity-30" />
                No past meetings yet.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {pastMeetings.map((meeting) => (
                  <MeetingCard
                    key={meeting._id}
                    meeting={meeting}
                    onJoin={handleJoinMeeting}
                    isLawyer={canScheduleMeetings}
                    onOpen={openMeetingDialog}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </div>
      </div>

      {/* Dialog lives outside the cards so it can overlay the whole page */}
      <ScheduleMeetingContent
        scheduleForm={scheduleForm}
        onChange={handleScheduleChange}
        onConfirm={handleScheduleConfirm}
        isScheduling={isScheduling}
        timeOptions={timeOptions}
      />

      <MeetingDialog
        open={dialogOpen}
        onOpenChange={closeMeetingDialog}
        meeting={selectedMeeting}
        canScheduleMeetings={canScheduleMeetings}
        onJoin={handleJoinMeeting}
      />
    </AlertDialog>
  );
}
