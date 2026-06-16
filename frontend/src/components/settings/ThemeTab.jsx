import { Button } from "@heroui/react";
import { Sun, Moon, Check } from "lucide-react";
import { useTheme, applyThemePresetToDocument } from "../../context/theme";
import { HERO_UI_THEME_PRESETS } from "../../data/herouiThemePresets";
import toast from "react-hot-toast";

export function ThemeTab() {
  const { theme, setTheme, themePreset, setThemePreset } = useTheme();

  const handleSelectTheme = (id, label) => {
    applyThemePresetToDocument(id);
    setThemePreset(id);
    toast.success(`Accent theme changed to: ${label}`);
  };

  return (
    <div className="space-y-5 outline-none">
      {/* Dark/Light mode switcher */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Appearance</h3>
        <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
          <div>
            <h4 className="text-sm font-semibold text-white">Color Mode</h4>
            <p className="text-xs text-zinc-400 mt-0.5">Toggle between dark and light styles.</p>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900 p-1 shadow-inner">
            <Button
              size="sm"
              variant="ghost"
              isIconOnly
              onPress={() => setTheme("light")}
              className={`size-8 rounded-full ${
                theme === "light" ? "bg-white text-zinc-950 font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Sun className="size-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              isIconOnly
              onPress={() => setTheme("dark")}
              className={`size-8 rounded-full ${
                theme === "dark" ? "bg-white text-zinc-950 font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Moon className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Accent Color Preset Selectors */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Accent Theme</h3>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 pr-1">
          {HERO_UI_THEME_PRESETS.map((p) => {
            const selected = themePreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectTheme(p.id, p.label)}
                className={[
                  "relative flex flex-col items-center gap-2 rounded-xl p-2 text-center transition-colors cursor-pointer",
                  selected
                    ? "bg-white/10 ring-2 ring-accent ring-offset-2 ring-offset-[#2a2a2c]"
                    : "hover:bg-white/5",
                ].join(" ")}
                aria-pressed={selected}
              >
                <span className="relative">
                  <span
                    className="block size-12 shrink-0 rounded-full shadow-md ring-1 ring-white/20"
                    style={{ background: p.swatch }}
                  />
                  {selected && (
                    <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-md">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                  )}
                </span>
                <span className={`text-[11px] font-medium leading-tight ${selected ? "text-white" : "text-zinc-400"}`}>
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
