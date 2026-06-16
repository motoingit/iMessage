
import { create } from 'zustand'
import { axiosInstance } from '../lib/axios';

import {io} from 'socket.io-client';
import toast from 'react-hot-toast';


const BASE_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.MODE === "development" ? "http://localhost:3000/" : "/");

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    set({ isCheckingAuth: true});
    console.log("[useAuthStore] Checking auth status...");
    try{
      const res = await axiosInstance.get("/auth/check");
      console.log("[useAuthStore] Auth check success:", res.data);
      set({authUser: res.data});

      get().connectSocket(res.data);

    } catch(error){
      console.error("[useAuthStore] Error in checkAuth:", error);
      set({authUser: null});

    } finally{
      set({isCheckingAuth: false});
    }
  },

  clearAuth: ()=>{
    console.log("[useAuthStore] Clearing auth data.");
    set({authUser: null, isCheckingAuth: false, onlineUsers: []});
    get().disconnectSocket();
  },

  connectSocket: (user)=>{
    if(!user || get().socket?.connected) return;

    console.log("[useAuthStore] Connecting socket with BASE_URL:", BASE_URL, "for user:", user._id);
    const socket = io(BASE_URL, {query:{userId: user._id}})
    set({socket})

    socket.on("connect", () => {
      console.log("[useAuthStore] Socket connected successfully:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("[useAuthStore] Socket disconnected:", reason);
    });

    socket.on("getOnlineUsers", (userIds)=>{
      console.log("[useAuthStore] Received online users list:", userIds);
      set({onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) {
      console.log("[useAuthStore] Disconnecting socket.");
      socket.disconnect();
    }
    set({ socket: null });
  },

  updateUserSettings: async (settings) => {
    console.log("[useAuthStore] Updating settings on backend:", settings);
    try {
      const res = await axiosInstance.put("/user/settings", settings);
      set({ authUser: res.data });
      console.log("[useAuthStore] Settings updated in store:", res.data);
      return true;
    } catch (error) {
      console.error("[useAuthStore] Failed to update user settings:", error);
      toast.error(error.response?.data?.message || "Failed to update settings");
      return false;
    }
  },

  uploadCustomWallpaper: async (file) => {
    console.log("[useAuthStore] Uploading custom wallpaper...");
    const formData = new FormData();
    formData.append("media", file);

    try {
      const res = await axiosInstance.post("/user/wallpapers", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set({ authUser: res.data });
      console.log("[useAuthStore] Custom wallpaper uploaded:", res.data);
      toast.success("Wallpaper uploaded successfully");
      return true;
    } catch (error) {
      console.error("[useAuthStore] Failed to upload custom wallpaper:", error);
      toast.error(error.response?.data?.message || "Failed to upload wallpaper");
      return false;
    }
  },

  deleteCustomWallpaper: async (id) => {
    console.log("[useAuthStore] Deleting custom wallpaper:", id);
    try {
      const res = await axiosInstance.delete(`/user/wallpapers/${id}`);
      set({ authUser: res.data });
      console.log("[useAuthStore] Custom wallpaper deleted:", res.data);
      toast.success("Wallpaper deleted successfully");
      return true;
    } catch (error) {
      console.error("[useAuthStore] Failed to delete custom wallpaper:", error);
      toast.error(error.response?.data?.message || "Failed to delete wallpaper");
      return false;
    }
  },

  uploadCustomSound: async (file, category, label) => {
    console.log("[useAuthStore] Uploading custom sound...");
    const formData = new FormData();
    formData.append("media", file);
    formData.append("category", category);
    if (label) formData.append("label", label);

    try {
      const res = await axiosInstance.post("/user/sounds", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set({ authUser: res.data });
      console.log("[useAuthStore] Custom sound uploaded:", res.data);
      toast.success("Audio file uploaded successfully");
      return true;
    } catch (error) {
      console.error("[useAuthStore] Failed to upload custom sound:", error);
      toast.error(error.response?.data?.message || "Failed to upload sound");
      return false;
    }
  },

  deleteCustomSound: async (id) => {
    console.log("[useAuthStore] Deleting custom sound:", id);
    try {
      const res = await axiosInstance.delete(`/user/sounds/${id}`);
      set({ authUser: res.data });
      console.log("[useAuthStore] Custom sound deleted:", res.data);
      toast.success("Audio file deleted successfully");
      return true;
    } catch (error) {
      console.error("[useAuthStore] Failed to delete custom sound:", error);
      toast.error(error.response?.data?.message || "Failed to delete sound");
      return false;
    }
  },

}))
