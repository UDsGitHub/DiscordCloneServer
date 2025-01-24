import express from "express";
import { getServers, createServer } from "../controllers/servers.js";

const router = express.Router();
router.get("/", getServers);
router.post("/createServer", createServer);

export default router;
