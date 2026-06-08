// This screen validates word input, fetches dictionary data, stores the response, and opens details.
import React, { useState } from "react";
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
import {
  fetchWordDefinition,
  getFriendlyErrorMessage,
  normalizeSearchWord,
  validateSearchInput,
} from "../services/dictionaryService";

const COLORS = {
  primary: "#2D6BE4",
  secondary: "#1A1A2E",
  background: "#F0F4FF",
  card: "#FFFFFF",
  text: "#1C1C1E",
  muted: "#6B7280",
  error: "#EF4444",
};

export default function SearchScreen({ navigation }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [validationError, setValidationError] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastSearch, setLastSearch] = useState("");
  const [wordData, setWordData] = useState(null);
  const { addSearch } = useSearchHistory();

  const runSearch = async (value) => {
    const trimmedValue = String(value || "").trim();
    const validationMessage = validateSearchInput(trimmedValue);

    setApiError("");

    if (validationMessage) {
      setValidationError(validationMessage);
      return;
    }

    const normalizedWord = normalizeSearchWord(trimmedValue);

    try {
      setLoading(true);
      setValidationError("");
      setLastSearch(normalizedWord);

      const data = await fetchWordDefinition(normalizedWord);
      setWordData(data);
      addSearch(normalizedWord);
      navigation.navigate("WordDetail", {
        word: normalizedWord,
        wordData: data,
      });
    } catch (error) {
      setApiError(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    runSearch(searchTerm);
  };

  const handleRetry = () => {
    runSearch(lastSearch || searchTerm);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Ionicons name="book-outline" size={34} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Dictionary</Text>
            <Text style={styles.subtitle}>
              Search English words, read definitions, and listen to pronunciations.
            </Text>
          </View>

          <View style={styles.searchCard}>
            <View style={styles.searchRow}>
              <TextInput
                value={searchTerm}
                onChangeText={(value) => {
                  setSearchTerm(value);
                  setValidationError("");
                  setApiError("");
                }}
                placeholder="Enter a word"
                placeholderTextColor={COLORS.muted}
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
                <Ionicons name="search" size={22} color={COLORS.card} />
              </Pressable>
            </View>
            {validationError ? <Text style={styles.validation}>{validationError}</Text> : null}
          </View>

          {loading ? <LoadingSpinner message="Searching dictionary..." /> : null}

          {!loading && apiError ? (
            <ErrorMessage message={apiError} onRetry={handleRetry} />
          ) : null}

          {!loading && !apiError && !wordData ? (
            <View style={styles.emptyState}>
              <Ionicons name="language-outline" size={58} color={COLORS.muted} />
              <Text style={styles.emptyTitle}>Start exploring words</Text>
              <Text style={styles.emptyText}>
                Type a word above to see meanings, phonetics, examples, and audio.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  hero: {
    alignItems: "center",
    paddingBottom: 28,
    paddingTop: 28,
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 32,
    elevation: 4,
    height: 64,
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    width: 64,
  },
  title: {
    color: COLORS.secondary,
    fontSize: 32,
    fontWeight: "800",
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    maxWidth: 320,
    textAlign: "center",
  },
  searchCard: {
    backgroundColor: COLORS.card,
    borderRadius: 50,
    elevation: 4,
    minHeight: 56,
    paddingHorizontal: 8,
    paddingVertical: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  searchRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  input: {
    color: COLORS.text,
    flex: 1,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  searchButton: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  validation: {
    color: COLORS.error,
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 18,
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  emptyTitle: {
    color: COLORS.secondary,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 14,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.75,
  },
});
