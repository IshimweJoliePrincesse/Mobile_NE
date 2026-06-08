// This component renders one part-of-speech group with its definitions and examples in a styled card.
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const COLORS = {
  primary: "#2D6BE4",
  background: "#F0F4FF",
  card: "#FFFFFF",
  text: "#1C1C1E",
  muted: "#6B7280",
};

export default function DefinitionCard({ meaning }) {
  const definitions = Array.isArray(meaning?.definitions) ? meaning.definitions : [];

  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{meaning?.partOfSpeech || "meaning"}</Text>
      </View>

      {definitions.map((definition, index) => (
        <View
          key={`${definition?.definition || "definition"}-${index}`}
          style={[styles.definitionBlock, index === definitions.length - 1 && styles.lastBlock]}
        >
          <Text style={styles.definition}>
            {index + 1}. {definition?.definition || "No definition text available."}
          </Text>

          {definition?.example ? (
            <View style={styles.exampleBox}>
              <Text style={styles.example}>{`"${definition.example}"`}</Text>
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderLeftColor: COLORS.primary,
    borderLeftWidth: 4,
    borderRadius: 16,
    elevation: 2,
    marginBottom: 12,
    padding: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.background,
    borderRadius: 20,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  definitionBlock: {
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 14,
    paddingBottom: 14,
  },
  lastBlock: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  definition: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 24,
  },
  exampleBox: {
    borderLeftColor: COLORS.primary,
    borderLeftWidth: 3,
    marginTop: 10,
    paddingLeft: 12,
  },
  example: {
    color: COLORS.muted,
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 22,
  },
});
