import express from "express";
import CloudAccount from "../models/CloudAccount.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/connected", auth, async (req, res) => {
  try {
    const clouds = await CloudAccount.find({
      userId: req.user.id
    }).select("provider");

    res.json(clouds.map(c => c.provider));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch clouds" });
  }
});

export default router;
