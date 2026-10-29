const JPEG_EXTENSIONS = new Set([".jpg", ".jpeg"]);
const PNG_EXTENSION = ".png";

export function isAllowedJpgPngAttachment(file: {
  name: string;
  type: string;
}): boolean {
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const mimeType = file.type.toLowerCase();

  return (
    (mimeType === "image/jpeg" && JPEG_EXTENSIONS.has(extension)) ||
    (mimeType === "image/png" && extension === PNG_EXTENSION)
  );
}

export function hasJpegOrPngSignature(
  bytes: Uint8Array,
  mimeType?: string,
): boolean {
  const isJpeg =
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff;
  const isPng =
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;

  if (mimeType === "image/jpeg") return isJpeg;
  if (mimeType === "image/png") return isPng;
  return isJpeg || isPng;
}
