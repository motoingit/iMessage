import { frameStyleFromUrl, getWallpaperById, WALLPAPERS } from "../data/wallpapers";
import { WallpaperContext } from "./wallpaper";
import { useAuthStore } from "../store/useAuthStore";

export function WallpaperProvider({ children }) {
  const authUser = useAuthStore((state) => state.authUser);
  const updateUserSettings = useAuthStore((state) => state.updateUserSettings);

  // Combine static compile-time wallpapers with the user's custom-uploaded wallpapers
  const customWallpapers = authUser?.customWallpapers || [];
  const allWallpapers = [...WALLPAPERS, ...customWallpapers];

  // Resolve wallpaper selection: MongoDB profile -> localStorage fallback -> first available image
  const resolvedWallpaperId =
    authUser?.selectedWallpaperId ||
    localStorage.getItem("chat-wallpaper-id") ||
    (allWallpapers[0]?.id || "sonoma-horizon");

  const wallpaper = allWallpapers.find((w) => w.id === resolvedWallpaperId) || allWallpapers[0] || {
    id: "sonoma-horizon",
    category: "desktop",
    label: "Sonoma Horizon",
    url: "",
  };

  const setWallpaperId = async (id) => {
    localStorage.setItem("chat-wallpaper-id", id);
    if (authUser) {
      await updateUserSettings({ selectedWallpaperId: id });
    }
  };

  const frameStyle = frameStyleFromUrl(wallpaper.url);

  return (
    <WallpaperContext.Provider value={{ wallpaperId: resolvedWallpaperId, setWallpaperId, wallpaper, frameStyle, allWallpapers }}>
      {children}
    </WallpaperContext.Provider>
  );
}
