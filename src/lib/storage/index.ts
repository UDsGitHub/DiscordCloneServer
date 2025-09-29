import multer, { FileFilterCallback } from "multer";
import path from "path";
import { config } from "../config/index.js";
import { Request } from "express";

const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024; // 5MB

type StorageFileFilterCallback = (
  error: Error | null,
  destination: string
) => void;

function getFileUploader(allowedTypes: string[]) {
  // Configure storage
  const storage = multer.diskStorage({
    destination: (
      req: Request,
      file: Express.Multer.File,
      cb: StorageFileFilterCallback
    ) => {
      cb(null, config.uploadPath); // Directory to save files
    },
    filename: (
      req: Request,
      file: Express.Multer.File,
      cb: StorageFileFilterCallback
    ) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname)); // Save with unique name
    },
  });

  // File filter for validation
  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type."));
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_IMAGE_FILE_SIZE },
  });
}

export const imageFileUploader = getFileUploader([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
