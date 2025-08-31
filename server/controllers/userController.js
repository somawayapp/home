import User from "../models/User.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Car from "../models/Car.js";


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

// controllers/likeController.js

export const toggleLike = async (req, res) => {
  try {
    const { carId } = req.body;
    const userId = req.user._id;

    // Check if like exists
    const existingLike = await Like.findOne({ user: userId, car: carId });

    if (existingLike) {
      // Unlike (delete)
      await Like.deleteOne({ _id: existingLike._id });
      return res.json({ success: true, liked: false });
    }

    // Like (create)
    await Like.create({ user: userId, car: carId });
    return res.json({ success: true, liked: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
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
