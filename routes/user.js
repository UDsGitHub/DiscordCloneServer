import express from "express";
import { getUser, getDmUsers, sendMessageToUser } from "../controllers/user.js";
const router = express.Router();

router.get("/getUser", getUser);
router.get("/getDmUsers/:userId", getDmUsers);
router.post("/sendMessageToUser", sendMessageToUser);

export default router;
