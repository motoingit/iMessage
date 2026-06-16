import { useWallpaper } from "../context/wallpaper";
import { useChatStore } from "../store/useChatStore";
import { useSelectedConversation } from "../hooks/useSelectedConversation";
import { useEffect } from "react";
import ChatSidebar from "../components/chat/ChatSidebar";
import { ChatHeader } from "../components/chat/ChatHeader";
import { MessageList } from "../components/chat/MessageList";
import { ChatComposer } from "../components/chat/ChatComposer";
import { useAuthStore } from "../store/useAuthStore";
import { getSoundsByCategory } from "../data/sounds";


function ChatPage() {
  const { frameStyle } = useWallpaper();

  const getConversations = useChatStore((state) => state.getConversations);
  const getMessages = useChatStore((state) => state.getMessages);
  const getUsers = useChatStore((state) => state.getUsers);
  const subscribeToMessages = useChatStore((state) => state.subscribeToMessages);
  const unsubscribeFromMessages = useChatStore((state) => state.unsubscribeFromMessages);

  const { activeConversation, activeConversationId, isLargeScreen } = useSelectedConversation();

  useEffect(() => {
    getUsers();
    getConversations();
  }, [getConversations, getUsers]);

  const authUser = useAuthStore((state) => state.authUser);

  useEffect(() => {
    if (authUser?.selectedBackMusicSoundId) {
      const backMusicSounds = getSoundsByCategory("back-music", authUser.customSounds);
      const activeTrack = backMusicSounds.find((s) => s.id === authUser.selectedBackMusicSoundId);
      if (activeTrack?.url) {
        if (window._activeAmbientMusic) {
          window._activeAmbientMusic.pause();
        }
        const music = new Audio(activeTrack.url);
        music.loop = true;
        music.volume = 0.20;
        music.play().catch((err) => console.log("Ambient music autoplay failed or blocked:", err));
        window._activeAmbientMusic = music;
      }
    } else {
      if (window._activeAmbientMusic) {
        window._activeAmbientMusic.pause();
        window._activeAmbientMusic = null;
      }
    }
  }, [authUser?.selectedBackMusicSoundId, authUser?.customSounds]);

  useEffect(() => {
    if (!activeConversationId) return;

    getMessages(activeConversationId);
    subscribeToMessages(activeConversationId);

    // cleanup - imporove performance
    return () => unsubscribeFromMessages();
  }, [getMessages, activeConversationId, subscribeToMessages, unsubscribeFromMessages]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden p-2 sm:p-3 md:p-8" style={frameStyle}>
      <div className="mx-auto flex w-full max-w-6xl flex-1 overflow-hidden rounded-2xl border border-border bg-background text-foreground">
        <ChatSidebar />

        <div
          className={`flex-1 flex-col overflow-hidden ${
            !isLargeScreen && !activeConversationId ? "hidden lg:flex" : "flex"
          }`}
        >
          <ChatHeader />
          <MessageList />

          {activeConversation ? <ChatComposer /> : null}
        </div>
      </div>
    </div>
  );
}
export default ChatPage;
