export const normalizeFile = (
  file,
  provider,
  accountId,
  accountEmail
) => {
  let type = "other";

  if (provider === "google") {
    if (file.mimeType?.startsWith("image/")) type = "image";
    else if (file.mimeType?.startsWith("video/")) type = "video";
    else if (file.mimeType?.includes("pdf")) type = "document";
    else if (
      file.mimeType?.includes("word") ||
      file.mimeType?.includes("sheet") ||
      file.mimeType?.includes("excel")
    )
      type = "document";

    return {
      id: file.id,
      name: file.name,
      type,
      size: file.size || 0,
      provider,
      accountId,
      accountEmail, // 🔥 NEW
      thumbnail: file.thumbnailLink || null,
      url: file.webViewLink || null,
      createdAt: file.createdTime || null,
    };
  }

  return null;
};