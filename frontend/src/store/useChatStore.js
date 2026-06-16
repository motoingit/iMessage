import { create } from "zustand";
import { persist } from "zustand/middleware";

import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { getSoundsByCategory } from "../data/sounds";
import toast from "react-hot-toast";

//todo: persist
export const useChatStore = create(
  persist(
    (set, get) => ({
      users: [],
      conversations: [],
      messages: [],
      selectedUser: null,
      isConversationsLoading: false,
      isUsersLoading: false,
      isMessagesLoading: false,
      activeConversationId: null,
      searchQuery: "",
      sidebarTab: "chats",
      composerText: "",
      isSoundEnabled: true,
      isSendingMedia: false,

      getUsers: async () => {
        set({ isUsersLoading: true });
        console.log("[useChatStore] Fetching users list...");
        try {
          const res = await axiosInstance.get("/messages/users");
          console.log("[useChatStore] Users list loaded:", res.data);
          set((state) => ({
            users: res.data,
            selectedUser:
              state.selectedUser && res.data.some((user) => user._id === state.selectedUser._id)
                ? state.selectedUser
                : null,
          }));
        } catch (error) {
          console.error("[useChatStore] Error in getUsers:", error);
          toast.error("Failed to load users list: " + (error.response?.data?.message || error.message));
        } finally {
          set({ isUsersLoading: false });
        }
      },

      getConversations: async () => {
        set({ isConversationsLoading: true });
        console.log("[useChatStore] Fetching conversations list...");
        try {
          const res = await axiosInstance.get("/messages/conversations");
          console.log("[useChatStore] Conversations list loaded:", res.data);
          set({ conversations: res.data });
        } catch (error) {
          console.error("[useChatStore] Error in getConversations:", error);
          toast.error("Failed to load conversations: " + (error.response?.data?.message || error.message));
        } finally {
          set({ isConversationsLoading: false });
        }
      },

      getMessages: async (userId) => {
        if (!userId) return;
        set({ isMessagesLoading: true });
        console.log("[useChatStore] Fetching messages for user:", userId);
        try {
          const res = await axiosInstance.get(`/messages/${userId}`);
          console.log("[useChatStore] Messages loaded successfully:", res.data.length, "messages");
          set({ messages: res.data });
        } catch (error) {
          console.error("[useChatStore] Error in getMessages:", error);
          toast.error(error.response?.data?.message || "Failed to load messages");
        } finally {
          set({ isMessagesLoading: false });
        }
      },

      sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        if (!selectedUser) return false;

        console.log("[useChatStore] Sending message to user:", selectedUser._id);
        try {
          const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
          console.log("[useChatStore] Message sent successfully. Response:", res.data);
          set({ messages: [...messages, res.data], composerText: "" });
          get().getConversations();
          return true;
        } catch (error) {
          console.error("[useChatStore] Error in sendMessage:", error);
          toast.error(error.response?.data?.message || "Failed to send message");
          return false;
        }
      },

      subscribeToMessages: (activePartnerId) => {
        const socket = useAuthStore.getState().socket;
        if (!socket) {
          console.warn("[useChatStore] Socket is not connected, cannot subscribe to messages");
          return;
        }

        console.log("[useChatStore] Subscribing to newMessage events. Active partner:", activePartnerId);
        socket.off("newMessage");
        socket.on("newMessage", (newMessage) => {
          console.log("[useChatStore] Received real-time newMessage event:", newMessage);

          // 1. Prevent duplicate message additions
          const currentMessages = get().messages;
          const isDuplicate = currentMessages.some((m) => m._id === newMessage._id);

          // 2. Append to messages if it belongs to the active conversation
          if (activePartnerId) {
            const isFromPartner = String(newMessage.senderId) === String(activePartnerId);
            const isToPartner = String(newMessage.receiverId) === String(activePartnerId);

            if ((isFromPartner || isToPartner) && !isDuplicate) {
              set({ messages: [...currentMessages, newMessage] });
            }
          }

          // 3. Play notify sound if it's an incoming message (not sent by us) and sound is enabled
          const authUser = useAuthStore.getState().authUser;
          const isIncoming = authUser && String(newMessage.senderId) !== String(authUser._id);
          const isSoundEnabled = get().isSoundEnabled;

          if (isIncoming && isSoundEnabled) {
            const notifySounds = getSoundsByCategory("notify", authUser?.customSounds);
            if (notifySounds.length > 0) {
              const selectedId = authUser?.selectedNotifySoundId;
              const soundObj = notifySounds.find((s) => s.id === selectedId) || notifySounds[0];
              if (soundObj?.url) {
                const audio = new Audio(soundObj.url);
                audio.play().catch((err) => console.log("[useChatStore] Failed to play notify sound:", err));
              }
            }
          }

          // 4. Refresh sidebar conversations list for sorting and last message updates
          get().getConversations();
        });
      },

      unsubscribeFromMessages: () => {
        console.log("[useChatStore] Unsubscribing from newMessage events");
        const socket = useAuthStore.getState().socket;
        socket?.off("newMessage");
      },

      setSelectedUser: (selectedUser) => {
        console.log("[useChatStore] Setting selected user:", selectedUser?._id);
        set({ selectedUser });
      },

      setActiveConversationId: (activeConversationId) => {
        console.log("[useChatStore] Setting active conversation ID:", activeConversationId);
        set((state) => ({
          activeConversationId,
          selectedUser:
            state.users.find((user) => user._id === activeConversationId) ||
            state.conversations.find((user) => user._id === activeConversationId) ||
            null,
          messages: activeConversationId ? state.messages : [],
        }));
      },

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSidebarTab: (sidebarTab) => set({ sidebarTab }),
      setComposerText: (composerText) => set({ composerText }),
      setSoundEnabled: (isSoundEnabled) => set({ isSoundEnabled }),

      sendTextMessage: async (conversationId) => {
        const messageText = get().composerText.trim();
        if (!conversationId || !messageText) return false;

        return get().sendMessage({ text: messageText });
      },

      sendMediaMessage: async ({ conversationId, file }) => {
        if (!conversationId || !file) return false;

        const formData = new FormData();
        formData.append("media", file);

        set({ isSendingMedia: true });
        console.log("[useChatStore] Sending media message file:", file.name);
        try {
          const success = await get().sendMessage(formData);
          if (success) {
            toast.success("Media message sent successfully");
          }
          return success;
        } finally {
          set({ isSendingMedia: false });
        }
      },
    }),
    {
      name: "imessage-storage",
      partialize: (state) => ({ isSoundEnabled: state.isSoundEnabled }),
    },
  ),
);
