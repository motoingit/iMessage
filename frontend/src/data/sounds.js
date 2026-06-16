// Scan all audio files in the sounds folder recursively.
// Keys are like "../assets/sounds/keystroke/keystroke1.mp3".
// We import defaults to get the compiled asset URLs.
const modules = import.meta.glob("../assets/sounds/**/*.{mp3,wav,ogg,m4a,aac}", {
  eager: true,
  import: "default",
});

// Build the LOCAL_SOUNDS array by parsing the keys and values.
export const LOCAL_SOUNDS = Object.entries(modules).map(([path, url]) => {
  const parts = path.split("/");
  const category = parts[parts.length - 2]; // "keystroke", "back-music", "notify", "syslogs"
  const fileNameWithExt = parts[parts.length - 1]; // "keystroke1.mp3"
  
  // Get filename without extension
  const id = fileNameWithExt.substring(0, fileNameWithExt.lastIndexOf("."));
  
  // Generate label from id: e.g. "keystroke-one" -> "Keystroke One"
  const label = id
    .replace(/[_-]/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    id,
    label,
    category,
    url,
  };
});

/**
 * Merge local audio assets with user's uploaded audio files for a category.
 */
export function getSoundsByCategory(category, customSounds = []) {
  const localFiltered = LOCAL_SOUNDS.filter((s) => s.category === category);
  const customFiltered = customSounds.filter((s) => s.category === category);
  return [...localFiltered, ...customFiltered];
}
