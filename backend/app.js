import express from "express";
import passport from "passport";
import Cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import rateLimit from "express-rate-limit";
import compression from "compression";

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
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
);

//Body Prasing
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes
app.use("/user", UserRouter);
app.use("/api/v1/workouts", WorkoutRouter);
export default app;
