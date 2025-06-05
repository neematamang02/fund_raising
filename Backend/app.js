import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./dbconnection.js";

import authRouter from "./Routes/auth.js";
import campaignRouter from "./Routes/campaigns.js";
import donationRouter from "./Routes/donations.js";
import paypalrouter from "./Routes/paypal.js";
import applicationRoutes from "./Routes/applications.js";
import organizerRouter from "./Routes/organizer.js";

dotenv.config();
connectDB();
const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api", paypalrouter);
app.use("/api", organizerRouter);
app.use("/api", applicationRoutes);
app.use("/api/auth", authRouter);
app.use("/api/campaigns", campaignRouter);
app.use("/api/donations", donationRouter);

export default app;
