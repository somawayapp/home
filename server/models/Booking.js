import mongoose from "mongoose";
const {ObjectId} = mongoose.Schema.Types

const bookingSchema = new mongoose.Schema({
    Listing: {type: ObjectId, ref: "Listing", required: true},
    user: {type: ObjectId, ref: "User", required: true},
    owner: {type: ObjectId, ref: "User", required: true},
    viewingdate: {type: Date, required: true},
    status: {type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending"},
    phone: {type: Number, required: true},
    message: { type: String },
    whatsapp: {type: Number, required: true}

},{timestamps: true})

const Booking = mongoose.model('Booking', bookingSchema)

export default Booking