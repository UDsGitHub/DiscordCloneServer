import express from "express";
import { imageFileUploader } from "../lib/storage/index.js";
import { compressImage } from "../lib/middleware/index.js";
import { ServerController } from "../controllers/ServerController.js";

const controller = new ServerController();
const router = express.Router();

router.get("/getServers/", controller.getServers);
router.get("/channels/:id", controller.getChannelInfo);
router.post("/channels/sendMessage", controller.sendChannelMessage);
router.post("/channels/createChannel", controller.createChannel);
router.delete("/channels/deleteChannel/:id", controller.deleteChannel);
router.post(
  "/createServer",
  imageFileUploader.single("serverDisplayPicture"),
  compressImage,
  controller.createServer
);

export default router;
