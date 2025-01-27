import sharp from "sharp";
import path from "path";
import fs from "fs";
import { config } from "../config/index.js";

const compressImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const { filename: image } = req.file;
  const compressedImagePath = path.join(
    config.uploadPath,
    `compressed-${image}`
  );

  try {
    await sharp(req.file.path)
      .resize(96, 96, { fit: "cover", position: "center" }) // Resize to a width of 800px, maintaining aspect ratio
      .jpeg({ quality: 30 }) // Compress to JPEG with 80% quality
      .toFile(compressedImagePath);

    // Remove the original file
    fs.unlinkSync(req.file.path);

    // Update the file path and filename in the request object
    req.file.path = compressedImagePath;
    req.file.filename = `compressed-${image}`;

    next();
  } catch (error) {
    console.error("Error compressing image:", error);
    res.status(500).json({ message: "Error compressing image" });
  }
};

export default compressImage;
