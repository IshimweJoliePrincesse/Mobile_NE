// This route mounts the complete Dictionary app with history context and drawer navigation.
// @ts-nocheck is used here because this Expo Router TypeScript route imports JavaScript app modules.
// @ts-nocheck
// These imports bring in React, the shared search history provider, the book loading screen, and the drawer-based app navigation.
import React, { useEffect, useState } from "react";
import { SearchHistoryProvider } from "@/context/SearchHistoryContext";
import { ThemeProvider } from "@/context/ThemeContext";
import BookOpeningScreen from "@/screens/BookOpeningScreen";
import DrawerNavigator from "@/navigation/DrawerNavigator";

function AppContent() {
  const [showBookLoading, setShowBookLoading] = useState(true);

  // This timer keeps the book-opening loading screen visible for five seconds before the dictionary search app appears.
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBookLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return showBookLoading ? <BookOpeningScreen /> : <DrawerNavigator />;
}

export default function HomeScreen() {
  return (
    // The theme provider lets the app switch between light and dark mode.
    <ThemeProvider>
      {/* The history provider wraps the navigator so every screen and drawer item can access search history. */}
      <SearchHistoryProvider>
        <AppContent />
      </SearchHistoryProvider>
    </ThemeProvider>
  );
}
