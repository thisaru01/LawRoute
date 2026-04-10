import React from "react";

function MeetingInstructions({ meeting, canScheduleMeetings }) {
  if (meeting.method === "physical") return null;

  return (
    <div>
      <p className="font-medium">Instructions</p>

      {canScheduleMeetings ? (
        <ul className="list-disc ml-5 text-muted-foreground">
          <li>
            As the lawyer you may start the meeting up to 10 minutes early.
          </li>
          <li>
            When you start, you'll enter Jitsi as moderator - you can set a
            meeting password for extra security.
          </li>
          <li>Make sure your camera and microphone work before starting.</li>
        </ul>
      ) : (
        <ul className="list-disc ml-5 text-muted-foreground">
          <li>The Join button unlocks at the scheduled time.</li>
          <li>Join on time and keep your documents ready.</li>
          <li>Mute your microphone when not speaking.</li>
        </ul>
      )}
    </div>
  );
}

export default MeetingInstructions;
