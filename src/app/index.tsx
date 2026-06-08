// This route mounts the complete Dictionary app with history context and drawer navigation.
// @ts-nocheck
import React from "react";
import { SearchHistoryProvider } from "@/context/SearchHistoryContext";
import DrawerNavigator from "@/navigation/DrawerNavigator";

export default function HomeScreen() {
  return (
    <SearchHistoryProvider>
      <DrawerNavigator />
    </SearchHistoryProvider>
  );
}
