import { jest } from "@jest/globals";

import ConsultationRequest from "../../../models/consultation/consultationRequestModel.js";
import Case from "../../../models/case/caseModel.js";
import {
  getConsultationRequestsForLawyer,
  acceptConsultationRequest,
  rejectConsultationRequest,
} from "../lawyerConsultationRequestService.js";

// Tests listing requests for a specific lawyer
describe("getConsultationRequestsForLawyer", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  // returns populated, sorted requests for the given lawyer id
  it("returns populated and sorted requests for a lawyer", async () => {
    const fake = [{ _id: "r1", user: { name: "A" } }];

    jest.spyOn(ConsultationRequest, "find").mockReturnValue({
      populate: jest
        .fn()
        .mockReturnValue({ sort: jest.fn().mockResolvedValue(fake) }),
    });

    const res = await getConsultationRequestsForLawyer("lawyer1");

    expect(ConsultationRequest.find).toHaveBeenCalledWith({
      lawyer: "lawyer1",
    });
    expect(res).toBe(fake);
  });
});

// Tests accepting requests by the assigned lawyer
describe("acceptConsultationRequest", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  // 404 when the requested consultation does not exist
  it("throws 404 when request not found", async () => {
    jest.spyOn(ConsultationRequest, "findById").mockResolvedValue(null);

    await expect(
      acceptConsultationRequest({ requestId: "no", lawyerId: "l1" }),
    ).rejects.toMatchObject({ message: "Request not found", statusCode: 404 });
  });

  // 403 when a non-assigned lawyer attempts to accept
  it("throws 403 when caller is not assigned lawyer", async () => {
    jest
      .spyOn(ConsultationRequest, "findById")
      .mockResolvedValue({ lawyer: "other", status: "pending" });

    await expect(
      acceptConsultationRequest({ requestId: "r1", lawyerId: "l1" }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  // 400 when the request has already been responded to
  it("throws 400 when request is not pending", async () => {
    jest
      .spyOn(ConsultationRequest, "findById")
      .mockResolvedValue({ lawyer: "l1", status: "accepted" });

    await expect(
      acceptConsultationRequest({ requestId: "r1", lawyerId: "l1" }),
    ).rejects.toMatchObject({
      message: "This request has already been responded to",
      statusCode: 400,
    });
  });

  // successful accept: marks accepted, saves, and creates a Case
  it("accepts request, saves, and creates a Case when valid", async () => {
    const saveMock = jest.fn().mockResolvedValue(true);
    const fakeRequest = {
      _id: "r1",
      user: "u1",
      lawyer: "l1",
      status: "pending",
      save: saveMock,
    };

    jest.spyOn(ConsultationRequest, "findById").mockResolvedValue(fakeRequest);
    jest.spyOn(Case, "create").mockResolvedValue({ _id: "c1" });

    const res = await acceptConsultationRequest({
      requestId: "r1",
      lawyerId: "l1",
    });

    expect(saveMock).toHaveBeenCalled();
    expect(Case.create).toHaveBeenCalledWith({
      consultationRequest: "r1",
      user: "u1",
      lawyer: "l1",
    });
    expect(res).toBe(fakeRequest);
  });
});

// Tests rejecting requests by the assigned lawyer
describe("rejectConsultationRequest", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  // 404 when the requested consultation does not exist
  it("throws 404 when request not found", async () => {
    jest.spyOn(ConsultationRequest, "findById").mockResolvedValue(null);

    await expect(
      rejectConsultationRequest({ requestId: "no", lawyerId: "l1" }),
    ).rejects.toMatchObject({ message: "Request not found", statusCode: 404 });
  });

  // 403 when a non-assigned lawyer attempts to reject
  it("throws 403 when caller is not assigned lawyer", async () => {
    jest
      .spyOn(ConsultationRequest, "findById")
      .mockResolvedValue({ lawyer: "other", status: "pending" });

    await expect(
      rejectConsultationRequest({ requestId: "r1", lawyerId: "l1" }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  // 400 when the request has already been responded to
  it("throws 400 when request is not pending", async () => {
    jest
      .spyOn(ConsultationRequest, "findById")
      .mockResolvedValue({ lawyer: "l1", status: "accepted" });

    await expect(
      rejectConsultationRequest({ requestId: "r1", lawyerId: "l1" }),
    ).rejects.toMatchObject({
      message: "This request has already been responded to",
      statusCode: 400,
    });
  });

  // successful reject: marks rejected and saves
  it("rejects request and saves when valid", async () => {
    const saveMock = jest.fn().mockResolvedValue(true);
    const fakeRequest = {
      _id: "r1",
      user: "u1",
      lawyer: "l1",
      status: "pending",
      save: saveMock,
    };

    jest.spyOn(ConsultationRequest, "findById").mockResolvedValue(fakeRequest);

    const res = await rejectConsultationRequest({
      requestId: "r1",
      lawyerId: "l1",
    });

    expect(saveMock).toHaveBeenCalled();
    expect(res).toBe(fakeRequest);
  });
});

// Additional edge-case scenarios for lawyer consultation flows
describe("edge cases", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  // returns empty array when no requests found for lawyer
  it("getConsultationRequestsForLawyer returns empty array when none", async () => {
    jest.spyOn(ConsultationRequest, "find").mockReturnValue({
      populate: jest
        .fn()
        .mockReturnValue({ sort: jest.fn().mockResolvedValue([]) }),
    });

    const res = await getConsultationRequestsForLawyer("lawyer1");

    expect(res).toEqual([]);
  });

  // propagates database errors from the query
  it("getConsultationRequestsForLawyer propagates DB errors", async () => {
    jest.spyOn(ConsultationRequest, "find").mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error("db fail")),
      }),
    });

    await expect(getConsultationRequestsForLawyer("lawyer1")).rejects.toThrow(
      "db fail",
    );
  });

  // if Case.create fails after save, the error propagates
  it("acceptConsultationRequest propagates Case.create errors after saving", async () => {
    const saveMock = jest.fn().mockResolvedValue(true);
    const fakeRequest = {
      _id: "r1",
      user: "u1",
      lawyer: "l1",
      status: "pending",
      save: saveMock,
    };

    jest.spyOn(ConsultationRequest, "findById").mockResolvedValue(fakeRequest);
    jest.spyOn(Case, "create").mockRejectedValue(new Error("case fail"));

    await expect(
      acceptConsultationRequest({ requestId: "r1", lawyerId: "l1" }),
    ).rejects.toThrow("case fail");

    expect(saveMock).toHaveBeenCalled();
  });

  // failing save prevents Case.create from being called
  it("acceptConsultationRequest fails when save throws and does not call Case.create", async () => {
    const saveMock = jest.fn().mockRejectedValue(new Error("save fail"));
    const fakeRequest = {
      _id: "r1",
      user: "u1",
      lawyer: "l1",
      status: "pending",
      save: saveMock,
    };

    jest.spyOn(ConsultationRequest, "findById").mockResolvedValue(fakeRequest);
    jest.spyOn(Case, "create").mockResolvedValue({ _id: "c1" });

    await expect(
      acceptConsultationRequest({ requestId: "r1", lawyerId: "l1" }),
    ).rejects.toThrow("save fail");

    expect(Case.create).not.toHaveBeenCalled();
  });

  // failing save during reject propagates the save error
  it("rejectConsultationRequest fails when save throws", async () => {
    const saveMock = jest.fn().mockRejectedValue(new Error("save fail"));
    const fakeRequest = {
      _id: "r1",
      user: "u1",
      lawyer: "l1",
      status: "pending",
      save: saveMock,
    };

    jest.spyOn(ConsultationRequest, "findById").mockResolvedValue(fakeRequest);

    await expect(
      rejectConsultationRequest({ requestId: "r1", lawyerId: "l1" }),
    ).rejects.toThrow("save fail");
  });
});
