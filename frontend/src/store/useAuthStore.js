
import { create } from 'zustand'
import { axiosInstance } from '../lib/axios';

import {io} from 'socket.io-client';


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

}))
