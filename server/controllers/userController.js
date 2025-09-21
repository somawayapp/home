import User from "../models/User.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Like from "../models/like.js";
import Listing from "../models/Listing.js";


// Generate JWT Token
const generateToken = (userId)=>{
    const payload = userId;
    return jwt.sign(payload, process.env.JWT_SECRET)
}

// Register User
export const registerUser = async (req, res)=>{
    try {
        const {name, email, password} = req.body

        if(!name || !email || !password || password.length < 8){
            return res.json({success: false, message: 'Fill all the fields'})
        }

        const userExists = await User.findOne({email})
        if(userExists){
            return res.json({success: false, message: 'User already exists'})
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({name, email, password: hashedPassword})
        const token = generateToken(user._id.toString())
        res.json({success: true, token})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Login User 
export const loginUser = async (req, res)=>{
    try {
        const {email, password} = req.body
        const user = await User.findOne({email})
        if(!user){
            return res.json({success: false, message: "User not found" })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.json({success: false, message: "Invalid Credentials" })
        }
        const token = generateToken(user._id.toString())
        res.json({success: true, token})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Get User data using Token (JWT)
export const getUserData = async (req, res) =>{
    try {
        const {user} = req;
        res.json({success: true, user})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}
// Get All Listings for the Frontend with Filters
// Get All Listings for the Frontend with Filters

export const getListings = async (req, res) => {
  try {
    const {
      location,
      minPrice,
      maxPrice,
      propertytype,
      offertype, // "sale" or "rent"
      bedrooms,
      bathrooms,
      rooms,
      size, // optional string match
      amenitiesInternal,
      amenitiesExternal,
      amenitiesNearby,
      featured,
      available,
    } = req.query;

    // ✅ Build filter dynamically
    const filter = {};

    // ✅ Listing status (true = available)
    if (available !== undefined) {
      filter.listingstatus = available === "true";
    }

    // ✅ Location (case-insensitive partial match)
  if (location) {
  const terms = location.split(/\s+/); // split by space → ["Nairobi", "Ngara"]

  // Build an array of conditions
  const conditions = [];

  terms.forEach((term) => {
    conditions.push(
      { "location.county": { $regex: term, $options: "i" } },
      { "location.city": { $regex: term, $options: "i" } },
      { "location.suburb": { $regex: term, $options: "i" } },
      { "location.area": { $regex: term, $options: "i" } },
      { "location.road": { $regex: term, $options: "i" } }
    );
  });

  // Require ALL terms to be found somewhere
  filter.$and = terms.map((term) => ({
    $or: [
      { "location.county": { $regex: term, $options: "i" } },
      { "location.city": { $regex: term, $options: "i" } },
      { "location.suburb": { $regex: term, $options: "i" } },
      { "location.area": { $regex: term, $options: "i" } },
      { "location.road": { $regex: term, $options: "i" } },
    ],
  }));
}


    // ✅ Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // ✅ Property Type
    if (propertytype) {
      filter.propertytype = { $regex: new RegExp(propertytype, "i") };
    }

if (offertype) {
  filter.offertype = { $regex: new RegExp(offertype, "i") };
}

// ✅ Features (at least)
if (bedrooms) {
  filter["features.bedrooms"] = { $gte: Number(bedrooms) };
}
if (bathrooms) {
  filter["features.bathrooms"] = { $gte: Number(bathrooms) };
}
if (rooms) {
  filter["features.rooms"] = { $gte: Number(rooms) };
}
if (size) {
  filter["features.size"] = { $gte: Number(size) };
}

    // ✅ Amenities (array match)
    if (amenitiesInternal) {
      filter["amenities.internal"] = { $all: amenitiesInternal.split(",") };
    }
    if (amenitiesExternal) {
      filter["amenities.external"] = { $all: amenitiesExternal.split(",") };
    }
    if (amenitiesNearby) {
      filter["amenities.nearby"] = { $all: amenitiesNearby.split(",") };
    }

    // ✅ Featured filter
    if (featured !== undefined) {
      filter.featured = featured === "true";
    }

    // ✅ Fetch listings
    const listings = await Listing.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, count: listings.length, listings });
  } catch (error) {
    console.error("Error fetching listings:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};



export const getLikedListings = async (req, res) => {
  try {
    const userId = req.user._id;

    const liked = await Like.find({ user: userId }).populate("listing");
    res.json({ success: true, likedListings: liked.map((l) => l.listing) });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};



// controllers/likeController.js

export const toggleLike = async (req, res) => {
  try {
    // ✅ Ensure user is logged in
    if (!req.user) {
      return res.status(401).json({ success: false, error: "NOT_AUTHENTICATED" });
    }

    const { listingId } = req.body;
    const userId = req.user._id;

    // ✅ Check if like exists
    const existingLike = await Like.findOne({ user: userId, listing: listingId });

    if (existingLike) {
      // ✅ Unlike (delete)
      await Like.deleteOne({ _id: existingLike._id });
      return res.json({ success: true, liked: false });
    }

    // ✅ Like (create new)
    await Like.create({ user: userId, listing: listingId });
    return res.json({ success: true, liked: true });

  } catch (error) {
    console.error("Toggle Like Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};





export const checkIfLiked = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, liked: false, error: "NOT_AUTHENTICATED" });
    }

    const userId = req.user._id;
    const { listingId } = req.query;

    const existingLike = await Like.findOne({ user: userId, listing: listingId });
    return res.json({ success: true, liked: !!existingLike });
  } catch (error) {
    console.error("CheckIfLiked Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

