// This screen is the drawer tab where users can view every saved search history item.
// These imports provide React state, mobile UI elements, icons, shared context, theme colors, and dictionary API helpers.
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ErrorMessage from "../components/ErrorMessage";
import { useSearchHistory } from "../context/SearchHistoryContext";
import { useTheme } from "../context/ThemeContext";
import {
  fetchWordDefinition,
  getFriendlyErrorMessage,
} from "../services/dictionaryService";

export default function HistoryScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { history, addSearch, clearHistory } = useSearchHistory();
  const [loadingWord, setLoadingWord] = useState("");
  const [error, setError] = useState("");
  const [lastHistoryWord, setLastHistoryWord] = useState("");

  // This function searches a history word again and opens the detail screen with fresh API data.
  const openHistoryWord = async (word) => {
    try {
      setError("");
      setLoadingWord(word);
      setLastHistoryWord(word);

      const data = await fetchWordDefinition(word);
      addSearch(word);
      navigation.navigate("WordDetail", {
        word,
        wordData: data,
      });
    } catch (requestError) {
      setError(getFriendlyErrorMessage(requestError));
    } finally {
      setLoadingWord("");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* This hero card explains that this drawer tab owns the saved search history. */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <View style={styles.heroIcon}>
            <Ionicons name="time-outline" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.eyebrow}>Drawer tab</Text>
          <Text style={styles.title}>Search History</Text>
          <Text style={styles.subtitle}>
            Every successful search is saved here and remains available after reloads.
          </Text>
        </View>

        {/* This top row shows how many words are saved and lets the user clear them. */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Saved words</Text>
            <Text style={styles.sectionMeta}>{history.length} total</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear all search history"
            disabled={history.length === 0}
            onPress={clearHistory}
            style={({ pressed }) => [
              styles.clearButton,
              history.length === 0 && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="trash-outline" size={16} color={colors.error} />
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        </View>

        {/* If no history exists, this empty state tells the user how to create it. */}
        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="library-outline" size={38} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No search history yet</Text>
            <Text style={styles.emptyText}>
              Search a word successfully and it will appear in this drawer tab.
            </Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {history.map((word) => (
              <Pressable
                key={word}
                accessibilityRole="button"
                accessibilityLabel={`Search ${word} again`}
                disabled={Boolean(loadingWord)}
                onPress={() => openHistoryWord(word)}
                style={({ pressed }) => [
                  styles.historyItem,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.historyInitial}>
                  <Text style={styles.historyInitialText}>{word.slice(0, 1).toUpperCase()}</Text>
                </View>
                <View style={styles.historyCopy}>
                  <Text numberOfLines={1} style={styles.historyWord}>
                    {word}
                  </Text>
                  <Text style={styles.historyHint}>Tap to search again</Text>
                </View>
                {loadingWord === word ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                )}
              </Pressable>
            ))}
          </View>
        )}

        {/* If a history lookup fails, this message lets the user retry the same history word. */}
        {error ? (
          <ErrorMessage
            message={error}
            onRetry={() => openHistoryWord(lastHistoryWord)}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

// These styles make the history drawer tab match the premium search and detail screens.
function createStyles(colors) {
  return StyleSheet.create({
    safeArea: {
      backgroundColor: colors.background,
      flex: 1,
    },
    scrollContent: {
      padding: 18,
      paddingBottom: 34,
    },
    heroCard: {
      backgroundColor: colors.secondary,
      borderColor: colors.glass,
      borderRadius: 32,
      borderWidth: 1,
      elevation: 7,
      marginBottom: 20,
      overflow: "hidden",
      padding: 22,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.22,
      shadowRadius: 24,
    },
    heroGlow: {
      backgroundColor: colors.primary,
      borderRadius: 78,
      height: 156,
      opacity: 0.25,
      position: "absolute",
      right: -52,
      top: -58,
      width: 156,
    },
    heroIcon: {
      alignItems: "center",
      backgroundColor: colors.glass,
      borderColor: "rgba(255,255,255,0.20)",
      borderRadius: 22,
      borderWidth: 1,
      height: 54,
      justifyContent: "center",
      marginBottom: 16,
      width: 54,
    },
    eyebrow: {
      color: colors.softText,
      fontSize: 12,
      fontWeight: "900",
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    title: {
      color: "#FFFFFF",
      fontSize: 30,
      fontWeight: "900",
      marginTop: 4,
    },
    subtitle: {
      color: colors.heroText,
      fontSize: 14,
      lineHeight: 21,
      marginTop: 12,
    },
    sectionHeader: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 21,
      fontWeight: "900",
    },
    sectionMeta: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: "700",
      marginTop: 2,
    },
    clearButton: {
      alignItems: "center",
      borderColor: colors.error,
      borderRadius: 16,
      borderWidth: 1,
      flexDirection: "row",
      gap: 7,
      minHeight: 42,
      paddingHorizontal: 12,
    },
    clearText: {
      color: colors.error,
      fontSize: 13,
      fontWeight: "900",
    },
    historyList: {
      gap: 10,
    },
    historyItem: {
      alignItems: "center",
      backgroundColor: colors.cardElevated || colors.card,
      borderColor: colors.border,
      borderRadius: 22,
      borderWidth: 1,
      elevation: 2,
      flexDirection: "row",
      gap: 12,
      minHeight: 68,
      padding: 14,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
    },
    historyInitial: {
      alignItems: "center",
      backgroundColor: colors.primary,
      borderRadius: 17,
      height: 38,
      justifyContent: "center",
      width: 38,
    },
    historyInitialText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "900",
    },
    historyCopy: {
      flex: 1,
    },
    historyWord: {
      color: colors.text,
      fontSize: 17,
      fontWeight: "900",
      textTransform: "capitalize",
    },
    historyHint: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: "700",
      marginTop: 2,
    },
    emptyState: {
      alignItems: "center",
      backgroundColor: colors.translucentCard,
      borderColor: colors.border,
      borderRadius: 28,
      borderWidth: 1,
      marginTop: 10,
      padding: 26,
    },
    emptyIconWrap: {
      alignItems: "center",
      backgroundColor: colors.primarySoft || colors.softBlue,
      borderRadius: 34,
      height: 72,
      justifyContent: "center",
      width: 72,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 19,
      fontWeight: "900",
      marginTop: 14,
    },
    emptyText: {
      color: colors.muted,
      fontSize: 14,
      lineHeight: 21,
      marginTop: 8,
      textAlign: "center",
    },
    disabled: {
      opacity: 0.4,
    },
    pressed: {
      opacity: 0.75,
    },
  });
}
