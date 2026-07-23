import mongoose from "mongoose";

const connectDB = async (DATABASE_URL) => {
  try {
    await mongoose.connect(DATABASE_URL, {
      dbName: "fitness_tracker",
    });
    // eslint-disable-next-line no-undef
    console.log("connected....");
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error("DB connection failed:", error.message);
    process.exit(1); // stop the app instead of running without DB
  }
};

export default connectDB;
