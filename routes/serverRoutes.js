import express from "express";
import {
  getServers,
  createServer,
  getChannelInfo,
} from "../controllers/serverController.js";
import { imageFileUploader } from "../storage/index.js";
import { compressImage } from "../middleware/index.js";

const router = express.Router();
router.get("/", getServers);
router.get("/:id/channels/:channelId", getChannelInfo);
router.post(
  "/createServer",
  imageFileUploader.single("serverDisplayPicture"),
  compressImage,
  createServer
);

export default router;
