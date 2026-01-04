import express from 'express';
import { registerNewDevice, getMyDevices, deviceOnline, updateDevice, getADevice, getNumberOfDevicesOnline } from '../controllers/device.controller.js';
import userAuthentication from '../functions/userAuthentication.js';

const router= express.Router();

router.post("/register", userAuthentication, registerNewDevice);
router.get("/get-my-devices", userAuthentication, getMyDevices);
router.post("/online", deviceOnline);
router.put("/update/:deviceDBID", userAuthentication, updateDevice);
router.post("/set-online", deviceOnline);
router.get("/get-a-device/:deviceID", userAuthentication, getADevice);
router.get("/online-status", userAuthentication, getNumberOfDevicesOnline);

export default router;