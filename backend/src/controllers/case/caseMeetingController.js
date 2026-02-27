import * as caseMeetingService from "../../services/case/caseMeetingService.js";

// Schedule a meeting for a case (assigned lawyer only)
export const scheduleCaseMeeting = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { id } = req.params;
    const { date, time, method, meetingLink, location } = req.body;

    if (!date || !time || !method) {
      return res.status(400).json({
        success: false,
        message: "date, time and method are required",
      });
    }

    if (!["online", "physical"].includes(method)) {
      return res.status(400).json({
        success: false,
        message: "method must be either 'online' or 'physical'",
      });
    }

    if (method === "online" && !meetingLink) {
      return res.status(400).json({
        success: false,
        message: "meetingLink is required for online meetings",
      });
    }

    if (method === "physical" && !location) {
      return res.status(400).json({
        success: false,
        message: "location is required for physical meetings",
      });
    }

    const meeting = await caseMeetingService.scheduleCaseMeeting({
      caseId: id,
      scheduledBy: req.user._id,
      date,
      time,
      method,
      meetingLink,
      location,
    });

    return res.status(201).json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    return next(error);
  }
};

// Get all meetings for a case (associated citizen or lawyer)
export const getCaseMeetings = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { id } = req.params;

    const meetings = await caseMeetingService.getCaseMeetings({
      caseId: id,
      currentUserId: req.user._id,
    });

    return res.status(200).json({
      success: true,
      data: meetings,
    });
  } catch (error) {
    return next(error);
  }
};

// Update a meeting (assigned lawyer only)
export const updateCaseMeeting = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { id } = req.params;
    const { date, time, method, meetingLink, location, status } = req.body;

    const updates = {};
    if (date !== undefined) updates.date = date;
    if (time !== undefined) updates.time = time;
    if (method !== undefined) updates.method = method;
    if (meetingLink !== undefined) updates.meetingLink = meetingLink;
    if (location !== undefined) updates.location = location;
    if (status !== undefined) updates.status = status;

    const meeting = await caseMeetingService.updateCaseMeeting({
      meetingId: id,
      currentUserId: req.user._id,
      updates,
    });

    return res.status(200).json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    return next(error);
  }
};
