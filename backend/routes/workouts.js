import express from "express";
import { isAuth } from "../middleware/authenticate.js";
import { addWorkout, getUserWorkoutPlan } from "../controllers/workouts.js";

const router = express.Router();

// Both use the exact same endpoint, but the HTTP method dictates the controller
router.route("/").get(isAuth, getUserWorkoutPlan).post(isAuth, addWorkout);

export default router;
