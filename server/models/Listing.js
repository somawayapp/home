import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const listingSchema = new mongoose.Schema(
  {
    agency: { type: ObjectId, ref: "User", required: true }, // Owner or uploader
    agentname: { type: String, required: true },
    agentphone: { type: String, required: true },
    agentwhatsapp: { type: String, required: true },

    scrappingurl: { type: String }, // Optional if scraped from external source
    listingstatus: { type: Boolean, default: false },
    visits: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    featuredexpiry: { type: Date },

    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },

    amenities: {
      internal: [{ type: String }],
      external: [{ type: String }],
      nearby: [{ type: String }],
    },

    location: { type: String, required: true },

    propertytype: { type: String, required: true }, // e.g., apartment, land, office
    features: {
      bathrooms: { type: Number },
      bedrooms: { type: Number },
      rooms: { type: Number },
      size: { type: String }, // Could be "120 sqm" or "0.5 acres"
    },

    offertype: { type: String, enum: ["sale", "rent"], required: true },

    images: [{ type: String, required: true }],
  },
  { timestamps: true }
);

const Listing = mongoose.model("listing", listingSchema);

export default Listing;
