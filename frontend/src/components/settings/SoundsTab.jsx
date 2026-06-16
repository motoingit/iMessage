import { Button, Tabs } from "@heroui/react";
import { Check, Music, Play, Trash2, Type, Upload, Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { getSoundsByCategory } from "../../data/sounds";
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

export function SoundsTab() {
  const authUser = useAuthStore((state) => state.authUser);
  const updateUserSettings = useAuthStore((state) => state.updateUserSettings);
  const uploadCustomSound = useAuthStore((state) => state.uploadCustomSound);
  const deleteCustomSound = useAuthStore((state) => state.deleteCustomSound);

  const fileInputRef = useRef(null);
  const [activeSoundTab, setActiveSoundTab] = useState("keystroke");
  const [isUploading, setIsUploading] = useState(false);

  // Load sound lists
  const keystrokeSounds = getSoundsByCategory("keystroke", authUser?.customSounds);
  const notifySounds = getSoundsByCategory("notify", authUser?.customSounds);
  const backMusicSounds = getSoundsByCategory("back-music", authUser?.customSounds);

  const activeKeystrokeId = authUser?.selectedKeystrokeSoundId || keystrokeSounds[0]?.id || "";
  const activeNotifyId = authUser?.selectedNotifySoundId || notifySounds[0]?.id || "";
  const activeBackMusicId = authUser?.selectedBackMusicSoundId || "";

  const handleSelectSound = async (id, label) => {
    if (activeSoundTab === "keystroke") {
      await updateUserSettings({ selectedKeystrokeSoundId: id });
    } else if (activeSoundTab === "notify") {
      await updateUserSettings({ selectedNotifySoundId: id });
    } else if (activeSoundTab === "back-music") {
      await updateUserSettings({ selectedBackMusicSoundId: id });
      playAmbientTrack(id);
    }
    toast.success(`Sound updated: ${label}`);
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsUploading(true);
    try {
      const label = file.name.substring(0, file.name.lastIndexOf("."));
      await uploadCustomSound(file, activeSoundTab, label);
    } finally {
      setIsUploading(false);
    }
  };

  const playAmbientTrack = (id) => {
    const currentTrack = backMusicSounds.find((s) => s.id === id);
    if (!currentTrack?.url) {
      window._activeAmbientMusic?.pause();
      return;
    }

    if (window._activeAmbientMusic) {
      window._activeAmbientMusic.pause();
    }

    const music = new Audio(currentTrack.url);
    music.loop = true;
    music.volume = 0.20;
    music.play().catch((err) => console.log("Ambient music play error:", err));
    window._activeAmbientMusic = music;
  };

  return (
    <div className="space-y-6 outline-none">
      {/* Audio category upload bar */}
      <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Add Custom Audio</h4>
          <p className="text-xs text-zinc-400 mt-0.5">
            Upload .mp3/.wav for {activeSoundTab === "keystroke" ? "keystrokes" : activeSoundTab === "notify" ? "alerts" : "background tracks"}.
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
          onPress={() => fileInputRef.current?.click()}
          startContent={!isUploading && <Upload className="size-4" />}
        >
          Upload Sound
        </Button>
      </div>

      {/* Sound sub categories */}
      <Tabs
        selectedKey={activeSoundTab}
        onSelectionChange={(key) => setActiveSoundTab(String(key))}
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

        <Tabs.Panel id="keystroke" className="mt-4 space-y-2 outline-none max-h-[30vh] overflow-y-auto pr-1">
          {/* None selection for keystroke sounds */}
          <div
            className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
              activeKeystrokeId === "none" ? "bg-white/10 ring-1 ring-accent" : "hover:bg-white/5"
            }`}
          >
            <button
              type="button"
              onClick={() => handleSelectSound("none", "Keys Muted")}
              className="flex-1 text-left flex items-center gap-3 py-1 cursor-pointer"
            >
              <div
                className={`size-8 rounded-lg flex items-center justify-center ${
                  activeKeystrokeId === "none" ? "bg-accent text-accent-foreground" : "bg-white/5 text-zinc-400"
                }`}
              >
                <VolumeX className="size-4.5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">None (Mute)</p>
                <p className="text-xs text-zinc-400">No keyboard click sound</p>
              </div>
            </button>
            {activeKeystrokeId === "none" ? (
              <div className="size-8 flex items-center justify-center text-accent">
                <Check className="size-5" strokeWidth={3} />
              </div>
            ) : (
              <div className="size-8" />
            )}
          </div>

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

        <Tabs.Panel id="notify" className="mt-4 space-y-2 outline-none max-h-[30vh] overflow-y-auto pr-1">
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

        <Tabs.Panel id="back-music" className="mt-4 space-y-2 outline-none max-h-[30vh] overflow-y-auto pr-1">
          {/* None selection for ambient music */}
          <div
            className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
              !activeBackMusicId ? "bg-white/10 ring-1 ring-accent" : "hover:bg-white/5"
            }`}
          >
            <button
              type="button"
              onClick={() => handleSelectSound("", "Music Muted")}
              className="flex-1 text-left flex items-center gap-3 py-1 cursor-pointer"
            >
              <div
                className={`size-8 rounded-lg flex items-center justify-center ${
                  !activeBackMusicId ? "bg-accent text-accent-foreground" : "bg-white/5 text-zinc-400"
                }`}
              >
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
    </div>
  );
}
