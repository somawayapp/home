import express from "express";
import { getCars, getUserData, loginUser, registerUser,toggleLike, getLikedCars, checkIfLiked } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/data', protect, getUserData)
userRouter.get('/cars', getCars)

userRouter.post("/togglelike", protect, toggleLike);
userRouter.get("/alllikes", protect, getLikedCars);
userRouter.get("/checkifliked", protect, checkIfLiked);

export default userRouter;