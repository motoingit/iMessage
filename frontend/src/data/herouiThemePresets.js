// Scan all theme preset files in the theme-presets directory dynamically.
const modules = import.meta.glob("./theme-presets/*.js", { eager: true });

// Construct the array of presets automatically from the exported defaults.
export const HERO_UI_THEME_PRESETS = Object.values(modules).map((m) => m.default);

export const DEFAULT_THEME_PRESET_ID = "default";

