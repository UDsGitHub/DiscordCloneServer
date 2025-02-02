import express from "express";
import {
  getServers,
  createServer,
  getChannelInfo,
  sendChannelMessage,
  createChannel,
} from "../controllers/serverController.js";
import { imageFileUploader } from "../storage/index.js";
import { compressImage } from "../middleware/index.js";

const router = express.Router();
router.get("/", getServers);
router.get("/channels/:channelId", getChannelInfo);
router.post("/channels/sendMessage", sendChannelMessage);
router.post("/channels/createChannel", createChannel);
router.post(
  "/createServer",
  imageFileUploader.single("serverDisplayPicture"),
  compressImage,
  createServer
);

export default router;
