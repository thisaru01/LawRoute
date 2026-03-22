// Email templates for Civil Issue events.

/**
 * Builds the confirmation email sent to a citizen after they update their civil issue.
 */
export function issueUpdatedCitizenTemplate({ category, district, description }) {
  return {
    subject: `Your Civil Issue Has Been Updated — LawRoute`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #1e3a5f;">LawRoute — Issue Update Confirmed</h2>
        <p>Your civil issue has been updated successfully. Here are the current details:</p>

        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 8px; background: #f3f4f6; font-weight: bold; width: 40%;">Category</td>
            <td style="padding: 8px;">${category}</td>
          </tr>
          <tr>
            <td style="padding: 8px; background: #f3f4f6; font-weight: bold;">District</td>
            <td style="padding: 8px;">${district}</td>
          </tr>
          <tr>
            <td style="padding: 8px; background: #f3f4f6; font-weight: bold;">Description</td>
            <td style="padding: 8px;">${description}</td>
          </tr>
        </table>

        <p style="color: #6b7280; font-size: 13px;">
          If you did not make this change, please contact support immediately.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">This is an automated message from LawRoute. Please do not reply to this email.</p>
      </div>
    `,
  };
}


// Template sent to the citizen when an authority updates their issue's status.
export function statusUpdateTemplate({ category, district, oldStatus, newStatus }) {
  const statusColor = {
    pending: "#f59e0b",
    "in-progress": "#3b82f6",
    resolved: "#22c55e",
    rejected: "#ef4444",
  };

  const color = statusColor[newStatus] || "#6b7280";

  return {
    subject: `Your Civil Issue Status Has Been Updated — LawRoute`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #1e3a5f;">LawRoute — Civil Issue Update</h2>
        <p>Your reported civil issue has been reviewed by the assigned authority.</p>

        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 8px; background: #f3f4f6; font-weight: bold; width: 40%;">Category</td>
            <td style="padding: 8px;">${category}</td>
          </tr>
          <tr>
            <td style="padding: 8px; background: #f3f4f6; font-weight: bold;">District</td>
            <td style="padding: 8px;">${district}</td>
          </tr>
          <tr>
            <td style="padding: 8px; background: #f3f4f6; font-weight: bold;">Previous Status</td>
            <td style="padding: 8px; text-transform: capitalize;">${oldStatus}</td>
          </tr>
          <tr>
            <td style="padding: 8px; background: #f3f4f6; font-weight: bold;">New Status</td>
            <td style="padding: 8px;">
              <span style="background: ${color}; color: #fff; padding: 4px 12px; border-radius: 12px; font-size: 13px; text-transform: capitalize;">
                ${newStatus}
              </span>
            </td>
          </tr>
        </table>

        <p style="color: #6b7280; font-size: 13px;">
          You can log in to LawRoute to view the full details of your issue.<br/>
          If you have any concerns, please contact the relevant authority through the platform.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">This is an automated message from LawRoute. Please do not reply to this email.</p>
      </div>
    `,
  };
}
