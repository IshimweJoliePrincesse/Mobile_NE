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
    primary: "#2D6BE4",
    secondary: "#1A1A2E",
    background: "#F0F4FF",
    card: "#FFFFFF",
    text: "#1C1C1E",
    muted: "#6B7280",
    error: "#EF4444",
    success: "#10B981",
    softBlue: "#EAF1FF",
    input: "#F7F9FF",
    border: "#E5E7EB",
    heroText: "#E6EEFF",
    softText: "#C7D2FE",
    translucentCard: "rgba(255,255,255,0.56)",
    drawerMuted: "#6B7280",
  },
  dark: {
    mode: THEME_NAMES.dark,
    primary: "#6EA8FF",
    secondary: "#090E1F",
    background: "#070B18",
    card: "#121A2D",
    text: "#F8FAFC",
    muted: "#A7B0C3",
    error: "#F87171",
    success: "#34D399",
    softBlue: "#162846",
    input: "#0D1528",
    border: "#273550",
    heroText: "#DDE8FF",
    softText: "#AFC7FF",
    translucentCard: "rgba(18,26,45,0.78)",
    drawerMuted: "#94A3B8",
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
