import pg from "pg";
import dotenv from "dotenv";
import https from "https";
import { config as AppConfig } from "../config/index.js";

dotenv.config();

function getRdsCaBundle(): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(
        "https://truststore.pki.rds.amazonaws.com/us-east-1/us-east-1-bundle.pem",
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => resolve(data));
        }
      )
      .on("error", reject);
  });
}

export async function createPool() {
  const ca = await getRdsCaBundle();
  const { Pool } = pg;

  const config = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT) || 5432,
  };

  if (AppConfig.isProd) {
    config["ssl"] = {
      rejectUnauthorized: true,
      ca,
    };
  } else {
    config["ssl"] = false;
  }

  return new Pool(config);
}

const pool = await createPool();

export default pool;
