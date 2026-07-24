import mongoose from "mongoose";

const workoutEntrySchema = new mongoose.Schema(
  {
    // Generates a UUID string by default if you prefer UUIDs over ObjectId
    id: {
      type: String,
      default: () => crypto.randomUUID(),
    },
    date: {
      type: Date,
      default: Date.now,
    },
    exercise: {
      type: String,
      required: true,
      trim: true,
    },
    sets: {
      type: Number,
      default: 0,
      min: 0,
    },
    reps: {
      type: Number,
      default: 0,
      min: 0,
    },
    weight: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }, // Prevents Mongoose from auto-creating a duplicate _id for subdocuments if you use custom 'id'
);

const userWorkoutPlanSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    workouts: [workoutEntrySchema],
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  },
);

const UserWorkoutPlan = mongoose.model(
  "UserWorkoutPlan",
  userWorkoutPlanSchema,
);

export default UserWorkoutPlan;
