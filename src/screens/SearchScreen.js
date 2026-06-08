// This screen is the first page users see. It lets users type a word, checks that the word is valid, asks the dictionary API for data, and opens the details page.
// These imports bring in React, React Native building blocks, icons, shared UI pieces, history storage, and the API functions used by this screen.
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import { useSearchHistory } from "../context/SearchHistoryContext";
import { useTheme } from "../context/ThemeContext";
import {
  fetchWordDefinition,
  getFriendlyErrorMessage,
  normalizeSearchWord,
  validateSearchInput,
} from "../services/dictionaryService";

export default function SearchScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // These state values remember what the user typed, whether the app is loading, and any messages that should be shown.
  const [searchTerm, setSearchTerm] = useState("");
  const [validationError, setValidationError] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastSearch, setLastSearch] = useState("");
  const [wordData, setWordData] = useState(null);
  const { history, addSearch } = useSearchHistory();

  // These suggestions come from previous successful searches and update as the user types.
  const autocompleteSuggestions = useMemo(() => {
    const typedWord = normalizeSearchWord(searchTerm);

    if (!typedWord) {
      return [];
    }

    return history
      .filter((word) => word.startsWith(typedWord) && word !== typedWord)
      .slice(0, 5);
  }, [history, searchTerm]);

  // This function does the full search process: clean the input, validate it, call the API, save history, and open the result screen.
  const runSearch = async (value) => {
    // Trim removes extra spaces, and validation checks empty input, letters only, and length limits.
    const trimmedValue = String(value || "").trim();
    const validationMessage = validateSearchInput(trimmedValue);

    setApiError("");

    if (validationMessage) {
      setValidationError(validationMessage);
      return;
    }

    const normalizedWord = normalizeSearchWord(trimmedValue);

    try {
      // The loading state tells the interface to show the spinner while the API request is running.
      setLoading(true);
      setValidationError("");
      setLastSearch(normalizedWord);

      // This asks the dictionary API for definitions of the normalized word.
      const data = await fetchWordDefinition(normalizedWord);
      setWordData(data);
      addSearch(normalizedWord);
      // After a successful response, the app opens the Word Detail screen and sends the API data to it.
      navigation.navigate("WordDetail", {
        word: normalizedWord,
        wordData: data,
      });
    } catch (error) {
      // If the request fails, the API error is converted into a message that users can understand.
      setApiError(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // This runs when the user presses the search button or submits from the keyboard.
  const handleSubmit = () => {
    runSearch(searchTerm);
  };

  // This runs when the user taps Retry after an API error.
  const handleRetry = () => {
    runSearch(lastSearch || searchTerm);
  };

  // This runs when a user taps an autocomplete suggestion from their search history.
  const handleAutocompletePress = (word) => {
    setSearchTerm(word);
    setValidationError("");
    setApiError("");
    runSearch(word);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* This keeps the keyboard from covering the search input on mobile devices. */}
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* This hero card introduces the app and summarizes the main features. */}
          <View style={styles.heroCard}>
            <View style={styles.heroGlowOne} />
            <View style={styles.heroGlowTwo} />
            <View style={styles.heroTopRow}>
              <View style={styles.heroIcon}>
                <Ionicons name="book-outline" size={34} color="#FFFFFF" />
              </View>
              <View style={styles.brandCopy}>
                <Text style={styles.brandLabel}>LexiTech Solutions Ltd</Text>
                <Text
                  adjustsFontSizeToFit
                  minimumFontScale={0.78}
                  numberOfLines={1}
                  style={styles.title}
                >
                  Dictionary
                </Text>
              </View>
            </View>
            <View style={styles.heroBadgeRow}>
              <View style={styles.heroBadge}>
                <Ionicons name="sparkles" size={14} color={colors.gold} />
                <Text style={styles.heroBadgeText}>Smart lookup</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>
              Search beautifully, understand faster, and hear every word with clear regional pronunciations.
            </Text>
            <View style={styles.featureRow}>
              <View style={styles.featurePill}>
                <Ionicons name="text-outline" size={15} color={colors.primary} />
                <Text style={styles.featureText}>Definitions</Text>
              </View>
              <View style={styles.featurePill}>
                <Ionicons name="volume-high-outline" size={15} color={colors.primary} />
                <Text style={styles.featureText}>Audio</Text>
              </View>
              <View style={styles.featurePill}>
                <Ionicons name="time-outline" size={15} color={colors.primary} />
                <Text style={styles.featureText}>History</Text>
              </View>
            </View>
            <View style={styles.heroStats}>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>UK/US</Text>
                <Text style={styles.heroStatLabel}>Audio</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>Fast</Text>
                <Text style={styles.heroStatLabel}>Lookup</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>Saved</Text>
                <Text style={styles.heroStatLabel}>History</Text>
              </View>
            </View>
          </View>

          {/* This card contains the search input, instructions, validation message, and submit button. */}
          <View style={styles.searchCard}>
            <View style={styles.searchHeader}>
              <View>
                <Text style={styles.searchEyebrow}>Start here</Text>
                <Text style={styles.searchTitle}>Find a word</Text>
              </View>
              <View style={styles.searchSpark}>
                <Ionicons name="flash-outline" size={18} color={colors.gold} />
              </View>
            </View>
            <Text style={styles.searchHint}>Search one English word only. No spaces or sentences.</Text>
            <View style={styles.searchRow}>
              <Ionicons name="search-outline" size={20} color={colors.muted} />
              <TextInput
                value={searchTerm}
                onChangeText={(value) => {
                  // Updating the input also clears old validation/API messages so the user gets fresh feedback.
                  setSearchTerm(value);
                  setValidationError("");
                  setApiError("");
                }}
                placeholder="e.g. innovation"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={handleSubmit}
                style={styles.input}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Search dictionary"
                onPress={handleSubmit}
                disabled={loading}
                style={({ pressed }) => [
                  styles.searchButton,
                  (pressed || loading) && styles.pressed,
                ]}
              >
                <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
              </Pressable>
            </View>
            {validationError ? <Text style={styles.validation}>{validationError}</Text> : null}

            {/* These autocomplete suggestions help users quickly research words they searched before. */}
            {autocompleteSuggestions.length > 0 ? (
              <View style={styles.autocompleteBox}>
                <View style={styles.autocompleteHeader}>
                  <Ionicons name="time-outline" size={15} color={colors.primary} />
                  <Text style={styles.autocompleteTitle}>From your history</Text>
                </View>
                {autocompleteSuggestions.map((word) => (
                  <Pressable
                    key={word}
                    accessibilityRole="button"
                    accessibilityLabel={`Search ${word} from history`}
                    onPress={() => handleAutocompletePress(word)}
                    style={({ pressed }) => [
                      styles.autocompleteItem,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.autocompleteWord}>{word}</Text>
                    <Ionicons name="arrow-up-outline" size={16} color={colors.muted} />
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>

          {/* This spinner appears only while the app is waiting for the dictionary API. */}
          {loading ? <LoadingSpinner message="Searching dictionary..." /> : null}

          {/* This error box appears when a network, timeout, not-found, or empty-response error happens. */}
          {!loading && apiError ? (
            <ErrorMessage message={apiError} onRetry={handleRetry} />
          ) : null}

          {/* This is the friendly first-launch empty state shown before the user searches anything. */}
          {!loading && !apiError && !wordData ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="language-outline" size={46} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Start exploring vocabulary</Text>
              <Text style={styles.emptyText}>
                Search any English word to unlock meanings, examples, phonetics, audio, and history.
              </Text>
              <View style={styles.emptyChips}>
                <Text style={styles.emptyChip}>Meanings</Text>
                <Text style={styles.emptyChip}>Examples</Text>
                <Text style={styles.emptyChip}>Pronunciation</Text>
              </View>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// These styles control the visual layout of the search screen: spacing, cards, colors, and buttons.
function createStyles(colors) {
  return StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 18,
    paddingBottom: 30,
  },
  heroCard: {
    backgroundColor: colors.secondary,
    borderColor: colors.glass,
    borderRadius: 34,
    borderWidth: 1,
    elevation: 8,
    marginBottom: 18,
    overflow: "hidden",
    padding: 22,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.24,
    shadowRadius: 28,
  },
  heroGlowOne: {
    backgroundColor: colors.primary,
    borderRadius: 80,
    height: 160,
    opacity: 0.28,
    position: "absolute",
    right: -54,
    top: -54,
    width: 160,
  },
  heroGlowTwo: {
    backgroundColor: colors.accent,
    borderRadius: 58,
    bottom: -48,
    height: 116,
    left: -36,
    opacity: 0.22,
    position: "absolute",
    width: 116,
  },
  heroTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: colors.glass,
    borderColor: "rgba(255,255,255,0.24)",
    borderWidth: 1,
    borderRadius: 22,
    height: 58,
    justifyContent: "center",
    width: 58,
  },
  brandCopy: {
    flex: 1,
  },
  brandLabel: {
    color: "#BFD3FF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
    marginTop: 2,
  },
  heroBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  heroBadgeRow: {
    alignItems: "flex-start",
    marginTop: 12,
  },
  heroBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  subtitle: {
    color: "#E6EEFF",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 18,
  },
  featureRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 18,
  },
  featurePill: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 18,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  featureText: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "800",
  },
  heroStats: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  heroStatItem: {
    alignItems: "center",
    flex: 1,
  },
  heroStatValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  heroStatLabel: {
    color: colors.softText,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2,
    textTransform: "uppercase",
  },
  heroDivider: {
    backgroundColor: "rgba(255,255,255,0.16)",
    height: 30,
    width: 1,
  },
  searchCard: {
    backgroundColor: colors.cardElevated || colors.card,
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    elevation: 5,
    padding: 18,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
  },
  searchHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  searchEyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  searchTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "900",
    marginTop: 2,
  },
  searchSpark: {
    alignItems: "center",
    backgroundColor: colors.accentSoft,
    borderRadius: 18,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  searchHint: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  searchRow: {
    alignItems: "center",
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    paddingLeft: 14,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    minHeight: 48,
    paddingRight: 8,
  },
  searchButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 19,
    height: 50,
    justifyContent: "center",
    marginRight: 2,
    width: 50,
  },
  validation: {
    color: colors.error,
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 18,
    marginTop: 4,
  },
  autocompleteBox: {
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 12,
    overflow: "hidden",
  },
  autocompleteHeader: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  autocompleteTitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  autocompleteItem: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 46,
    paddingHorizontal: 12,
  },
  autocompleteWord: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: colors.translucentCard,
    borderColor: colors.border,
    borderRadius: 32,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    marginTop: 20,
    minHeight: 260,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  emptyIconWrap: {
    alignItems: "center",
    backgroundColor: colors.primarySoft || colors.softBlue,
    borderColor: colors.border,
    borderRadius: 36,
    borderWidth: 1,
    height: 78,
    justifyContent: "center",
    width: 78,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 14,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: "center",
  },
  emptyChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginTop: 18,
  },
  emptyChip: {
    backgroundColor: colors.softBlue,
    borderRadius: 14,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pressed: {
    opacity: 0.75,
  },
  });
}
