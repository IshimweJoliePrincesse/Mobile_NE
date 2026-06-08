// This component shows a clear error message and, when possible, a Retry button.
// These imports provide React, basic UI elements, and an alert icon.
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function ErrorMessage({ message, onRetry, compact = false }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // If there is no error message, the component shows nothing.
  if (!message) {
    return null;
  }

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      {/* This icon visually warns the user that something went wrong. */}
      <Ionicons name="alert-circle-outline" size={compact ? 22 : 34} color={colors.error} />
      {/* The message is selectable so users can copy it if they need help. */}
      <Text selectable style={[styles.message, compact && styles.compactMessage]}>
        {message}
      </Text>
      {/* The Retry button appears only when the screen provides a retry function. */}
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retry search"
          onPress={onRetry}
          style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
        >
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// These styles control the error box, compact drawer version, and retry button.
function createStyles(colors) {
  return StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 16,
    marginTop: 16,
    padding: 18,
  },
  compactContainer: {
    alignItems: "flex-start",
    marginHorizontal: 16,
    padding: 12,
  },
  message: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: "center",
  },
  compactMessage: {
    marginTop: 6,
    textAlign: "left",
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.75,
  },
  });
}
