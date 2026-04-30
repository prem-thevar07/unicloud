import express from "express";
import auth from "../middleware/auth.middleware.js";
import { getPhotos } from "../controllers/photo.controller.js";

const router = express.Router();

router.post("/", auth, getPhotos); // Using POST so we can pass pageTokens cleanly in body

export default router;
