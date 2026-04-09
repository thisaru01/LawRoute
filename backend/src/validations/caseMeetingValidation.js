const VALID_METHODS = ["online", "physical"];
const VALID_STATUSES = ["scheduled", "completed", "cancelled"];

const isObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value);

const hasOnlyAllowedKeys = (obj, allowedFields) =>
  Object.keys(obj).every((key) => allowedFields.includes(key));

// Validate body for creating (scheduling) a meeting
export const validateCreateCaseMeeting = (req, res, next) => {
  const { body } = req;

  if (!isObject(body)) {
    return res.status(400).json({
      success: false,
      message: "Request body must be a JSON object",
    });
  }

  const allowedFields = ["date", "time", "method", "location"];

  if (!hasOnlyAllowedKeys(body, allowedFields)) {
    return res.status(400).json({
      success: false,
      message: "Request contains invalid fields",
    });
  }

  const { date, time, method, location } = body;

  if (!date || typeof date !== "string" || !date.trim()) {
    return res.status(400).json({
      success: false,
      message: "Date is required",
    });
  }

  if (!time || typeof time !== "string" || !time.trim()) {
    return res.status(400).json({
      success: false,
      message: "Time is required",
    });
  }

  if (!method || typeof method !== "string" || !method.trim()) {
    return res.status(400).json({
      success: false,
      message: "Method is required",
    });
  }

  if (!VALID_METHODS.includes(method)) {
    return res.status(400).json({
      success: false,
      message: "Method must be either 'online' or 'physical'",
    });
  }

  if (method === "physical") {
    if (!location || typeof location !== "string" || !location.trim()) {
      return res.status(400).json({
        success: false,
        message: "Location is required for physical meetings",
      });
    }
  }

  return next();
};

// Validate body for updating a meeting
export const validateUpdateCaseMeeting = (req, res, next) => {
  const { body } = req;

  if (!isObject(body)) {
    return res.status(400).json({
      success: false,
      message: "Request body must be a JSON object",
    });
  }

  const allowedFields = [
    "date",
    "time",
    "method",
    "meetingLink",
    "location",
    "status",
  ];

  if (!hasOnlyAllowedKeys(body, allowedFields)) {
    return res.status(400).json({
      success: false,
      message: "Request contains invalid fields",
    });
  }

  if (Object.keys(body).length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one field is required to update the meeting",
    });
  }

  const { method, status, meetingLink, location } = body;

  if (method !== undefined) {
    if (typeof method !== "string" || !method.trim()) {
      return res.status(400).json({
        success: false,
        message: "Method must be a non-empty string",
      });
    }

    if (!VALID_METHODS.includes(method)) {
      return res.status(400).json({
        success: false,
        message: "method must be either 'online' or 'physical'",
      });
    }
  }

  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }
  }

  if (method === "online") {
    if (meetingLink !== undefined) {
      if (typeof meetingLink !== "string" || !meetingLink.trim()) {
        return res.status(400).json({
          success: false,
          message: "MeetingLink must be a non-empty string when provided",
        });
      }
    }
  }

  if (method === "physical") {
    if (location !== undefined) {
      if (typeof location !== "string" || !location.trim()) {
        return res.status(400).json({
          success: false,
          message: "Location must be a non-empty string when provided",
        });
      }
    }
  }

  return next();
};
