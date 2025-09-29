import express from "express";
import { AuthController } from "../controllers/AuthController.js";

const controller = new AuthController();
const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);

export default router;
