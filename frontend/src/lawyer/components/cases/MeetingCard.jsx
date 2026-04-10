import React from "react";
import { Calendar, MapPin, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

  const lawyerUnlocked = isLawyer && diffMinutes <= 10;
  const citizenUnlocked = !isLawyer && diffMinutes <= 0;

  const disabled = isLawyer ? !lawyerUnlocked : !citizenUnlocked;
  const label = isLawyer ? "Start" : "Join";
  let infoText = isLawyer
    ? "The Start button will unlock 10 minutes before the scheduled time."
    : "The Join button will unlock when the meeting starts.";

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

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5 shrink-0" />
        <span>
          {meeting.date} {meeting.time ? `at ${meeting.time}` : ""}
        </span>
      </div>

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

export default MeetingCard;
