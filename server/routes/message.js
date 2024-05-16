import express from "express";

import { protectRoute } from "../middleware/protect-route.js";

import {
  sendMessage,
  getAllMessage,
  getAllConversation,
} from "../controllers/message.js";

const router = express.Router();

router.get("/get-all/:id", protectRoute, getAllMessage);
router.get("/get-all-conversation", protectRoute, getAllConversation);
router.post("/send", protectRoute, sendMessage);

export default router;
