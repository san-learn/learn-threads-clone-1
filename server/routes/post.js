import express from "express";

import { protectRoute } from "../middleware/protect-route.js";

import {
  createPost,
  getPost,
  deletePost,
  likePost,
  unlikePost,
  replyPost,
  getFeedPosts,
  getAllPost,
} from "../controllers/post.js";

const router = express.Router();

router.get("/get/:id", getPost);
router.get("/get-all/:username", getAllPost);
router.post("/create", protectRoute, createPost);
router.delete("/delete/:id", protectRoute, deletePost);
router.patch("/like/:id", protectRoute, likePost);
router.patch("/unlike/:id", protectRoute, unlikePost);
router.patch("/reply/:id", protectRoute, replyPost);
router.get("/feed", protectRoute, getFeedPosts);

export default router;
