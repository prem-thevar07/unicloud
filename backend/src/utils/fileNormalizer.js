export const normalizeFile = (file, provider, accountId) => {
  let type = "other";

  if (provider === "google") {
    if (file.mimeType?.startsWith("image/")) type = "image";
    else if (file.mimeType?.startsWith("video/")) type = "video";
    else if (
      file.mimeType?.includes("pdf") ||
      file.mimeType?.includes("document")
    ) {
      type = "document";
    }

    const fileId = file.id;

    return {
      id: fileId,
      name: file.name,
      type,
      provider,
      accountId,

      // 🔥 FIXED THUMBNAIL
      thumbnail: `https://drive.google.com/thumbnail?id=${fileId}&sz=w320`,

      // preview (iframe)
      previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,

      // open in new tab
      url: `https://drive.google.com/file/d/${fileId}/view`,

      createdAt: file.createdTime,
    };
  }

  return null;
};