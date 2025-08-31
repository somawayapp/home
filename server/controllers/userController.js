import User from "../models/User.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Like from "../models/like.js";
import Car from "../models/Car.js";


// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // ✅ Expiry for better security
  });
};

// =============================
// REGISTER USER
// =============================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ✅ Field-level validation
    if (!name || name.trim().length < 3) {
      return res.json({
        success: false,
        field: "name",
        message: "Name must be at least 3 characters long.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.json({
        success: false,
        field: "email",
        message: "Enter a valid email address.",
      });
    }

    if (!password || password.length < 8) {
      return res.json({
        success: false,
        field: "password",
        message: "Password must be at least 8 characters long.",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.json({
        success: false,
        field: "email",
        message: "An account with this email already exists.",
      });
    }

    // ✅ Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = generateToken(user._id.toString());
    res.json({ success: true, token });
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Try again later." });
  }
};

// =============================
// LOGIN USER
// =============================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Basic validation
    if (!email || !password) {
      return res.json({
        success: false,
        message: "Please fill in all fields.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        field: "email",
        message: "No account found with this email.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({
        success: false,
        field: "password",
        message: "Incorrect password. Please try again.",
      });
    }

    const token = generateToken(user._id.toString());
    res.json({ success: true, token });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Try again later." });
  }
};


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
// Get All Cars for the Frontend with Filters
// Get All Cars for the Frontend with Filters
export const getCars = async (req, res) => {
  try {
    const { pickupLocation, pricePerDay, seatingCapacity } = req.query;

    // Base filter
    const filter = { isAvaliable: true };

    if (pickupLocation) {
      // Case-insensitive location match
      filter.location = { $regex: new RegExp(pickupLocation, "i") };
    }

    if (pricePerDay) {
      filter.pricePerDay = { $lte: Number(pricePerDay) };
    }

    if (seatingCapacity) {
      filter.seating_capacity = Number(seatingCapacity); // ✅ matches schema
    }

    const cars = await Car.find(filter);
    res.json({ success: true, cars });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};



export const getLikedCars = async (req, res) => {
  try {
    const userId = req.user._id;

    const liked = await Like.find({ user: userId }).populate("car");
    res.json({ success: true, likedCars: liked.map((l) => l.car) });
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
      return res.json({ success: false, error: "NOT_AUTHENTICATED" });
    }

    const { carId } = req.body;
    const userId = req.user._id;

    // ✅ Check if like exists
    const existingLike = await Like.findOne({ user: userId, car: carId });

    if (existingLike) {
      // ✅ Unlike (delete)
      await Like.deleteOne({ _id: existingLike._id });
      return res.json({ success: true, liked: false });
    }

    // ✅ Like (create new)
    await Like.create({ user: userId, car: carId });
    return res.json({ success: true, liked: true });

  } catch (error) {
    console.error("Toggle Like Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};





export const checkIfLiked = async (req, res) => {
  try {
    const userId = req.user._id;
    const { carId } = req.query;

    const existingLike = await Like.findOne({ user: userId, car: carId });
    res.json({ success: true, liked: !!existingLike });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
