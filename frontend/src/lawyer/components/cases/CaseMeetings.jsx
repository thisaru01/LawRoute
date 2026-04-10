import { CalendarPlus, Calendar, MapPin, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import MeetingDialog from "./MeetingDialog";
import ScheduleMeetingContent from "@/lawyer/components/cases/ScheduleMeetingContent";
import { Separator } from "@/components/ui/separator";
import { useCaseContext } from "@/lawyer/components/cases/CaseContext";

function MeetingCard({ meeting, onJoin, isLawyer, onOpen }) {
  const methodLabel = meeting.method === "physical" ? "In-person" : "Online";
  const isOnline = meeting.method === "online";
  const locationText = !isOnline ? meeting.location : null;
  let statusColor =
    "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
  if (meeting.status === "completed" || meeting.status === "done") {
    statusColor =
      "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300";
  } else if (meeting.status === "cancelled") {
    statusColor = "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300";
  } else if (meeting.status === "incomplete") {
    statusColor =
      "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
  }

  // allow opening the dialog for both online and in-person meetings,
  // but never for cancelled meetings
  // clickable for non-cancelled and non-completed meetings only
  const clickable =
    onOpen && meeting.status !== "cancelled" && meeting.status !== "completed";
  const className = `flex flex-col gap-2 rounded-lg border bg-background p-4 shadow-sm ${clickable ? "cursor-pointer" : ""}`;

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={() => clickable && onOpen && onOpen(meeting)}
      onKeyDown={(e) => {
        if (clickable && e.key === "Enter") onOpen && onOpen(meeting);
      }}
      className={className}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm text-foreground leading-tight">
          {methodLabel} Meeting
        </p>
        <Badge
          className={`${statusColor} shrink-0 text-[10px] uppercase tracking-wide`}
        >
          {meeting.status || "scheduled"}
        </Badge>
      </div>

      {/* Date & time */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5 shrink-0" />
        <span>
          {meeting.date} {meeting.time ? `at ${meeting.time}` : ""}
        </span>
      </div>

      {/* Link / location or join */}
      {isOnline ? (
        <OnlineMeetingActions
          meeting={meeting}
          onJoin={
            meeting.status !== "cancelled" && meeting.status !== "completed"
              ? onJoin
              : undefined
          }
          isLawyer={isLawyer}
        />
      ) : (
        locationText && (
          <div className="flex items-start gap-1.5 text-xs">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground wrap-break-words leading-snug">
              {locationText}
            </span>
          </div>
        )
      )}

      {/* Method badge */}
      <div className="mt-auto pt-1 flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wider">
        {isOnline ? (
          <Video className="h-3 w-3" />
        ) : (
          <MapPin className="h-3 w-3" />
        )}
        {methodLabel}
      </div>
    </div>
  );
}

function OnlineMeetingActions({ meeting, onJoin, isLawyer }) {
  const now = new Date();
  const meetingDate = meeting.date
    ? new Date(`${meeting.date}T${meeting.time || "00:00"}`)
    : null;

  if (meeting.status === "cancelled") {
    return (
      <div className="text-sm text-muted-foreground">
        This meeting has been cancelled.
      </div>
    );
  }

  if (meeting.status === "completed") {
    return (
      <div className="text-sm text-muted-foreground">
        This meeting is completed.
      </div>
    );
  }

  if (!meetingDate) {
    return (
      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <p className="leading-snug">
          A secure video link will be available when the meeting starts.
        </p>
      </div>
    );
  }

  const diffMs = meetingDate.getTime() - now.getTime();
  const diffMinutes = diffMs / 60000;

  // Lawyer: unlocked 10 minutes before start (diffMinutes <= 10)
  const lawyerUnlocked = isLawyer && diffMinutes <= 10;
  // Citizen: unlocked at or after start (diffMinutes <= 0)
  const citizenUnlocked = !isLawyer && diffMinutes <= 0;

  const disabled = isLawyer ? !lawyerUnlocked : !citizenUnlocked;
  const label = isLawyer ? "Start" : "Join";
  let infoText = isLawyer
    ? "The Start button will unlock 10 minutes before the scheduled time."
    : "The Join button will unlock when the meeting starts.";

  // When unlocked, show actionable instruction
  if (isLawyer && lawyerUnlocked) {
    infoText =
      "Click Start to begin the meeting (you can set a Jitsi password).";
  }

  if (!isLawyer && citizenUnlocked) {
    infoText = "Click Join to enter the meeting.";
  }

  return (
    <div className="flex items-start justify-between gap-2 text-xs">
      <p className="text-muted-foreground leading-snug">{infoText}</p>
      {onJoin && (
        <Button
          size="xs"
          variant="outline"
          className="shrink-0 text-[11px]"
          onClick={(e) => {
            e.stopPropagation();
            onJoin(meeting._id);
          }}
          disabled={disabled}
        >
          {label}
        </Button>
      )}
    </div>
  );
}

function MeetingCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-background p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-3 w-40" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

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
