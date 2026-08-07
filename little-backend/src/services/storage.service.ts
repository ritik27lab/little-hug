import fs from "fs";
import path from "path";
import { env } from "../config/env";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Dev/local implementation: writes the buffer to ./uploads and returns a
 * URL served by the static middleware registered in app.ts.
 *
 * Swap this file's implementation for an S3 or Azure Blob upload in
 * production — the function signature (buffer + extension in, public URL
 * out) is the only contract the rest of the app depends on.
 */
export async function saveAgendaImage(buffer: Buffer, originalName: string): Promise<string> {
  const ext = path.extname(originalName) || ".jpg";
  const filename = `agenda_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);
  await fs.promises.writeFile(filePath, buffer);
  return `${env.publicUploadsBaseUrl}/${filename}`;
}

export { UPLOAD_DIR };
