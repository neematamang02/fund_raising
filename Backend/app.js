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

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api", paypalrouter);
app.use("/api", organizerRouter);
app.use("/api", applicationRoutes);
app.use("/api/auth", authRouter);
app.use("/api/campaigns", campaignRouter);
app.use("/api/donations", donationRouter);

export default app;
