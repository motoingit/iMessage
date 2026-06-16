import { Button } from "@heroui/react";
import { Check, Trash2, Upload } from "lucide-react";
import { useRef, useTransition } from "react";
import { useWallpaper } from "../../context/wallpaper";
import { WALLPAPER_SECTIONS } from "../../data/wallpapers";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";

function WallpaperThumb({ wallpaper, selected, onSelect, isCustom, onDelete }) {
  return (
    <div className="relative aspect-4/3 w-full group">
      <button
        type="button"
        onClick={() => onSelect(wallpaper.id, wallpaper.label)}
        className={[
          "relative aspect-4/3 w-full overflow-hidden rounded-xl bg-zinc-900 contain-[layout]",
          selected
            ? "outline-2 outline-offset-2 outline-white"
            : "outline-1 outline-transparent hover:outline-white/45",
          "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#2a2a2c]",
        ].join(" ")}
        aria-pressed={selected}
      >
        <img
          src={wallpaper.url}
          alt=""
          width={320}
          height={240}
          className="pointer-events-none h-full w-full object-cover select-none"
          loading="lazy"
          decoding="async"
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px"
          referrerPolicy="no-referrer"
          draggable={false}
        />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-black/55 px-2 py-1.5 text-left text-[11px] font-medium leading-tight text-white/95">
          {wallpaper.label}
        </span>
        {selected ? (
          <span className="absolute right-1.5 top-1.5 z-10 flex size-6 items-center justify-center rounded-full bg-white text-[#1a1a1c] shadow-md">
            <Check className="size-3.5" strokeWidth={3} />
          </span>
        ) : null}
      </button>

      {isCustom ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(wallpaper.id);
          }}
          className="absolute left-1.5 top-1.5 z-20 hidden group-hover:flex size-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-colors cursor-pointer"
          title="Delete custom wallpaper"
        >
          <Trash2 className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}

export function BackdropTab() {
  const authUser = useAuthStore((state) => state.authUser);
  const { wallpaperId, setWallpaperId, allWallpapers } = useWallpaper();
  const uploadCustomWallpaper = useAuthStore((state) => state.uploadCustomWallpaper);
  const deleteCustomWallpaper = useAuthStore((state) => state.deleteCustomWallpaper);
  const fileInputRef = useRef(null);
  const [, startTransition] = useTransition();

  const handleSelect = (id, label) => {
    startTransition(() => {
      setWallpaperId(id);
      toast.success(`Wallpaper changed to: ${label}`);
    });
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    await uploadCustomWallpaper(file);
  };

  return (
    <div className="space-y-6 outline-none">
      {/* Custom Upload Section */}
      {authUser && (
        <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
          <div>
            <h4 className="text-sm font-semibold text-white">Custom Backdrop</h4>
            <p className="text-xs text-zinc-400 mt-0.5">Upload an image as chat background.</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            size="sm"
            color="primary"
            onPress={() => fileInputRef.current?.click()}
            startContent={<Upload className="size-4" />}
          >
            Upload Image
          </Button>
        </div>
      )}

      {/* Custom Wallpapers Category */}
      {authUser && allWallpapers.some((w) => w.id.startsWith("custom-")) && (
        <section className="space-y-3">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">My Uploads</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {allWallpapers
              .filter((w) => w.id.startsWith("custom-"))
              .map((w) => (
                <WallpaperThumb
                  key={w.id}
                  wallpaper={w}
                  selected={wallpaperId === w.id}
                  onSelect={handleSelect}
                  isCustom
                  onDelete={deleteCustomWallpaper}
                />
              ))}
          </div>
        </section>
      )}

      {/* Standard Categories */}
      {WALLPAPER_SECTIONS.map((section) => {
        const sectionWallpapers = allWallpapers.filter(
          (w) => w.category === section.id && !w.id.startsWith("custom-")
        );
        if (sectionWallpapers.length === 0) return null;

        return (
          <section key={section.id} className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{section.title}</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {sectionWallpapers.map((w) => (
                <WallpaperThumb
                  key={w.id}
                  wallpaper={w}
                  selected={wallpaperId === w.id}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
