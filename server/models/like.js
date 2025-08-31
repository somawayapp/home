// models/Like.js
import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    car: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },
  },
  { timestamps: true }
);

// prevent duplicate likes
likeSchema.index({ user: 1, car: 1 }, { unique: true });

export default mongoose.model("Like", likeSchema);
