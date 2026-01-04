import express from 'express';
import { submitData, getSensorReadingRecords, getTemperatureSummary } from '../controllers/event.controller.js';
import userAuthentication from '../functions/userAuthentication.js';

const router= express.Router();

router.post("/submit-data", submitData);
router.post("/sensor-records", userAuthentication, getSensorReadingRecords);
router.get("/temp-summary", userAuthentication, getTemperatureSummary);

export default router;