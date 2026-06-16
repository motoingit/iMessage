// Scan all image files in the wallpapers folder recursively.
// Keys are like "../assets/wallpapers/desktop/iceland-coast.jpg".
// We import defaults to get the compiled asset URLs.
const modules = import.meta.glob("../assets/wallpapers/**/*.{png,jpg,jpeg,webp,svg}", {
  eager: true,
  import: "default",
});

// Build the WALLPAPERS array by parsing the keys and values.
export const WALLPAPERS = Object.entries(modules).map(([path, url]) => {
  const parts = path.split("/");
  const category = parts[parts.length - 2]; // "desktop" or "abstract"
  const fileNameWithExt = parts[parts.length - 1]; // "iceland-coast.jpg"
  
  // Get filename without extension
  const id = fileNameWithExt.substring(0, fileNameWithExt.lastIndexOf("."));
  
  // Generate label from id: e.g. "iceland-coast" -> "Iceland Coast"
  const label = id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    id,
    category,
    label,
    url,
  };
});

export const WALLPAPER_SECTIONS = [
  { id: "desktop", title: "Desktop" },
  { id: "abstract", title: "Abstract" },
];

export function frameStyleFromUrl(url) {
  return {
    backgroundImage: `url("${url}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}

export function getWallpaperById(id) {
  const found = WALLPAPERS.find((w) => w.id === id);
  if (found) return found;

  // Safe fallback if the requested wallpaper is not in the dynamically scanned list
  return WALLPAPERS[0] || {
    id: "sonoma-horizon",
    category: "desktop",
    label: "Sonoma Horizon",
    url: "",
  };
}

