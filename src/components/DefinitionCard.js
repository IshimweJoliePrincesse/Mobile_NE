// This component renders a numbered meaning card with definitions and examples in a polished layout.
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const COLORS = {
  primary: "#2D6BE4",
  background: "#F0F4FF",
  card: "#FFFFFF",
  secondary: "#1A1A2E",
  text: "#1C1C1E",
  muted: "#6B7280",
  border: "#E5E7EB",
};

export default function DefinitionCard({ meaning, meaningNumber, totalMeanings }) {
  const definitions = Array.isArray(meaning?.definitions) ? meaning.definitions : [];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>{meaningNumber}</Text>
        </View>
        <View style={styles.headingTextGroup}>
          <Text style={styles.meaningLabel}>Meaning {meaningNumber} of {totalMeanings}</Text>
          <Text style={styles.partOfSpeech}>{meaning?.partOfSpeech || "meaning"}</Text>
        </View>
      </View>

      {definitions.map((definition, index) => (
        <View
          key={`${definition?.definition || "definition"}-${index}`}
          style={[styles.definitionBlock, index === definitions.length - 1 && styles.lastBlock]}
        >
          <View style={styles.definitionRow}>
            <Text style={styles.definitionIndex}>{index + 1}</Text>
            <Text style={styles.definition}>
              {definition?.definition || "No definition text available."}
            </Text>
          </View>

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
    borderColor: "rgba(45,107,228,0.10)",
    borderWidth: 1,
    borderRadius: 22,
    elevation: 3,
    marginBottom: 14,
    padding: 20,
    shadowColor: "#1A1A2E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  numberBadge: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  numberText: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: "800",
  },
  headingTextGroup: {
    flex: 1,
  },
  meaningLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  partOfSpeech: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 2,
    textTransform: "uppercase",
  },
  definitionBlock: {
    borderBottomColor: COLORS.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 14,
    paddingBottom: 14,
  },
  lastBlock: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  definitionRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
  },
  definitionIndex: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 20,
    minWidth: 22,
    overflow: "hidden",
    textAlign: "center",
  },
  definition: {
    color: COLORS.text,
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
  },
  exampleBox: {
    backgroundColor: "#F8FAFF",
    borderLeftColor: COLORS.primary,
    borderLeftWidth: 3,
    borderRadius: 12,
    marginTop: 10,
    marginLeft: 32,
    padding: 12,
    paddingLeft: 12,
  },
  example: {
    color: COLORS.muted,
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 22,
  },
});
