import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import ScheduleMeetingContent from "@/lawyer/components/cases/ScheduleMeetingContent";

export default function CaseMeetings({
  caseId,
  meetings,
  meetingsLoading,
  meetingsError,
  isScheduling,
  scheduleForm,
  timeOptions,
  onScheduleChange,
  onScheduleConfirm,
}) {
  return (
    <AlertDialog>
      <div className="space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Upcoming Meetings
            </h3>
            <p className="text-sm text-muted-foreground">
              See and schedule meetings for this case.
            </p>
          </div>
          <AlertDialogTrigger asChild>
            <Button size="sm" disabled={!caseId}>
              Schedule meeting
            </Button>
          </AlertDialogTrigger>
        </div>

        {/* Error */}
        {meetingsError && (
          <p className="text-sm text-destructive">
            {meetingsError.message || "Failed to load meetings"}
          </p>
        )}

        {/* Content */}
        {meetingsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full rounded-md" />
            <Skeleton className="h-14 w-full rounded-md" />
          </div>
        ) : meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mb-2 h-8 w-8 opacity-30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            No meetings scheduled yet.
          </div>
        ) : (
          <ul className="space-y-2">
            {meetings.map((meeting) => {
              const when = `${meeting.date} at ${meeting.time}`;
              const methodLabel =
                meeting.method === "physical" ? "In person" : "Online";
              const locationText =
                meeting.method === "physical"
                  ? meeting.location
                  : meeting.meetingLink;

              return (
                <li
                  key={meeting._id}
                  className="rounded-md border bg-background px-3 py-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-sm text-foreground">
                      {when}
                    </span>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="uppercase tracking-wide">
                        {methodLabel}
                      </span>
                      <Badge
                        variant="outline"
                        className="px-1.5 py-0 text-[10px] uppercase tracking-wide"
                      >
                        {meeting.status || "scheduled"}
                      </Badge>
                    </span>
                  </div>
                  {locationText &&
                    (meeting.method === "online" ? (
                      <a
                        href={locationText}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block break-all text-xs text-primary underline underline-offset-2"
                      >
                        {locationText}
                      </a>
                    ) : (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {locationText}
                      </p>
                    ))}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ScheduleMeetingContent
        scheduleForm={scheduleForm}
        onChange={onScheduleChange}
        onConfirm={onScheduleConfirm}
        isScheduling={isScheduling}
        timeOptions={timeOptions}
      />
    </AlertDialog>
  );
}
