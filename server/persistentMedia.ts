import { randomUUID } from "node:crypto";
import multer from "multer";
import { Client } from "@replit/object-storage";

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

function storageError(error: unknown): Error {
  const message =
    error && typeof error === "object" && "message" in error
      ? String((error as { message?: unknown }).message ?? "")
      : "";
  if (/bucket name is needed/i.test(message)) {
    return new Error(
      "App Storage is not configured yet. Create a bucket in Replit Tools > App Storage, then retry the upload.",
    );
  }
  return new Error("App Storage is unavailable. Please retry.");
}

export async function storePersistentImage(
  file: Express.Multer.File,
): Promise<string> {
  const type = imageTypes[file.mimetype.toLowerCase()];
  if (!type || !Buffer.isBuffer(file.buffer)) {
    throw new Error("Unsupported image format");
  }

  const objectName = `managed-${randomUUID()}.${type.extension}`;
  try {
    const result = await new Client().uploadFromBytes(
      objectName,
      file.buffer,
      { compress: false },
    );
    if (!result.ok) {
      throw result.error;
    }
    return `/api/media/${objectName}`;
  } catch (error) {
    throw storageError(error);
  }
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
    const result = await new Client().downloadAsBytes(objectName);
    if (!result.ok) {
      if (result.error.statusCode === 404) return null;
      throw result.error;
    }
    return { buffer: result.value[0], contentType: type.contentType };
  } catch (error) {
    const message =
      error && typeof error === "object" && "message" in error
        ? String((error as { message?: unknown }).message ?? "")
        : "";
    if (/not found/i.test(message)) return null;
    throw storageError(error);
  }
}
