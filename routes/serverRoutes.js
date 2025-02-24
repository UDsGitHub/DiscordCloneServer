import express from "express";
import {
  getServers,
  createServer,
  getChannelInfo,
  sendChannelMessage,
  createChannel,
  deleteChannel,
} from "../controllers/serverController.js";
import { imageFileUploader } from "../storage/index.js";
import { compressImage } from "../middleware/index.js";

const router = express.Router();
router.get("/getServers/", getServers);
router.get("/channels/:id", getChannelInfo);
router.post("/channels/sendMessage", sendChannelMessage);
router.post("/channels/createChannel", createChannel);
router.delete("/channels/deleteChannel/:id", deleteChannel);
router.post(
  "/createServer",
  imageFileUploader.single("serverDisplayPicture"),
  compressImage,
  createServer
);

export default router;
