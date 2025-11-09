import dotenv from "dotenv";

dotenv.config();

export enum NodeEnv {
  PROD = "production",
  DEV = "development",
}

type ConfigType = {
  port: number;
  corsOrigin: string;
  uploadPath: string;
  isProd: boolean;
  expiresIn: number
};

export const config: ConfigType = {
  port: parseInt(process.env.PORT) || 3000,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  uploadPath: process.env.UPLOAD_PATH || "data/",
  isProd: process.env.NODE_ENV === NodeEnv.PROD,
  expiresIn: 3600
};
