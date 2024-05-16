import express from "express";

import { protectRoute } from "../middleware/protect-route.js";

import {
  signUp,
  signIn,
  signOut,
  followUser,
  unfollowUser,
  updateProfile,
  getUserProfile,
  getSuggestedUsers,
} from "../controllers/user.js";

const router = express.Router();

router.get("/profile/:query", getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/sign-out", signOut);
router.patch("/follow/:id", protectRoute, followUser);
router.patch("/unfollow/:id", protectRoute, unfollowUser);
router.patch("/update/:id", protectRoute, updateProfile);

export default router;
