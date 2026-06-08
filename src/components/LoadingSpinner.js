// This component shows a centered loading spinner while dictionary or history requests are running.
// These imports provide React, a native spinner, and layout/text elements.
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function LoadingSpinner({ message = "Loading..." }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {/* This spinning indicator tells the user that the app is still working. */}
      <ActivityIndicator size="large" color={colors.primary} />
      {/* This text explains what the app is loading. */}
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

// These styles center the spinner and space it away from surrounding content.
function createStyles(colors) {
  return StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.translucentCard,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  message: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 12,
  },
  });
}
