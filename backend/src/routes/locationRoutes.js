import express from "express";
import { getLocationAutocomplete } from "../controllers/location/locationController.js";

const router = express.Router();

// Public: Sri Lanka location autocomplete for postcode + locality search
router.get("/autocomplete", getLocationAutocomplete);

export default router;