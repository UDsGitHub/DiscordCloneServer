import express from "express";
import {
  getUser,
  getDmUsers,
  getFriends,
  getFriendRequests,
  sendMessageToUser,
  sendFriendRequest,
  ignoreFriendRequest,
  addFriend,
  unFriend,
} from "../controllers/user.js";
import { verifyToken } from "../middleware/auth.js";
const router = express.Router();

router.get("/getUser", verifyToken, getUser);
router.get("/getDmUsers", verifyToken, getDmUsers);
router.get("/getFriends", verifyToken, getFriends);
router.get("/getFriendRequests", verifyToken, getFriendRequests);
router.post("/sendMessageToUser", verifyToken, sendMessageToUser);
router.post("/sendFriendRequest", verifyToken, sendFriendRequest);
router.delete("/ignoreFriendRequest", verifyToken, ignoreFriendRequest);
router.post("/addFriend", verifyToken, addFriend);
router.delete("/unFriend", verifyToken, unFriend);

export default router;
