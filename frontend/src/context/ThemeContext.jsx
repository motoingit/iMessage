import { useEffect, useLayoutEffect, useState } from "react";
import { DEFAULT_THEME_PRESET_ID } from "../data/herouiThemePresets";
import { applyThemePresetToDocument, isValidThemePreset, ThemeContext } from "./theme";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStoredTheme() {
  const theme = localStorage.getItem("theme");
  if (theme === "light" || theme === "dark") return theme;

  return null;
}

function applyDomTheme(theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
}

function readStoredThemePreset() {
  const themePreset = localStorage.getItem("theme-preset");
  if (themePreset && isValidThemePreset(themePreset)) return themePreset;

  return DEFAULT_THEME_PRESET_ID;
}

export function ThemeProvider({ children }) {
  const authUser = useAuthStore((state) => state.authUser);
  const updateUserSettings = useAuthStore((state) => state.updateUserSettings);

  const [theme, setThemeState] = useState(() => readStoredTheme() ?? getSystemTheme());
  const [themePreset, setThemePresetState] = useState(readStoredThemePreset);

  const resolvedPreset = authUser?.selectedThemePreset || themePreset;

  // this applies light/dark mode
  useLayoutEffect(() => {
    applyDomTheme(theme);
  }, [theme]);

  // this applies the theme preset, like sky, spotify, etc.
  useLayoutEffect(() => {
    applyThemePresetToDocument(resolvedPreset);
  }, [resolvedPreset]);

  // this stores the theme and theme preset in local storage
  useEffect(() => {
    localStorage.setItem("theme", theme);
    localStorage.setItem("theme-preset", resolvedPreset);
  }, [theme, resolvedPreset]);

  const setTheme = (next) => {
    setThemeState(next);
    toast.success(`Theme mode set to ${next}`);
  };

  const toggleTheme = () => {
    setThemeState((t) => {
      const nextTheme = t === "dark" ? "light" : "dark";
      toast.success(`Theme mode switched to ${nextTheme}`);
      return nextTheme;
    });
  };

  const setThemePreset = async (next) => {
    const resolved = typeof next === "function" ? next(resolvedPreset) : next;
    const nextPreset = isValidThemePreset(resolved) ? resolved : DEFAULT_THEME_PRESET_ID;
    setThemePresetState(nextPreset);
    if (authUser) {
      await updateUserSettings({ selectedThemePreset: nextPreset });
    }
  };

  const value = { theme, setTheme, toggleTheme, themePreset: resolvedPreset, setThemePreset };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
