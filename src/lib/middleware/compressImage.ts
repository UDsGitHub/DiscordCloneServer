import sharp, { ResizeOptions } from "sharp";
import path from "path";
import fs from "fs";
import { config } from "../config/index.js";
import { VerifyTokenRequest } from "./auth.js";
import { NextFunction, Response } from "express";
import crypto from "crypto";

const compressImage = async (
  req: VerifyTokenRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) return next();

  const compressedImagePath = path.join(
    config.uploadPath,
    `compressed-${req.file.filename}`
  );
  let fileName = req.file.filename;
  const quality = 30;
  const resizeOptions: ResizeOptions = { fit: "cover", position: "center" };
  const size = { width: 96, height: 96 };

  try {
    if (config.isProd && req.file.buffer) {
      const buffer = await sharp(req.file.buffer)
        .resize(size.width, size.height, resizeOptions)
        .jpeg({ quality }) // Compress to JPEG with 70% quality
        .toBuffer();
      req.file.buffer = buffer;
      fileName = crypto.randomBytes(32).toString("hex");
    } else {
      await sharp(req.file.path)
        .resize(size.width, size.height, resizeOptions)
        .jpeg({ quality }) // Compress to JPEG with 70% quality
        .toFile(compressedImagePath);
      req.file.path = compressedImagePath;

      // Remove the original file
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    }

    req.file.filename = `compressed-${fileName}`;
    next();
  } catch (error) {
    console.error("Error compressing image:", error);
    res.status(500).json({ message: "Error compressing image" });
  }
};

export default compressImage;
