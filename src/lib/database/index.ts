import pg from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 5432,
  ssl: {
    ca: fs.readFileSync(path.resolve(__dirname, "./us-east-1-bundle.pem")).toString(),
    rejectUnauthorized: process.env.NODE_ENV === "production",
  },
});

export default pool;
