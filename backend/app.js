import express from 'express';
import { dbConnection } from './config/db_access.js';
import { config as dotenvConfig } from 'dotenv';
import fs from 'fs';
import deviceRouter from './routers/device.router.js';
import userRouter from './routers/user.router.js';
import eventRouter from './routers/event.router.js';
import checkOfflineDevices from './functions/checkOfflineDevices.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === "null")
      return callback(null, false);

    return callback(null, origin);
  },
  credentials: true
}));

const PORT = process.env.PORT || 5000;
const secretPath =
  fs.existsSync('/etc/secrets/.env')
    ? '/etc/secrets/.env'
    : './.env';

dotenvConfig({ path: secretPath });

app.use("/api/device", deviceRouter);
app.use("/api/user", userRouter);
app.use("/api/event", eventRouter);
app.get("/", (req, res)=>{
    res.json({message: "Server is working!"})
});

setInterval(checkOfflineDevices, 30000);

app.listen(PORT, '0.0.0.0', ()=>{
    dbConnection();
    console.log("server started at http://localhost:"+PORT);
});