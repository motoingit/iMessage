import { useAuthStore } from "../store/useAuthStore";
import { getSoundsByCategory } from "../data/sounds";

function useKeyboardSounds() {
  const authUser = useAuthStore((state) => state.authUser);

  const playRandomKeyStrokeSound = () => {
    const keystrokeSounds = getSoundsByCategory("keystroke", authUser?.customSounds);
    if (keystrokeSounds.length === 0) return;

    // Resolve active selection: database settings -> fallback to the first sound in the list
    const selectedId = authUser?.selectedKeystrokeSoundId;
    const soundObj = keystrokeSounds.find((s) => s.id === selectedId) || keystrokeSounds[0];

    if (!soundObj || !soundObj.url) return;

    const audio = new Audio(soundObj.url);
    audio.currentTime = 0;
    audio.play().catch((error) => console.log("[useKeyboardSounds] Audio play failed:", error));
  };

  return { playRandomKeyStrokeSound };
}

export default useKeyboardSounds;
