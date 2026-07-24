import UserWorkoutPlan from "../modules/workouts.js";

// Example: Adding a new workout entry for a user
async function addWorkout(req, res) {
  const username = req.user?.username;
  const { form } = req.body;

  if (!username) {
    return res.status(401).json({ success: false, message: "Unauthorized." });
  }

  if (!form || !form.exercise) {
    return res.status(400).json({
      success: false,
      message: "Missing required workout fields.",
    });
  }

  try {
    const updatedPlan = await UserWorkoutPlan.findOneAndUpdate(
      { username },
      {
        $push: {
          workouts: {
            exercise: String(form.exercise).trim(),
            sets: Math.max(0, Number(form.sets) || 0),
            reps: Math.max(0, Number(form.reps) || 0),
            weight: Math.max(0, Number(form.weight) || 0),
          },
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true, // Ensures schema constraints run on upsert
      },
    );

    return res.status(200).json({ success: true, data: updatedPlan });
  } catch (error) {
    console.error("Error adding workout:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while saving workout.",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
}

async function getUserWorkoutPlan(req, res) {
  try {
    // 1. Get username from your auth middleware (e.g., req.user set by JWT or session)
    const username = req.user?.username;

    if (!username) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User session not found.",
      });
    }

    // 2. Fetch the workout plan from MongoDB
    let userPlan = await UserWorkoutPlan.findOne({ username }).lean();

    // 3. If no plan exists yet, return a default empty structure
    if (!userPlan) {
      return res.status(200).json({
        success: true,
        data: {
          username,
          workouts: [],
        },
      });
    }

    // 4. Return the found workout plan
    return res.status(200).json({
      success: true,
      data: userPlan,
    });
  } catch (error) {
    console.error("Error fetching workout plan:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching workout plan.",
      error: error.message,
    });
  }
}

export { addWorkout, getUserWorkoutPlan };
