import multer, { FileFilterCallback } from "multer";
import path from "path";
import { config } from "../config/index.js";
import { Request } from "express";

const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024; // 5MB

type StorageFileFilterCallback = (
  error: Error | null,
  destination: string
) => void;

const getStorage = () => {
  if (config.isProd) {
    return multer.memoryStorage();
  } else {
    return multer.diskStorage({
      destination: (
        req: Request,
        file: Express.Multer.File,
        cb: StorageFileFilterCallback
      ) => {
        cb(null, config.uploadPath);
      },
      filename: (
        req: Request,
        file: Express.Multer.File,
        cb: StorageFileFilterCallback
      ) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      },
    });
  }
};

function getFileUploader(allowedTypes: string[]) {
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
    storage: getStorage(),
    fileFilter,
    limits: { fileSize: MAX_IMAGE_FILE_SIZE },
  });
}

export const imageFileUploader = getFileUploader([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
