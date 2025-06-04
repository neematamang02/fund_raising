import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["donor", "organizer", "admin"],
      default: "donor",
      required: true,
    },
    isOrganizerApproved: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: true,
    },
    // other fields as needed (e.g. avatar, etc.)
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
