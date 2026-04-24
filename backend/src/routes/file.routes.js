import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { getAllFiles } from "../services/fileAggregator.service.js";

const router = express.Router();

/* ===============================
   GET ALL FILES
=============================== */
router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log("📥 /api/files hit");

    const data = await getAllFiles(req.user.id, {
      view: req.query.view,
      type: req.query.type,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit,
    });

    console.log("📦 Sending response");

    return res.status(200).json(data); // 🔥 THIS WAS MISSING
  } catch (err) {
    console.error("❌ File Route Error:", err.message);

    return res.status(500).json({
      error: "Failed to fetch files",
    });
  }
});

export default router;