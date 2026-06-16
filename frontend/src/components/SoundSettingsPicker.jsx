import { Button, Modal, useOverlayState, Tabs } from "@heroui/react";
import { Music, Play, Trash2, Type, Upload, Volume2, Check } from "lucide-react";
import { useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { getSoundsByCategory } from "../data/sounds";
import toast from "react-hot-toast";

function SoundRow({ sound, selected, onSelect, onDelete, isCustom }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = (e) => {
    e.stopPropagation();
    if (!sound.url) return;

    setIsPlaying(true);
    const audio = new Audio(sound.url);
    audio.currentTime = 0;
    audio.play()
      .then(() => {
        // Stop playing indicator when ended
        audio.onended = () => setIsPlaying(false);
      })
      .catch((err) => {
        console.warn("Failed to play preview:", err);
        setIsPlaying(false);
      });
  };

  return (
    <div className={`flex items-center justify-between p-2 rounded-xl transition-colors ${selected ? "bg-white/10 ring-1 ring-accent" : "hover:bg-white/5"}`}>
      <button
        type="button"
        onClick={() => onSelect(sound.id, sound.label)}
        className="flex-1 text-left flex items-center gap-3 py-1 cursor-pointer"
      >
        <div className={`size-8 rounded-lg flex items-center justify-center ${selected ? "bg-accent text-accent-foreground" : "bg-white/5 text-zinc-400"}`}>
          <Volume2 className="size-4.5" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{sound.label}</p>
          <p className="text-xs text-zinc-400 capitalize">{isCustom ? "Uploaded" : "System Preset"}</p>
        </div>
      </button>

      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="ghost"
          isIconOnly
          onPress={handlePlay}
          className={`size-8 text-zinc-300 ${isPlaying ? "text-accent animate-pulse" : ""}`}
        >
          <Play className="size-4 fill-current" />
        </Button>

        {isCustom ? (
          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            onPress={() => onDelete(sound.id)}
            className="size-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            title="Delete sound"
          >
            <Trash2 className="size-4" />
          </Button>
        ) : null}

        {selected ? (
          <div className="size-8 flex items-center justify-center text-accent">
            <Check className="size-5" strokeWidth={3} />
          </div>
        ) : (
          <div className="size-8" />
        )}
      </div>
    </div>
  );
}

export function SoundSettingsPicker() {
  const modal = useOverlayState();
  const authUser = useAuthStore((state) => state.authUser);
  const updateUserSettings = useAuthStore((state) => state.updateUserSettings);
  const uploadCustomSound = useAuthStore((state) => state.uploadCustomSound);
  const deleteCustomSound = useAuthStore((state) => state.deleteCustomSound);

  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("keystroke");
  const [isUploading, setIsUploading] = useState(false);

  // Load sound lists dynamically
  const keystrokeSounds = getSoundsByCategory("keystroke", authUser?.customSounds);
  const notifySounds = getSoundsByCategory("notify", authUser?.customSounds);
  const backMusicSounds = getSoundsByCategory("back-music", authUser?.customSounds);

  // Resolve current active selection or default to the first element in each category
  const activeKeystrokeId = authUser?.selectedKeystrokeSoundId || keystrokeSounds[0]?.id || "";
  const activeNotifyId = authUser?.selectedNotifySoundId || notifySounds[0]?.id || "";
  const activeBackMusicId = authUser?.selectedBackMusicSoundId || "";

  const handleSelectSound = async (id, label) => {
    if (activeTab === "keystroke") {
      await updateUserSettings({ selectedKeystrokeSoundId: id });
    } else if (activeTab === "notify") {
      await updateUserSettings({ selectedNotifySoundId: id });
    } else if (activeTab === "back-music") {
      await updateUserSettings({ selectedBackMusicSoundId: id });
      // Play the selected background track immediately
      playAmbientTrack(id);
    }
    toast.success(`Sound updated: ${label}`);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsUploading(true);
    try {
      const label = file.name.substring(0, file.name.lastIndexOf("."));
      await uploadCustomSound(file, activeTab, label);
    } finally {
      setIsUploading(false);
    }
  };

  // Helper to trigger background ambient sound loop
  const playAmbientTrack = (id) => {
    // If background music loop is implemented in a global provider, we trigger it here
    const currentTrack = backMusicSounds.find(s => s.id === id);
    if (!currentTrack?.url) {
      window._activeAmbientMusic?.pause();
      return;
    }
    
    if (window._activeAmbientMusic) {
      window._activeAmbientMusic.pause();
    }

    const music = new Audio(currentTrack.url);
    music.loop = true;
    music.volume = 0.25; // Quiet volume for background tracks
    music.play().catch(err => console.log("Ambient music play error:", err));
    window._activeAmbientMusic = music;
  };

  return (
    <Modal.Root state={modal}>
      <Modal.Trigger>
        <Button variant="ghost" size="sm" isIconOnly className="text-foreground">
          <Volume2 className="size-5" />
        </Button>
      </Modal.Trigger>

      <Modal.Backdrop variant="opaque">
        <Modal.Container size="md" scroll="inside" placement="center">
          <Modal.Dialog className="max-h-[85dvh] border border-white/10 bg-[#2a2a2c] text-foreground shadow-2xl">
            <Modal.Header className="flex flex-row items-center justify-between gap-3 border-b border-white/10 pb-3">
              <Modal.Heading className="text-lg font-semibold tracking-tight text-white">
                Sound Customization
              </Modal.Heading>
              <Modal.CloseTrigger />
            </Modal.Header>

            <Modal.Body className="isolate space-y-6 pt-4">
              <Tabs
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(String(key))}
                variant="secondary"
                className="w-full"
              >
                <Tabs.List className="w-full bg-white/5 rounded-xl gap-0.5 p-1">
                  <Tabs.Tab id="keystroke" className="flex-1 justify-center gap-1.5 py-2">
                    <Type className="size-4" />
                    Keys
                  </Tabs.Tab>
                  <Tabs.Tab id="notify" className="flex-1 justify-center gap-1.5 py-2">
                    <Volume2 className="size-4" />
                    Alerts
                  </Tabs.Tab>
                  <Tabs.Tab id="back-music" className="flex-1 justify-center gap-1.5 py-2">
                    <Music className="size-4" />
                    Music
                  </Tabs.Tab>
                </Tabs.List>

                {/* Upload Sound Bar */}
                <div className="flex items-center justify-between rounded-xl bg-white/5 p-4 mt-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Add Custom Audio</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Upload an .mp3 or .wav for {activeTab === "keystroke" ? "keystrokes" : activeTab === "notify" ? "alerts" : "background tracks"}.
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="audio/mp3,audio/wav,audio/mpeg,audio/x-wav"
                    onChange={handleUploadFile}
                    className="hidden"
                  />
                  <Button
                    size="sm"
                    color="primary"
                    isLoading={isUploading}
                    onPress={handleUploadClick}
                    startContent={!isUploading && <Upload className="size-4" />}
                  >
                    Upload Sound
                  </Button>
                </div>

                {/* List Panels */}
                <Tabs.Panel id="keystroke" className="mt-4 space-y-2 outline-none">
                  {keystrokeSounds.length === 0 ? (
                    <p className="text-center py-6 text-sm text-zinc-500">No sounds available.</p>
                  ) : (
                    keystrokeSounds.map((sound) => (
                      <SoundRow
                        key={sound.id}
                        sound={sound}
                        selected={activeKeystrokeId === sound.id}
                        onSelect={handleSelectSound}
                        onDelete={deleteCustomSound}
                        isCustom={sound.id.startsWith("custom-")}
                      />
                    ))
                  )}
                </Tabs.Panel>

                <Tabs.Panel id="notify" className="mt-4 space-y-2 outline-none">
                  {notifySounds.length === 0 ? (
                    <p className="text-center py-6 text-sm text-zinc-500">No alert tones available.</p>
                  ) : (
                    notifySounds.map((sound) => (
                      <SoundRow
                        key={sound.id}
                        sound={sound}
                        selected={activeNotifyId === sound.id}
                        onSelect={handleSelectSound}
                        onDelete={deleteCustomSound}
                        isCustom={sound.id.startsWith("custom-")}
                      />
                    ))
                  )}
                </Tabs.Panel>

                <Tabs.Panel id="back-music" className="mt-4 space-y-2 outline-none">
                  {/* None selection for ambient music */}
                  <div className={`flex items-center justify-between p-2 rounded-xl transition-colors ${!activeBackMusicId ? "bg-white/10 ring-1 ring-accent" : "hover:bg-white/5"}`}>
                    <button
                      type="button"
                      onClick={() => handleSelectSound("", "Music Muted")}
                      className="flex-1 text-left flex items-center gap-3 py-1 cursor-pointer"
                    >
                      <div className={`size-8 rounded-lg flex items-center justify-center ${!activeBackMusicId ? "bg-accent text-accent-foreground" : "bg-white/5 text-zinc-400"}`}>
                        <Volume2 className="size-4.5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">None (Mute)</p>
                        <p className="text-xs text-zinc-400">Silent background</p>
                      </div>
                    </button>
                    {!activeBackMusicId ? (
                      <div className="size-8 flex items-center justify-center text-accent">
                        <Check className="size-5" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="size-8" />
                    )}
                  </div>

                  {backMusicSounds.map((sound) => (
                    <SoundRow
                      key={sound.id}
                      sound={sound}
                      selected={activeBackMusicId === sound.id}
                      onSelect={handleSelectSound}
                      onDelete={deleteCustomSound}
                      isCustom={sound.id.startsWith("custom-")}
                    />
                  ))}
                </Tabs.Panel>
              </Tabs>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal.Root>
  );
}
