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
  softBlue: "#EAF1FF",
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
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroIcon}>
                <Ionicons name="book-outline" size={34} color={COLORS.card} />
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
                <Ionicons name="text-outline" size={15} color={COLORS.primary} />
                <Text style={styles.featureText}>Definitions</Text>
              </View>
              <View style={styles.featurePill}>
                <Ionicons name="volume-high-outline" size={15} color={COLORS.primary} />
                <Text style={styles.featureText}>Audio</Text>
              </View>
              <View style={styles.featurePill}>
                <Ionicons name="time-outline" size={15} color={COLORS.primary} />
                <Text style={styles.featureText}>History</Text>
              </View>
            </View>
          </View>

          <View style={styles.searchCard}>
            <Text style={styles.searchTitle}>Find a word</Text>
            <Text style={styles.searchHint}>Use letters only, between 2 and 50 characters.</Text>
            <View style={styles.searchRow}>
              <Ionicons name="search-outline" size={20} color={COLORS.muted} />
              <TextInput
                value={searchTerm}
                onChangeText={(value) => {
                  setSearchTerm(value);
                  setValidationError("");
                  setApiError("");
                }}
                placeholder="e.g. innovation"
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
                <Ionicons name="arrow-forward" size={22} color={COLORS.card} />
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
              <View style={styles.emptyIconWrap}>
                <Ionicons name="language-outline" size={46} color={COLORS.primary} />
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
    padding: 18,
  },
  heroCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 30,
    elevation: 5,
    marginBottom: 18,
    padding: 22,
    shadowColor: COLORS.secondary,
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
    backgroundColor: COLORS.primary,
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
    color: COLORS.card,
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
    backgroundColor: COLORS.card,
    borderRadius: 18,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  featureText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "800",
  },
  searchCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    elevation: 4,
    padding: 16,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  searchTitle: {
    color: COLORS.secondary,
    fontSize: 20,
    fontWeight: "900",
  },
  searchHint: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 4,
  },
  searchRow: {
    alignItems: "center",
    backgroundColor: "#F7F9FF",
    borderColor: "rgba(45,107,228,0.12)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    paddingLeft: 14,
  },
  input: {
    color: COLORS.text,
    flex: 1,
    fontSize: 16,
    minHeight: 48,
    paddingRight: 8,
  },
  searchButton: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 16,
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
    backgroundColor: "rgba(255,255,255,0.56)",
    borderRadius: 28,
    flex: 1,
    justifyContent: "center",
    marginTop: 20,
    minHeight: 260,
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
    alignItems: "center",
    backgroundColor: COLORS.softBlue,
    borderRadius: 32,
    height: 72,
    justifyContent: "center",
    width: 72,
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
