// This component shows a centered loading spinner while dictionary or history requests are running.
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

const COLORS = {
  primary: "#2D6BE4",
  muted: "#6B7280",
};

export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  message: {
    color: COLORS.muted,
    fontSize: 15,
    marginTop: 12,
  },
});
