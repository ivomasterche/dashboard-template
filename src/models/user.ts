import { Schema, model, models } from "mongoose";
import { UserRole } from "@/types";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      match: [
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
        "Invalid email address",
      ],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      maxLength: [100, "Name should be less than 100 characters"],
    },
    password: {
      type: String,
      required: false,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: "User",
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verified: {
      type: Date || null,
      default: null,
    },

    verificationTokenExpires: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetTokenExpires: {
      type: Date,
      select: false,
    },
    isOAuthUser: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = models.User || model("User", UserSchema);

export default User;
