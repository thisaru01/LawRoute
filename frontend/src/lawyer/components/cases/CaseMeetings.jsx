import { CalendarPlus, Calendar, Link2, MapPin, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import ScheduleMeetingContent from "@/lawyer/components/cases/ScheduleMeetingContent";
import { Separator } from "@/components/ui/separator";
import { useCaseContext } from "@/lawyer/components/cases/CaseContext";

function isPast(meeting) {
  if (!meeting.date) return false;
  const meetingDate = new Date(`${meeting.date}T${meeting.time || "00:00"}`);
  return meetingDate < new Date();
}

function MeetingCard({ meeting }) {
  const methodLabel = meeting.method === "physical" ? "In-person" : "Online";
  const locationText =
    meeting.method === "physical" ? meeting.location : meeting.meetingLink;
  const isOnline = meeting.method === "online";
  const statusColor =
    meeting.status === "completed" || meeting.status === "done"
      ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
      : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300";

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-background p-4 shadow-sm">
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

      {/* Link / location */}
      {locationText && (
        <div className="flex items-start gap-1.5 text-xs">
          {isOnline ? (
            <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}
          {isOnline ? (
            <a
              href={locationText}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-primary underline underline-offset-2 leading-snug"
            >
              {locationText}
            </a>
          ) : (
            <span className="text-muted-foreground wrap-break-words leading-snug">
              {locationText}
            </span>
          )}
        </div>
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
  } = useCaseContext();
  const upcomingMeetings = meetings.filter((m) => !isPast(m));
  const pastMeetings = meetings.filter((m) => isPast(m));

  const isAlreadyClosed = normalizedStatus === "closed";

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

            <Separator />
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
                      <MeetingCard key={meeting._id} meeting={meeting} />
                    ))}
                  </div>
                )}
              </CardContent>
            </div>

            <Separator />
          </>
        )}

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
                  <MeetingCard key={meeting._id} meeting={meeting} />
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
    </AlertDialog>
  );
}
