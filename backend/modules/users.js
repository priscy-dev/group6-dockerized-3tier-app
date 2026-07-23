import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "fullname is required"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "enter your username"],
      unique: true,
    },
    salt: { type: String, required: true, select: false },
    hash: { type: String, required: true, select: false },
    age: { type: Number, required: true },
    sex: {
      type: String,
      enum: ["Male", "Female", "Others"],
      default: "Others",
    },
    weight: { type: Number },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt fields
  },
);

const Users = mongoose.model("User", UserSchema);

export default Users;
