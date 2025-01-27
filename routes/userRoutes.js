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
} from "../controllers/userController.js";
const router = express.Router();

router.get("/getUser", getUser);
router.get("/getDmUsers", getDmUsers);
router.get("/getFriends", getFriends);
router.get("/getFriendRequests", getFriendRequests);
router.post("/sendMessageToUser", sendMessageToUser);
router.post("/sendFriendRequest", sendFriendRequest);
router.delete("/ignoreFriendRequest", ignoreFriendRequest);
router.post("/addFriend", addFriend);
router.delete("/unFriend", unFriend);

export default router;
