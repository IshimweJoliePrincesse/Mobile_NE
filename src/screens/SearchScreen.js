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
            <View style={styles.heroTopRow}>
              <View style={styles.heroIcon}>
                <Ionicons name="book-outline" size={34} color="#FFFFFF" />
              </View>
              <View style={styles.brandCopy}>
                <Text style={styles.brandLabel}>LexiTech Solutions Ltd</Text>
                <Text style={styles.title}>Dictionary</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>
              Search English words, read definitions, and listen to pronunciations.
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
          </View>

          {/* This card contains the search input, instructions, validation message, and submit button. */}
          <View style={styles.searchCard}>
            <Text style={styles.searchTitle}>Find a word</Text>
            <Text style={styles.searchHint}>Search one word only. Letters only, 2 to 50 characters.</Text>
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
  },
  heroCard: {
    backgroundColor: colors.secondary,
    borderRadius: 30,
    elevation: 5,
    marginBottom: 18,
    padding: 22,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  heroTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 24,
    height: 64,
    justifyContent: "center",
    width: 64,
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
    fontSize: 34,
    fontWeight: "900",
    marginTop: 2,
  },
  subtitle: {
    color: "#E6EEFF",
    fontSize: 15,
    lineHeight: 22,
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
    backgroundColor: colors.card,
    borderRadius: 18,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  featureText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },
  searchCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    elevation: 4,
    padding: 16,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  searchTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  searchHint: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  searchRow: {
    alignItems: "center",
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
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
    borderRadius: 16,
    height: 48,
    justifyContent: "center",
    width: 48,
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
    borderRadius: 18,
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
    borderRadius: 28,
    flex: 1,
    justifyContent: "center",
    marginTop: 20,
    minHeight: 260,
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
    alignItems: "center",
    backgroundColor: colors.softBlue,
    borderRadius: 32,
    height: 72,
    justifyContent: "center",
    width: 72,
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
  pressed: {
    opacity: 0.75,
  },
  });
}
