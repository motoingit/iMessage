import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema(
  //! dont put commnet on
  // _id auto genrated
  {
    clerkId:{
      type:String,
      required: true,
      unique: true,
    },

    email:{
      type:String,
      required: true,
      unique: true,
    },

    fullName:{
      type: String,
      required: true,
    },

    profilePic:{
      type: String,
      default: "",
    },

    customWallpapers: [
      {
        id: { type: String, required: true },
        label: { type: String, required: true },
        url: { type: String, required: true },
        imageKitFileId: { type: String },
      }
    ],

    customSounds: [
      {
        id: { type: String, required: true },
        label: { type: String, required: true },
        category: { type: String, enum: ["keystroke", "back-music", "notify", "syslogs"], required: true },
        url: { type: String, required: true },
        imageKitFileId: { type: String },
      }
    ],

    selectedWallpaperId: {
      type: String,
      default: "",
    },

    selectedThemePreset: {
      type: String,
      default: "",
    },

    selectedKeystrokeSoundId: {
      type: String,
      default: "",
    },

    selectedBackMusicSoundId: {
      type: String,
      default: "",
    },

    selectedNotifySoundId: {
      type: String,
      default: "",
    },
  },

  {timestamps: true},
  // createdAt, Modefed at
);

const User = mongoose.model("User", userSchema);
export default User;
