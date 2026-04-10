import React from "react";

// Static informational block about where/how the meeting happens
function MeetingDetails({ meeting }) {
  return (
    <div>
      <p className="font-medium">Details</p>
      {meeting.method === "physical" ? (
        <>
          <p className="text-muted-foreground">Location: {meeting.location}</p>
          {meeting.contactInfo && (
            <p className="text-muted-foreground">
              Contact: {meeting.contactInfo}
            </p>
          )}
        </>
      ) : (
        <p className="text-muted-foreground">
          This is an online meeting using Jitsi. The join link is kept private
          and will be provided when you click Start.
        </p>
      )}
    </div>
  );
}

export default MeetingDetails;
