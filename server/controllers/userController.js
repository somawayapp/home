
import Like from "../models/like.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator"; // ✅ for email & sanitization
import Car from "../models/Car.js";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // ✅ set an expiry for security
  });
};

// Strong password validator
const isStrongPassword = (password) => {
  // ✅ at least 8 chars, one uppercase, one lowercase, one number, one symbol
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

// Register User
export const registerUser = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    // ✅ Trim and sanitize input
    name = name?.trim();
    email = email?.toLowerCase().trim();

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email." });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character.",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12); // ✅ stronger hash
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user._id.toString());
    return res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error. Please try again." });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email?.toLowerCase().trim();

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required." });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    const token = generateToken(user._id.toString());
    return res.status(200).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error. Please try again." });
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
