import express from "express";
import { getLocationAutocomplete } from "../controllers/location/locationController.js";
import { getUniversityAutocomplete } from "../controllers/location/universityController.js";

const router = express.Router();

// Public: Sri Lanka location autocomplete for postcode + locality search
router.get("/autocomplete", getLocationAutocomplete);

// Public: university autocomplete proxied through the backend to avoid browser CORS issues
router.get("/universities", getUniversityAutocomplete);

export default router;