import { randomUUID } from "node:crypto";
import multer from "multer";
import { Client } from "@replit/object-storage";

const storage = new Client();

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

export async function storePersistentImage(
  file: Express.Multer.File,
): Promise<string> {
  const type = imageTypes[file.mimetype.toLowerCase()];
  if (!type || !Buffer.isBuffer(file.buffer)) {
    throw new Error("Unsupported image format");
  }

  const objectName = `managed-${randomUUID()}.${type.extension}`;
  const result = await storage.uploadFromBytes(objectName, file.buffer, {
    compress: false,
  });
  if (!result.ok) {
    throw new Error(result.error.message || "Unable to save image to App Storage");
  }
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

  const result = await storage.downloadAsBytes(objectName);
  if (!result.ok) {
    if (result.error.statusCode === 404) return null;
    throw new Error(result.error.message || "Unable to load image");
  }
  return { buffer: result.value[0], contentType: type.contentType };
}
