import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { getAllFiles } from "../services/fileAggregator.service.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const data = await getAllFiles(req.user.id, {
      view: req.query.view,
      type: req.query.type,
      search: req.query.search,
      mode: req.query.mode, // 🔥 NEW
    });

    res.json(data); // 🔥 IMPORTANT FIX
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

export default router;