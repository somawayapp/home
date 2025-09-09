import express from "express";
import { getListings, getUserData, loginUser, registerUser,toggleLike, getLikedListings, checkIfLiked } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/data', protect, getUserData)
userRouter.get('/listings', getListings)

userRouter.post("/togglelike", protect, toggleLike);
userRouter.get("/alllikes", protect, getLikedListings);
userRouter.get("/checkifliked", protect, checkIfLiked);

export default userRouter;