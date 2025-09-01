// models/Like.js
import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    Listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  },
  { timestamps: true }
);

// prevent duplicate likes
likeSchema.index({ user: 1, Listing: 1 }, { unique: true });

export default mongoose.model("Like", likeSchema);
