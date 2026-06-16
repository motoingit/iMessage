import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import {
  uploadWallpaper,
  deleteWallpaper,
  uploadSound,
  deleteSound,
  updateSettings,
} from "../controllers/user.controller.js";

const router = express.Router();

// All routes are protected by default
router.use(protectRoute);

router.post("/wallpapers", upload.single("media"), uploadWallpaper);
router.delete("/wallpapers/:id", deleteWallpaper);

router.post("/sounds", upload.single("media"), uploadSound);
router.delete("/sounds/:id", deleteSound);

router.put("/settings", updateSettings);

export default router;
