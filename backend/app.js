import express from "express";
import passport from "passport";
import Cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import rateLimit from "express-rate-limit";
import compression from "compression";
import environment from "./config/environment.js";

import UserRouter from "./routes/user.js";
import passportConfig from "./config/passport-user.js";
import WorkoutRouter from "./routes/workouts.js";
config();

const app = express();
app.set("trust proxy", 1);

// Security
app.use(cookieParser());
app.use(passport.initialize());
passportConfig(passport);
app.use(compression());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 2000,
    standardHeaders: true,
    message: "Too many requests, please try again later from app.js",
  }),
);
//cors
app.use(
  Cors({
    origin: environment.CLIENT_URL,
    credentials: true,
  }),
);

app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

app.get("/version", (_req, res) => {
  res.status(200).json({
    version: process.env.RELEASE_VERSION || "development",
    frontendImage: process.env.FRONTEND_IMAGE || "local-build",
    backendImage: process.env.BACKEND_IMAGE || "local-build",
    deployedAt: process.env.DEPLOYED_AT || null,
  });
});

//Body Prasing
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes
app.use("/user", UserRouter);
app.use("/api/v1/workouts", WorkoutRouter);
export default app;
