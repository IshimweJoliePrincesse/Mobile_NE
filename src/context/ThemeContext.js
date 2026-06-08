// This context stores the current app theme so every screen can switch between light mode and dark mode.
// These imports provide React Context for sharing the theme and state for changing it.
import React, { createContext, useContext, useMemo, useState } from "react";

// These are the two theme names supported by the app.
export const THEME_NAMES = {
  light: "light",
  dark: "dark",
};

// These color palettes define how the app should look in light mode and dark mode.
const THEME_COLORS = {
  light: {
    mode: THEME_NAMES.light,
    primary: "#2457F5",
    primaryDeep: "#1631A8",
    primarySoft: "#DDE7FF",
    accent: "#8B5CF6",
    accentSoft: "#EFE7FF",
    gold: "#F59E0B",
    rose: "#EF476F",
    secondary: "#111827",
    background: "#EEF4FF",
    backgroundAlt: "#F8FBFF",
    card: "#FFFFFF",
    cardElevated: "#FFFFFF",
    text: "#111827",
    muted: "#64748B",
    error: "#EF4444",
    success: "#10B981",
    warning: "#F59E0B",
    softBlue: "#E7EFFF",
    input: "#F7FAFF",
    border: "#DCE6F7",
    heroText: "#EEF4FF",
    softText: "#C7D7FE",
    translucentCard: "rgba(255,255,255,0.74)",
    glass: "rgba(255,255,255,0.18)",
    drawerMuted: "#BFD3FF",
    shadow: "rgba(17,24,39,0.18)",
  },
  dark: {
    mode: THEME_NAMES.dark,
    primary: "#7DB3FF",
    primaryDeep: "#1E3A8A",
    primarySoft: "#162A50",
    accent: "#C084FC",
    accentSoft: "#2B1748",
    gold: "#FBBF24",
    rose: "#FB7185",
    secondary: "#070B18",
    background: "#050816",
    backgroundAlt: "#0A1024",
    card: "#10192E",
    cardElevated: "#16213A",
    text: "#F8FAFC",
    muted: "#A8B3CF",
    error: "#F87171",
    success: "#34D399",
    warning: "#FBBF24",
    softBlue: "#162846",
    input: "#0D1528",
    border: "#263855",
    heroText: "#DDE8FF",
    softText: "#AFC7FF",
    translucentCard: "rgba(16,25,46,0.82)",
    glass: "rgba(255,255,255,0.10)",
    drawerMuted: "#B6C4E2",
    shadow: "rgba(0,0,0,0.36)",
  },
};

// This creates the shared theme container that screens and components can read from.
const ThemeContext = createContext(null);

// This provider wraps the app and exposes theme colors plus a toggle button action.
export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(THEME_NAMES.light);

  // This function switches light mode to dark mode, or dark mode back to light mode.
  const toggleTheme = () => {
    setThemeName((currentTheme) =>
      currentTheme === THEME_NAMES.light ? THEME_NAMES.dark : THEME_NAMES.light,
    );
  };

  // This value is memoized so screens only update when the theme actually changes.
  const value = useMemo(
    () => ({
      themeName,
      colors: THEME_COLORS[themeName],
      isDark: themeName === THEME_NAMES.dark,
      toggleTheme,
    }),
    [themeName],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// This hook lets any component access the current colors and the theme toggle function.
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
