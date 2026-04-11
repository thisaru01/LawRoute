import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

import errorMiddleware from "../../../middleware/errorMiddleware.js";

jest.unstable_mockModule("../../../services/location/locationService.js", () => ({
  autocompleteSriLankaLocations: jest.fn(),
}));

const locationService = await import("../../../services/location/locationService.js");
const locationRoutes = (await import("../../locationRoutes.js")).default;

describe("Location Routes", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use("/api/location", locationRoutes);
    app.use(errorMiddleware);
  });

  describe("GET /api/location/autocomplete", () => {
    it("returns suggestions and meta from the location service", async () => {
      const fakeResult = {
        data: [
          {
            formatted: "Bambalapitiya, Colombo, Sri Lanka",
            locationName: "Bambalapitiya",
            district: "Colombo",
            postcode: "00400",
            matchType: "location",
          },
        ],
        meta: {
          mode: "general",
          matchedDistrict: null,
        },
      };

      locationService.autocompleteSriLankaLocations.mockResolvedValue(fakeResult);

      const res = await request(app).get(
        "/api/location/autocomplete?text=%20Bamba%20&limit=7",
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(fakeResult.data);
      expect(res.body.meta).toEqual(fakeResult.meta);
      expect(locationService.autocompleteSriLankaLocations).toHaveBeenCalledWith({
        text: "Bamba",
        limit: 7,
      });
    });

    it("returns empty data for short query text without calling service", async () => {
      const res = await request(app).get("/api/location/autocomplete?text=a");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, data: [] });
      expect(locationService.autocompleteSriLankaLocations).not.toHaveBeenCalled();
    });

    it("clamps the requested limit to 10 when too high", async () => {
      locationService.autocompleteSriLankaLocations.mockResolvedValue({
        data: [],
        meta: { mode: "general", matchedDistrict: null },
      });

      const res = await request(app).get(
        "/api/location/autocomplete?text=Colombo&limit=100",
      );

      expect(res.status).toBe(200);
      expect(locationService.autocompleteSriLankaLocations).toHaveBeenCalledWith({
        text: "Colombo",
        limit: 10,
      });
    });

    it("clamps the requested limit to 1 when limit is negative", async () => {
      locationService.autocompleteSriLankaLocations.mockResolvedValue({
        data: [],
        meta: { mode: "general", matchedDistrict: null },
      });

      const res = await request(app).get(
        "/api/location/autocomplete?text=Colombo&limit=-5",
      );

      expect(res.status).toBe(200);
      expect(locationService.autocompleteSriLankaLocations).toHaveBeenCalledWith({
        text: "Colombo",
        limit: 1,
      });
    });

    it("returns service statusCode and message when service throws known error", async () => {
      const err = new Error("Location lookup timed out. Please try again.");
      err.statusCode = 504;
      locationService.autocompleteSriLankaLocations.mockRejectedValue(err);

      const res = await request(app).get("/api/location/autocomplete?text=Colombo");

      expect(res.status).toBe(504);
      expect(res.body).toEqual({
        success: false,
        message: "Location lookup timed out. Please try again.",
      });
    });

    it("passes unexpected errors to error middleware", async () => {
      locationService.autocompleteSriLankaLocations.mockRejectedValue(
        new Error("Unexpected upstream failure"),
      );

      const res = await request(app).get("/api/location/autocomplete?text=Colombo");

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Unexpected upstream failure");
    });
  });
});
