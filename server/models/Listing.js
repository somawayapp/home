import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const listingSchema = new mongoose.Schema(
  {
    agency: { type: ObjectId, ref: "User", required: true }, // Owner or uploader
    agentname: { type: String },
    agentphone: { type: String},
    agentwhatsapp: { type: String},

    scrappingurl: { type: String }, // Optional if scraped from external source
    listingstatus: { type: Boolean, default: true },
    visits: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
     draft: { type: Boolean, default: true },
    featuredexpiry: { type: Date },
location: {
  country: { type: String, required: true, default: "Kenya" }, // fixed to Kenya
  county: { type: String },
  city: { type: String },
  suburb: { type: String },
  area: { type: String },
  coordinates: {
    type: [Number], // [longitude, latitude]
    validate: {
      validator: (v) => v === null || (Array.isArray(v) && v.length === 2),
      message: 'Coordinates must be [longitude, latitude] or null.'
    }
  }
},
    
    title: { type: String },
    description: { type: String },
    price: { type: Number},

    amenities: {
      internal: [{ type: String }],
      external: [{ type: String }],
      nearby: [{ type: String }],
    },


    propertytype: { type: String }, // e.g., apartment, land, office
    features: {
      bathrooms: { type: Number },
      bedrooms: { type: Number },
      rooms: { type: Number },
      size: { type: String }, // Could be "120 sqm" or "0.5 acres"
    },

    offertype: { type: String, enum: ["sale", "rent"] },

    images: [{ type: String }],
  },
  { timestamps: true }
);

const Listing = mongoose.model("listing", listingSchema);

export default Listing;
