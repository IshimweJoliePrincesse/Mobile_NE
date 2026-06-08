// This root layout loads global styles and lets the dictionary navigator own the app UI.
// These imports load app-wide styling, Expo Router, the status bar, and gesture support for the drawer.
import "@/global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export const unstable_settings = {
  // This tells Expo Router that the index route is the main screen for the app.
  anchor: "index",
};

export default function RootLayout() {
  return (
    // GestureHandlerRootView is required so drawer gestures and button touches work correctly.
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Expo Router hosts the index route, and the index route hosts the actual dictionary app. */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
      {/* The status bar adapts automatically to the device theme. */}
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}
