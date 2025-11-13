import express from "express";
import { UserController } from "../controllers/UserController.js";

const controller = new UserController();
const router = express.Router();

router.get("/getUser", controller.getUser);
router.get("/getDmUsers", controller.getDmUsers);
router.get("/getFriends", controller.getFriends);
router.get("/getFriendRequests", controller.getFriendRequests);
router.post("/sendMessageToUser", controller.sendMessageToUser);
router.post("/sendFriendRequest", controller.sendFriendRequest);
router.delete("/ignoreFriendRequest", controller.ignoreFriendRequest);
router.post("/addFriend", controller.addFriend);
router.delete("/unFriend", controller.unFriend);
router.post("/sendServerInvite", controller.sendServerInvite);

export default router;
