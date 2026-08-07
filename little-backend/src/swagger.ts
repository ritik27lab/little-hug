import fs from "fs";
import path from "path";

export const swaggerSpec = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../api.json"), "utf-8"),
);
