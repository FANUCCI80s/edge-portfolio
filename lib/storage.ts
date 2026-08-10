import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const PRIVATE_UPLOAD_ROOT = path.join(
  process.cwd(),
  "private-storage"
);

export async function savePrivateFile(
  file: File,
  folder: string
) {
  const extension = getSafeExtension(file.type);

  const randomName =
    `${Date.now()}-${randomBytes(16).toString("hex")}${extension}`;

  const directory = path.join(
    PRIVATE_UPLOAD_ROOT,
    folder
  );

  await mkdir(directory, {
    recursive: true,
  });

  const storageKey = path.join(
    folder,
    randomName
  );

  const absolutePath = path.join(
    PRIVATE_UPLOAD_ROOT,
    storageKey
  );

  const buffer = Buffer.from(
    await file.arrayBuffer()
  );

  await writeFile(absolutePath, buffer);

  return {
    storageKey,
    sizeBytes: buffer.length,
  };
}

function getSafeExtension(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return ".jpg";

    case "image/png":
      return ".png";

    case "application/pdf":
      return ".pdf";

    default:
      return "";
  }
}