import { changePassword } from "../controllers/profile.controller.js";
import express from "express";
import {
  getProfileSummary,
  updateProfileName,
} from "../controllers/profile.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/summary", auth);
router.get("/summary", auth, getProfileSummary);
router.put("/update-name", auth, updateProfileName);
router.put("/change-password", auth, changePassword);





export default router;
