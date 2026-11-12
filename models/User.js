import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // هش‌شده با bcrypt
    refreshToken: { type: String, default: null }, // رفرش توکن فعلی کاربر
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
