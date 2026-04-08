import { jest } from "@jest/globals";

import Case from "../../../models/case/caseModel.js";
import CaseMeeting from "../../../models/case/caseMeeting.js";
import {
  scheduleCaseMeeting,
  getCaseMeetings,
  updateCaseMeeting,
} from "../caseMeetingService.js";

// Tests for scheduling meetings
// Schedule: behavior for creating meetings by assigned lawyer
describe("scheduleCaseMeeting", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  // 404 when case does not exist
  it("throws 404 when case not found", async () => {
    jest
      .spyOn(Case, "findById")
      .mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    await expect(
      scheduleCaseMeeting({ caseId: "c1", scheduledBy: "l1" }),
    ).rejects.toMatchObject({ message: "Case not found", statusCode: 404 });
  });

  // 400 when the case is closed
  it("throws 400 when case is closed", async () => {
    jest.spyOn(Case, "findById").mockReturnValue({
      select: jest
        .fn()
        .mockResolvedValue({ _id: "c1", status: "closed", lawyer: "l1" }),
    });

    await expect(
      scheduleCaseMeeting({ caseId: "c1", scheduledBy: "l1" }),
    ).rejects.toMatchObject({
      message: "Cannot schedule a meeting for a closed case",
      statusCode: 400,
    });
  });

  // 403 when caller is not the assigned lawyer
  it("throws 403 when scheduler is not assigned lawyer", async () => {
    jest.spyOn(Case, "findById").mockReturnValue({
      select: jest
        .fn()
        .mockResolvedValue({ _id: "c1", status: "open", lawyer: "other" }),
    });

    await expect(
      scheduleCaseMeeting({ caseId: "c1", scheduledBy: "l1" }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  // 400 when online meeting is missing meetingLink
  it("throws 400 when online method missing meetingLink", async () => {
    jest.spyOn(Case, "findById").mockReturnValue({
      select: jest
        .fn()
        .mockResolvedValue({ _id: "c1", status: "open", lawyer: "l1" }),
    });

    await expect(
      scheduleCaseMeeting({
        caseId: "c1",
        scheduledBy: "l1",
        method: "online",
      }),
    ).rejects.toMatchObject({
      message: "meetingLink is required for online meetings",
      statusCode: 400,
    });
  });

  // 400 when physical meeting is missing location
  it("throws 400 when physical method missing location", async () => {
    jest.spyOn(Case, "findById").mockReturnValue({
      select: jest
        .fn()
        .mockResolvedValue({ _id: "c1", status: "open", lawyer: "l1" }),
    });

    await expect(
      scheduleCaseMeeting({
        caseId: "c1",
        scheduledBy: "l1",
        method: "physical",
      }),
    ).rejects.toMatchObject({
      message: "location is required for physical meetings",
      statusCode: 400,
    });
  });

  // creates a meeting when inputs are valid
  it("creates meeting when valid", async () => {
    const caseObj = { _id: "c1", status: "open", lawyer: "l1" };
    jest
      .spyOn(Case, "findById")
      .mockReturnValue({ select: jest.fn().mockResolvedValue(caseObj) });

    const fakeMeeting = { _id: "m1", caseId: "c1" };
    jest.spyOn(CaseMeeting, "create").mockResolvedValue(fakeMeeting);

    const res = await scheduleCaseMeeting({
      caseId: "c1",
      scheduledBy: "l1",
      date: "2026-04-08",
      time: "10:00",
      method: "online",
      meetingLink: "link",
    });

    expect(CaseMeeting.create).toHaveBeenCalledWith(
      expect.objectContaining({ caseId: "c1" }),
    );
    expect(res).toBe(fakeMeeting);
  });
});

// Tests for retrieving meetings
// Retrieval: access control and listing of meetings
describe("getCaseMeetings", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  // 404 when case does not exist
  it("throws 404 when case not found", async () => {
    jest
      .spyOn(Case, "findById")
      .mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    await expect(
      getCaseMeetings({ caseId: "c1", currentUserId: "u1" }),
    ).rejects.toMatchObject({ message: "Case not found", statusCode: 404 });
  });

  // 403 when current user is not part of the case
  it("throws 403 when user not associated", async () => {
    jest.spyOn(Case, "findById").mockReturnValue({
      select: jest
        .fn()
        .mockResolvedValue({ _id: "c1", user: "u2", lawyer: "l2" }),
    });

    await expect(
      getCaseMeetings({ caseId: "c1", currentUserId: "u1" }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  // returns populated, sorted meetings when user is authorized
  it("returns meetings when authorized", async () => {
    jest.spyOn(Case, "findById").mockReturnValue({
      select: jest
        .fn()
        .mockResolvedValue({ _id: "c1", user: "u1", lawyer: "l1" }),
    });

    const fake = [{ _id: "m1" }];
    jest.spyOn(CaseMeeting, "find").mockReturnValue({
      populate: jest
        .fn()
        .mockReturnValue({ sort: jest.fn().mockResolvedValue(fake) }),
    });

    const res = await getCaseMeetings({ caseId: "c1", currentUserId: "u1" });

    expect(CaseMeeting.find).toHaveBeenCalledWith({ caseId: "c1" });
    expect(res).toBe(fake);
  });
});

// Tests for updating meetings
// Update: validation and permission checks for meeting edits
describe("updateCaseMeeting", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  // 404 if the meeting id does not exist
  it("throws 404 when meeting not found", async () => {
    jest.spyOn(CaseMeeting, "findById").mockResolvedValue(null);

    await expect(
      updateCaseMeeting({ meetingId: "m1", currentUserId: "l1", updates: {} }),
    ).rejects.toMatchObject({ message: "Meeting not found", statusCode: 404 });
  });

  // 404 if the associated case cannot be found
  it("throws 404 when case for meeting not found", async () => {
    const meeting = { caseId: "c1", method: "online", meetingLink: "link" };
    jest.spyOn(CaseMeeting, "findById").mockResolvedValue(meeting);
    jest
      .spyOn(Case, "findById")
      .mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    await expect(
      updateCaseMeeting({ meetingId: "m1", currentUserId: "l1", updates: {} }),
    ).rejects.toMatchObject({
      message: "Case not found for this meeting",
      statusCode: 404,
    });
  });

  // 403 when a non-assigned lawyer attempts to update
  it("throws 403 when current user is not assigned lawyer", async () => {
    const meeting = { caseId: "c1", method: "online", meetingLink: "link" };
    jest.spyOn(CaseMeeting, "findById").mockResolvedValue(meeting);
    jest.spyOn(Case, "findById").mockReturnValue({
      select: jest.fn().mockResolvedValue({ lawyer: "other" }),
    });

    await expect(
      updateCaseMeeting({ meetingId: "m1", currentUserId: "l1", updates: {} }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  // 400 when method value is invalid
  it("throws 400 for invalid method", async () => {
    const meeting = {
      caseId: "c1",
      method: "online",
      meetingLink: "link",
      save: jest.fn(),
    };
    jest.spyOn(CaseMeeting, "findById").mockResolvedValue(meeting);
    jest.spyOn(Case, "findById").mockReturnValue({
      select: jest.fn().mockResolvedValue({ lawyer: "l1" }),
    });

    await expect(
      updateCaseMeeting({
        meetingId: "m1",
        currentUserId: "l1",
        updates: { method: "invalid" },
      }),
    ).rejects.toMatchObject({
      message: "method must be either 'online' or 'physical'",
      statusCode: 400,
    });
  });

  // 400 when changing to online without meetingLink
  it("throws 400 when switching to online without meetingLink", async () => {
    const meeting = {
      caseId: "c1",
      method: "physical",
      location: "loc",
      save: jest.fn(),
    };
    jest.spyOn(CaseMeeting, "findById").mockResolvedValue(meeting);
    jest.spyOn(Case, "findById").mockReturnValue({
      select: jest.fn().mockResolvedValue({ lawyer: "l1" }),
    });

    await expect(
      updateCaseMeeting({
        meetingId: "m1",
        currentUserId: "l1",
        updates: { method: "online", meetingLink: undefined },
      }),
    ).rejects.toMatchObject({
      message: "meetingLink is required for online meetings",
      statusCode: 400,
    });
  });

  // 400 when changing to physical without location
  it("throws 400 when switching to physical without location", async () => {
    const meeting = {
      caseId: "c1",
      method: "online",
      meetingLink: "link",
      save: jest.fn(),
    };
    jest.spyOn(CaseMeeting, "findById").mockResolvedValue(meeting);
    jest.spyOn(Case, "findById").mockReturnValue({
      select: jest.fn().mockResolvedValue({ lawyer: "l1" }),
    });

    await expect(
      updateCaseMeeting({
        meetingId: "m1",
        currentUserId: "l1",
        updates: { method: "physical", location: undefined },
      }),
    ).rejects.toMatchObject({
      message: "location is required for physical meetings",
      statusCode: 400,
    });
  });

  // applies provided updates and saves the meeting
  it("applies updates and saves when valid", async () => {
    const saveMock = jest.fn().mockResolvedValue(true);
    const meeting = {
      caseId: "c1",
      method: "online",
      meetingLink: "link",
      date: "old",
      time: "old",
      save: saveMock,
    };
    jest.spyOn(CaseMeeting, "findById").mockResolvedValue(meeting);
    jest.spyOn(Case, "findById").mockReturnValue({
      select: jest.fn().mockResolvedValue({ lawyer: "l1" }),
    });

    const res = await updateCaseMeeting({
      meetingId: "m1",
      currentUserId: "l1",
      updates: {
        date: "2026-04-09",
        time: "11:00",
        method: "online",
        meetingLink: "new",
      },
    });

    expect(saveMock).toHaveBeenCalled();
    expect(res.date).toBe("2026-04-09");
    expect(res.time).toBe("11:00");
  });
});
