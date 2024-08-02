import express from "express";
import { getUser, getDmUsers } from "../controllers/user.js";
const router = express.Router();

router.get("/getUser", getUser);
router.get("/getDmUsers/:userId", getDmUsers);

export default router;
