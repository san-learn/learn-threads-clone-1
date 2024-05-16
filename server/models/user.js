import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minLength: 6 },
    profilePicture: { type: String, default: "" },
    followers: { type: [String], default: [] },
    following: { type: [String], default: [] },
    biography: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
