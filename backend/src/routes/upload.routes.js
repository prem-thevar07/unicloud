import express from "express";
import multer from "multer";
import os from "os";
import auth from "../middleware/auth.middleware.js";
import { uploadFile } from "../controllers/upload.controller.js";

const router = express.Router();

// Use disk storage to prevent RAM exhaustion on massive files
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, os.tmpdir()),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 * 1024 } // 5GB limit
});

// POST /api/upload
router.post("/", auth, upload.single("file"), uploadFile);

export default router;
