import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/index.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import serverRoutes from "./routes/serverRoutes.js";
import { verifyToken, errorHandler } from "./middleware/index.js";

const app = express();

app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/user", verifyToken, userRoutes);
app.use("/server", verifyToken, serverRoutes);
app.use("/data/uploads", express.static("data/uploads"));

app.use(errorHandler);

export { app };