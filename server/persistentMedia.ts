import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import multer from "multer";

const imageTypes: Record<string, { extension: string; contentType: string }> = {
  "image/avif": { extension: "avif", contentType: "image/avif" },
  "image/gif": { extension: "gif", contentType: "image/gif" },
  "image/jpeg": { extension: "jpg", contentType: "image/jpeg" },
  "image/png": { extension: "png", contentType: "image/png" },
  "image/webp": { extension: "webp", contentType: "image/webp" },
};

export const persistentImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (imageTypes[file.mimetype.toLowerCase()]) {
      callback(null, true);
    } else {
      callback(new Error("Upload a JPEG, PNG, WebP, GIF, or AVIF image"));
    }
  },
});

const managedImageNamePattern =
  /^managed-[0-9a-f-]{36}\.(?:avif|gif|jpg|png|webp)$/i;

const mediaDir = path.resolve(process.cwd(), "uploads", "managed");

export async function storePersistentImage(
  file: Express.Multer.File,
): Promise<string> {
  const type = imageTypes[file.mimetype.toLowerCase()];
  if (!type || !Buffer.isBuffer(file.buffer)) {
    throw new Error("Unsupported image format");
  }

  const objectName = `managed-${randomUUID()}.${type.extension}`;
  await fs.mkdir(mediaDir, { recursive: true });
  await fs.writeFile(path.join(mediaDir, objectName), file.buffer);
  return `/api/media/${objectName}`;
}

export async function loadPersistentImage(objectName: string): Promise<{
  buffer: Buffer;
  contentType: string;
} | null> {
  if (!managedImageNamePattern.test(objectName)) return null;
  const type = Object.values(imageTypes).find((imageType) =>
    objectName.toLowerCase().endsWith(`.${imageType.extension}`),
  );
  if (!type) return null;

  try {
    const buffer = await fs.readFile(path.join(mediaDir, objectName));
    return { buffer, contentType: type.contentType };
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "ENOENT"
    ) {
      return null;
    }
    throw error;
  }
}
