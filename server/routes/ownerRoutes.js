import express from "express";
import { protect } from "../middleware/auth.js";
import { addListing, changeRoleToOwner, getAuthenticationParameters, deleteCar, getDashboardData, getOwnerListings, toggleCarAvailability, updateUserImage } from "../controllers/ownerController.js";
import upload from "../middleware/multer.js";
import { verifyToken } from '../middleware/auth.js';

const ownerRouter = express.Router();

// New route for ImageKit authentication
ownerRouter.get('/imagekit-auth', getAuthenticationParameters);
ownerRouter.post("/change-role", protect, changeRoleToOwner)
ownerRouter.post('/add-listing', verifyToken, addListing);
ownerRouter.get("/listings", protect, getOwnerListings)
ownerRouter.post("/toggle-car", protect, toggleCarAvailability)
ownerRouter.post("/delete-car", protect, deleteCar)

ownerRouter.get('/dashboard', protect, getDashboardData)
ownerRouter.post('/update-image', upload.single("image"), protect, updateUserImage)

export default ownerRouter;