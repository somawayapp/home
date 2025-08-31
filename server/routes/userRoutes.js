import express from "express";
import { getCars, getUserData, loginUser, registerUser } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import { toggleLike, getLikedCars, checkIfLiked } from "../controllers/likeController.js";

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/data', protect, getUserData)
userRouter.get('/cars', getCars)

router.post("/togglelike", protect, toggleLike);
router.get("/alllikes", protect, getLikedCars);
router.get("/checkifliked", protect, checkIfLiked);

export default userRouter;