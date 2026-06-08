// This component shows one numbered meaning card. It includes the part of speech, definitions, and example sentences.
// These imports provide React and basic React Native UI building blocks.
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function DefinitionCard({ meaning, meaningNumber, totalMeanings }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // The API puts definitions inside each meaning; this makes sure the app always has a list to display.
  const definitions = Array.isArray(meaning?.definitions) ? meaning.definitions : [];

  return (
    <View style={styles.card}>
      {/* This header shows the meaning number and part of speech, such as noun or verb. */}
      <View style={styles.cardHeader}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>{meaningNumber}</Text>
        </View>
        <View style={styles.headingTextGroup}>
          <Text style={styles.meaningLabel}>Meaning {meaningNumber} of {totalMeanings}</Text>
          <Text style={styles.partOfSpeech}>{meaning?.partOfSpeech || "meaning"}</Text>
        </View>
      </View>

      {/* This loop displays every definition under this meaning and numbers them separately. */}
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

          {/* This example box appears only when the API gives an example sentence. */}
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

// These styles control the card layout, number badges, definition rows, and example boxes.
function createStyles(colors) {
  return StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: "rgba(45,107,228,0.10)",
    borderWidth: 1,
    borderRadius: 22,
    elevation: 3,
    marginBottom: 14,
    padding: 20,
    shadowColor: colors.secondary,
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
    backgroundColor: colors.primary,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  numberText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  headingTextGroup: {
    flex: 1,
  },
  meaningLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  partOfSpeech: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 2,
    textTransform: "uppercase",
  },
  definitionBlock: {
    borderBottomColor: colors.border,
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
    backgroundColor: colors.softBlue,
    borderRadius: 10,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 20,
    minWidth: 22,
    overflow: "hidden",
    textAlign: "center",
  },
  definition: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
  },
  exampleBox: {
    backgroundColor: colors.input,
    borderLeftColor: colors.primary,
    borderLeftWidth: 3,
    borderRadius: 12,
    marginTop: 10,
    marginLeft: 32,
    padding: 12,
    paddingLeft: 12,
  },
  example: {
    color: colors.muted,
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 22,
  },
  });
}
