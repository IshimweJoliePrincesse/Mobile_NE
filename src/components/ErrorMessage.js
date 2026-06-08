// This component displays validation and API errors with an optional retry action.
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  primary: "#2D6BE4",
  error: "#EF4444",
  card: "#FFFFFF",
  text: "#1C1C1E",
};

export default function ErrorMessage({ message, onRetry, compact = false }) {
  if (!message) {
    return null;
  }

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <Ionicons name="alert-circle-outline" size={compact ? 22 : 34} color={COLORS.error} />
      <Text selectable style={[styles.message, compact && styles.compactMessage]}>
        {message}
      </Text>
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

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: COLORS.card,
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
    color: COLORS.text,
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
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryText: {
    color: COLORS.card,
    fontSize: 15,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.75,
  },
});
