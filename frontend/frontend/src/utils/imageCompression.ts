/**
 * Best-effort client-side image compression before upload, to keep
 * payloads small on low-bandwidth connections. Falls back to the
 * original file if compression fails for any reason (e.g. non-image
 * type, canvas errors) — never blocks submission.
 */
export async function compressImage(
  file: File,
  maxDimension = 1280,
  quality = 0.72
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (!blob) return file;

    const compressed = new File([blob], renameToJpeg(file.name), {
      type: "image/jpeg",
    });
    return compressed.size < file.size ? compressed : file;
  } catch {
    return file;
  }
}

function renameToJpeg(name: string): string {
  const base = name.replace(/\.[^/.]+$/, "");
  return `${base || "photo"}.jpg`;
}
