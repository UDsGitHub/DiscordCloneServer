import fs from "fs";
import path from "path";

const src = path.resolve("src/lib/database/us-east-1-bundle.pem");
const destDir = path.resolve("dist/lib/database");

if (!fs.existsSync(destDir)) {
    console.log("Destination directory does not exist");
} else {
    fs.copyFileSync(src, path.join(destDir, "us-east-1-bundle.pem"));
    console.log("✅ Copied us-east-1-bundle.pem");
}