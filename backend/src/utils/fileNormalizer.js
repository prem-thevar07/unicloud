export const normalizeFile = (
  file,
  provider,
  accountId,
  accountEmail
) => {
  if (!file) return null;

  let type = "other";

  /* ===============================
     GOOGLE NORMALIZATION
  =============================== */
  if (provider === "google") {
    // ❌ Skip folders (important)
    if (file.mimeType === "application/vnd.google-apps.folder") {
      return null;
    }

    const mime = file.mimeType || "";
    const name = file.name || "Unnamed File";

    /* ===============================
       TYPE DETECTION (ROBUST)
    =============================== */
    if (mime.startsWith("image/")) {
      type = "image";
    } else if (mime.startsWith("video/")) {
      type = "video";
    } else if (
      mime.includes("pdf") ||
      mime.includes("document") ||
      mime.includes("word") ||
      mime.includes("sheet") ||
      mime.includes("excel") ||
      mime.includes("presentation") ||
      mime.includes("text")
    ) {
      type = "document";
    }

    /* ===============================
       CLEAN RETURN OBJECT
    =============================== */
    return {
      id: file.id,

      // 🔥 Safe name
      name,

      type,

      size: Number(file.size) || 0,

      provider,

      accountId,
      accountEmail,

      // 🔥 Thumbnail fix (sometimes Google blocks it)
      thumbnail:
        file.thumbnailLink
          ? file.thumbnailLink.replace("=s220", "=s400")
          : null,

      url: file.webViewLink || null,

      createdAt: file.createdTime || null,

      // 🔥 Extra (future use)
      mimeType: mime,
    };
  }

  return null;
};