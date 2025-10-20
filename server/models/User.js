import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["owner", "user"], default: "user" },
  image: { type: String, default: "" },
  agencyphone: { type: String },
  agencywhatsapp: { type: String },
  agencyheadquaters: { type: String },
  agencydescription: { type: String },
}, { timestamps: true });

// ✅ Virtual link: get all listings by this user
userSchema.virtual("listings", {
  ref: "listing",
  localField: "_id",
  foreignField: "agency",
});

// Include virtual fields in JSON output
userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

const User = mongoose.model("User", userSchema);
export default User;
