import User from "../models/user.model.js";
import { hasImageKitConfig, uploadGenericMedia, deleteImageKitMedia } from "../lib/imagekit.js";

function getCleanLabel(originalName) {
  const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf("."));
  return nameWithoutExt
    .replace(/[^a-zA-Z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function uploadWallpaper(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No wallpaper file provided" });
    }

    if (!hasImageKitConfig()) {
      return res.status(500).json({ message: "ImageKit configuration is missing" });
    }

    console.log("[UserController] Uploading custom wallpaper:", req.file.originalname);
    const { url, fileId } = await uploadGenericMedia(req.file, "/wallpapers");

    const wallpaperId = `custom-wallpaper-${Date.now()}`;
    const label = getCleanLabel(req.file.originalname);

    const newWallpaper = {
      id: wallpaperId,
      label,
      url,
      imageKitFileId: fileId,
    };

    req.user.customWallpapers.push(newWallpaper);
    await req.user.save();

    console.log("[UserController] Custom wallpaper uploaded successfully:", wallpaperId);
    res.status(201).json(req.user);
  } catch (error) {
    console.error("[UserController] Error in uploadWallpaper:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteWallpaper(req, res) {
  try {
    const { id } = req.params;
    console.log("[UserController] Deleting custom wallpaper:", id);

    const wallpaper = req.user.customWallpapers.find((w) => w.id === id);
    if (!wallpaper) {
      return res.status(404).json({ message: "Wallpaper not found" });
    }

    if (wallpaper.imageKitFileId) {
      try {
        await deleteImageKitMedia(wallpaper.imageKitFileId);
      } catch (err) {
        console.warn("[UserController] Failed to delete file from ImageKit:", err.message);
      }
    }

    req.user.customWallpapers = req.user.customWallpapers.filter((w) => w.id !== id);

    if (req.user.selectedWallpaperId === id) {
      req.user.selectedWallpaperId = "";
    }

    await req.user.save();
    console.log("[UserController] Custom wallpaper deleted successfully:", id);
    res.status(200).json(req.user);
  } catch (error) {
    console.error("[UserController] Error in deleteWallpaper:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function uploadSound(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No sound file provided" });
    }

    const { category, label: customLabel } = req.body;
    const allowedCategories = ["keystroke", "back-music", "notify", "syslogs"];

    if (!category || !allowedCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid sound category" });
    }

    if (!hasImageKitConfig()) {
      return res.status(500).json({ message: "ImageKit configuration is missing" });
    }

    console.log(`[UserController] Uploading custom sound (${category}):`, req.file.originalname);
    const { url, fileId } = await uploadGenericMedia(req.file, `/sounds/${category}`);

    const soundId = `custom-sound-${Date.now()}`;
    const label = customLabel || getCleanLabel(req.file.originalname);

    const newSound = {
      id: soundId,
      label,
      category,
      url,
      imageKitFileId: fileId,
    };

    req.user.customSounds.push(newSound);
    await req.user.save();

    console.log("[UserController] Custom sound uploaded successfully:", soundId);
    res.status(201).json(req.user);
  } catch (error) {
    console.error("[UserController] Error in uploadSound:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteSound(req, res) {
  try {
    const { id } = req.params;
    console.log("[UserController] Deleting custom sound:", id);

    const sound = req.user.customSounds.find((s) => s.id === id);
    if (!sound) {
      return res.status(404).json({ message: "Sound not found" });
    }

    if (sound.imageKitFileId) {
      try {
        await deleteImageKitMedia(sound.imageKitFileId);
      } catch (err) {
        console.warn("[UserController] Failed to delete sound file from ImageKit:", err.message);
      }
    }

    req.user.customSounds = req.user.customSounds.filter((s) => s.id !== id);

    // Reset settings if user was using this sound
    if (req.user.selectedKeystrokeSoundId === id) req.user.selectedKeystrokeSoundId = "";
    if (req.user.selectedBackMusicSoundId === id) req.user.selectedBackMusicSoundId = "";
    if (req.user.selectedNotifySoundId === id) req.user.selectedNotifySoundId = "";

    await req.user.save();
    console.log("[UserController] Custom sound deleted successfully:", id);
    res.status(200).json(req.user);
  } catch (error) {
    console.error("[UserController] Error in deleteSound:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateSettings(req, res) {
  try {
    const {
      selectedWallpaperId,
      selectedThemePreset,
      selectedKeystrokeSoundId,
      selectedBackMusicSoundId,
      selectedNotifySoundId,
    } = req.body;

    console.log("[UserController] Updating settings for user:", req.user._id);

    if (selectedWallpaperId !== undefined) req.user.selectedWallpaperId = selectedWallpaperId;
    if (selectedThemePreset !== undefined) req.user.selectedThemePreset = selectedThemePreset;
    if (selectedKeystrokeSoundId !== undefined) req.user.selectedKeystrokeSoundId = selectedKeystrokeSoundId;
    if (selectedBackMusicSoundId !== undefined) req.user.selectedBackMusicSoundId = selectedBackMusicSoundId;
    if (selectedNotifySoundId !== undefined) req.user.selectedNotifySoundId = selectedNotifySoundId;

    await req.user.save();
    console.log("[UserController] Settings updated successfully");
    res.status(200).json(req.user);
  } catch (error) {
    console.error("[UserController] Error in updateSettings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
