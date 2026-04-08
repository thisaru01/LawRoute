import { jest } from "@jest/globals";

import ConsultationRequest from "../../../models/consultation/consultationRequestModel.js";
import User from "../../../models/userModel.js";
import {
  createConsultationRequest,
  updateConsultationRequest,
  deleteConsultationRequest,
  getConsultationRequestByIdForUser,
} from "../citizenConsultationRequestService.js";

// Tests validation and creation behavior for `createConsultationRequest`
describe("createConsultationRequest", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("throws 400 if summary is missing or blank", async () => {
    // should fail when summary is blank
    await expect(
      createConsultationRequest({
        userId: "user1",
        summary: "   ",
        lawyerId: "lawyer1",
      }),
    ).rejects.toMatchObject({
      message: "Summary is required",
      statusCode: 400,
    });
  });

  it("throws 400 if lawyerId is missing", async () => {
    // should fail when no lawyerId provided
    await expect(
      createConsultationRequest({
        userId: "user1",
        summary: "Need help",
      }),
    ).rejects.toMatchObject({
      message: "A lawyer must be selected",
      statusCode: 400,
    });
  });

  it("throws 400 if selected user is not a lawyer", async () => {
    // should reject when found user exists but is not role 'lawyer'
    jest.spyOn(User, "findById").mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: "lawyer1", role: "user" }),
    });

    await expect(
      createConsultationRequest({
        userId: "user1",
        summary: "Need help",
        lawyerId: "lawyer1",
      }),
    ).rejects.toMatchObject({
      message: "Selected user is not a lawyer",
      statusCode: 400,
    });

    expect(User.findById).toHaveBeenCalledWith("lawyer1");
  });

  it("creates a consultation request when data is valid", async () => {
    // should create request and trim summary when inputs valid
    jest.spyOn(User, "findById").mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: "lawyer1", role: "lawyer" }),
    });

    const fakeRequest = {
      _id: "req1",
      user: "user1",
      lawyer: "lawyer1",
      summary: "Need legal advice",
    };

    jest.spyOn(ConsultationRequest, "create").mockResolvedValue(fakeRequest);

    const result = await createConsultationRequest({
      userId: "user1",
      summary: "  Need legal advice  ",
      lawyerId: "lawyer1",
    });

    expect(User.findById).toHaveBeenCalledWith("lawyer1");
    expect(ConsultationRequest.create).toHaveBeenCalledWith({
      user: "user1",
      lawyer: "lawyer1",
      summary: "Need legal advice",
    });
    expect(result).toBe(fakeRequest);
  });
});

// Tests validation and update behavior for `updateConsultationRequest`
describe("updateConsultationRequest", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("throws 400 if summary is missing or blank", async () => {
    // checks: summary is required on update
    await expect(
      updateConsultationRequest({
        requestId: "r1",
        currentUserId: "u1",
        summary: "   ",
      }),
    ).rejects.toMatchObject({
      message: "Summary is required",
      statusCode: 400,
    });
  });

  it("throws 404 when request not found", async () => {
    // checks: 404 when DB returns no request
    jest.spyOn(ConsultationRequest, "findById").mockResolvedValue(null);

    await expect(
      updateConsultationRequest({
        requestId: "r-not",
        currentUserId: "u1",
        summary: "ok",
      }),
    ).rejects.toMatchObject({
      message: "Request not found",
      statusCode: 404,
    });
  });

  it("throws 403 when current user is not the creator", async () => {
    // checks: non-creator cannot update
    jest
      .spyOn(ConsultationRequest, "findById")
      .mockResolvedValue({ user: "otherUser", status: "pending" });

    await expect(
      updateConsultationRequest({
        requestId: "r1",
        currentUserId: "u1",
        summary: "ok",
      }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("throws 400 when request is not pending", async () => {
    // checks: only pending requests can be updated
    jest
      .spyOn(ConsultationRequest, "findById")
      .mockResolvedValue({
        user: "u1",
        status: "accepted",
        save: jest.fn(),
        _id: "r1",
      });

    await expect(
      updateConsultationRequest({
        requestId: "r1",
        currentUserId: "u1",
        summary: "ok",
      }),
    ).rejects.toMatchObject({
      message: "Only pending requests can be updated",
      statusCode: 400,
    });
  });

  it("updates summary when request is valid and pending", async () => {
    // checks: authorized user updates and summary is trimmed + saved
    const saveMock = jest.fn().mockResolvedValue(true);

    jest
      .spyOn(ConsultationRequest, "findById")
      .mockResolvedValue({
        user: "u1",
        status: "pending",
        summary: "old",
        save: saveMock,
        _id: "r1",
      });

    const updated = await updateConsultationRequest({
      requestId: "r1",
      currentUserId: "u1",
      summary: "  new summary ",
    });

    expect(saveMock).toHaveBeenCalled();
    expect(updated.summary).toBe("new summary");
  });
});

// Tests validation and delete behavior for `deleteConsultationRequest`
describe("deleteConsultationRequest", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("throws 404 when request not found", async () => {
    // checks: returns 404 if no request exists
    jest.spyOn(ConsultationRequest, "findById").mockResolvedValue(null);

    await expect(
      deleteConsultationRequest({ requestId: "no", currentUserId: "u1" }),
    ).rejects.toMatchObject({
      message: "Request not found",
      statusCode: 404,
    });
  });

  it("throws 403 when current user is not creator", async () => {
    // checks: forbid delete by non-creator
    jest
      .spyOn(ConsultationRequest, "findById")
      .mockResolvedValue({ user: "other", status: "pending" });

    await expect(
      deleteConsultationRequest({ requestId: "r1", currentUserId: "u1" }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("throws 400 when request is not pending", async () => {
    // checks: reject delete for non-pending requests
    jest
      .spyOn(ConsultationRequest, "findById")
      .mockResolvedValue({ user: "u1", status: "accepted" });

    await expect(
      deleteConsultationRequest({ requestId: "r1", currentUserId: "u1" }),
    ).rejects.toMatchObject({
      message: "Only pending requests can be deleted",
      statusCode: 400,
    });
  });

  it("deletes when request is valid and pending", async () => {
    // checks: calls deleteOne and returns success when pending and creator
    const deleteOneMock = jest.fn().mockResolvedValue(true);

    jest
      .spyOn(ConsultationRequest, "findById")
      .mockResolvedValue({
        user: "u1",
        status: "pending",
        deleteOne: deleteOneMock,
      });

    const res = await deleteConsultationRequest({
      requestId: "r1",
      currentUserId: "u1",
    });

    expect(deleteOneMock).toHaveBeenCalled();
    expect(res).toEqual({ success: true });
  });
});

// Tests access-control and retrieval for `getConsultationRequestByIdForUser`
describe("getConsultationRequestByIdForUser", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("throws 404 when request not found", async () => {
    // checks: 404 when populated lookup returns null
    jest
      .spyOn(ConsultationRequest, "findById")
      .mockReturnValue({
        populate: jest
          .fn()
          .mockReturnValue({ populate: jest.fn().mockResolvedValue(null) }),
      });

    await expect(
      getConsultationRequestByIdForUser({
        requestId: "no",
        currentUserId: "u1",
      }),
    ).rejects.toMatchObject({ message: "Request not found", statusCode: 404 });
  });

  it("throws 403 when current user is neither creator nor lawyer", async () => {
    // checks: forbidden when current user is unrelated to request
    jest
      .spyOn(ConsultationRequest, "findById")
      .mockReturnValue({
        populate: jest
          .fn()
          .mockReturnValue({
            populate: jest
              .fn()
              .mockResolvedValue({ user: { _id: "a" }, lawyer: { _id: "b" } }),
          }),
      });

    await expect(
      getConsultationRequestByIdForUser({
        requestId: "r1",
        currentUserId: "x",
      }),
    ).rejects.toMatchObject({
      message: "You are not allowed to view this request",
      statusCode: 403,
    });
  });

  it("returns request when current user is the creating user", async () => {
    // checks: creator may view the request
    const fake = { user: { _id: "u1" }, lawyer: { _id: "l1" } };
    jest
      .spyOn(ConsultationRequest, "findById")
      .mockReturnValue({
        populate: jest
          .fn()
          .mockReturnValue({ populate: jest.fn().mockResolvedValue(fake) }),
      });

    const res = await getConsultationRequestByIdForUser({
      requestId: "r1",
      currentUserId: "u1",
    });

    expect(res).toBe(fake);
  });

  it("returns request when current user is the assigned lawyer", async () => {
    // checks: assigned lawyer may view the request
    const fake = { user: { _id: "u1" }, lawyer: { _id: "l1" } };
    jest
      .spyOn(ConsultationRequest, "findById")
      .mockReturnValue({
        populate: jest
          .fn()
          .mockReturnValue({ populate: jest.fn().mockResolvedValue(fake) }),
      });

    const res = await getConsultationRequestByIdForUser({
      requestId: "r1",
      currentUserId: "l1",
    });

    expect(res).toBe(fake);
  });
});
