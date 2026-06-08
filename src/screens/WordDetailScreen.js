// This screen displays one searched word. It shows the word, phonetic spelling, audio pronunciations, meanings, definitions, and examples.
// These imports bring in React, layout components, reusable cards, audio controls, history access, and dictionary API helpers.
import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AudioPlayer from "../components/AudioPlayer";
import DefinitionCard from "../components/DefinitionCard";
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import { useSearchHistory } from "../context/SearchHistoryContext";
import { useTheme } from "../context/ThemeContext";
import {
  ERROR_MESSAGES,
  fetchWordDefinition,
  getFriendlyErrorMessage,
  normalizeSearchWord,
} from "../services/dictionaryService";

// These colors keep the word details page visually consistent with the rest of the app.
// This helper chooses the best phonetic text to show near the top of the screen.
function findPhoneticText(entries) {
  const entryWithText = entries.find((entry) => entry?.phonetic);
  const phoneticWithText = entries
    .flatMap((entry) => entry?.phonetics || [])
    .find((phonetic) => phonetic?.text);

  return entryWithText?.phonetic || phoneticWithText?.text || "No phonetic spelling available";
}

// This helper checks that an audio link is safe to use before showing audio buttons.
function isValidAudioUrl(audioUrl) {
  return typeof audioUrl === "string" && /^https?:\/\//i.test(audioUrl);
}

// This helper names each pronunciation, such as UK or US, by looking at the audio file URL returned by the API.
function getPronunciationLabel(phonetic, fallbackIndex) {
  const audioUrl = String(phonetic?.audio || "").toLowerCase();

  if (audioUrl.includes("-uk.") || audioUrl.includes("-gb.") || audioUrl.includes("uk.mp3")) {
    return "UK pronunciation";
  }

  if (audioUrl.includes("-us.") || audioUrl.includes("us.mp3")) {
    return "US pronunciation";
  }

  if (audioUrl.includes("-au.") || audioUrl.includes("au.mp3")) {
    return "AU pronunciation";
  }

  return `Pronunciation ${fallbackIndex}`;
}

// This helper collects all playable pronunciation audio files, removes duplicates, and sorts common accents first.
function getAudioPronunciations(entries) {
  const phonetics = entries.flatMap((entry) => entry?.phonetics || []);
  const usedAudioUrls = new Set();
  const usedLabels = new Set();
  const pronunciations = [];

  phonetics.forEach((phonetic) => {
    // Skip missing, invalid, or repeated audio links so users do not see broken duplicate buttons.
    if (!isValidAudioUrl(phonetic?.audio) || usedAudioUrls.has(phonetic.audio)) {
      return;
    }

    const label = getPronunciationLabel(phonetic, pronunciations.length + 1);
    const isRegionalLabel = label.includes("UK") || label.includes("US") || label.includes("AU");

    // If the API gives more than one file for the same region, keep only the first one for that region.
    if (isRegionalLabel && usedLabels.has(label)) {
      return;
    }

    usedAudioUrls.add(phonetic.audio);
    usedLabels.add(label);
    pronunciations.push({
      label,
      phoneticText: phonetic.text || "",
      audioUrl: phonetic.audio,
    });
  });

  return pronunciations.sort((first, second) => {
    const order = {
      "UK pronunciation": 1,
      "US pronunciation": 2,
      "AU pronunciation": 3,
    };

    return (order[first.label] || 99) - (order[second.label] || 99);
  });
}

// This helper gathers meanings from all API entries into one simple list for rendering.
function flattenMeanings(entries) {
  return entries.flatMap((entry) => (Array.isArray(entry?.meanings) ? entry.meanings : []));
}

export default function WordDetailScreen({ route }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // These initial values come from the search screen or drawer history when this screen is opened.
  const initialWordData = Array.isArray(route?.params?.wordData) ? route.params.wordData : [];
  const initialWord = normalizeSearchWord(route?.params?.word || initialWordData?.[0]?.word);
  const [wordData, setWordData] = useState(initialWordData);
  const [requestedWord, setRequestedWord] = useState(initialWord);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialWordData.length ? "" : ERROR_MESSAGES.empty);
  const [audioError, setAudioError] = useState("");
  const { addSearch } = useSearchHistory();

  // This effect refreshes the details when the user searches a different word while this screen is already open.
  useEffect(() => {
    const nextWordData = Array.isArray(route?.params?.wordData) ? route.params.wordData : [];
    const nextWord = normalizeSearchWord(route?.params?.word || nextWordData?.[0]?.word);

    setRequestedWord(nextWord);
    setWordData(nextWordData);
    setAudioError("");
    setError(nextWordData.length ? "" : ERROR_MESSAGES.empty);
  }, [route?.params?.word, route?.params?.wordData]);

  // These calculated values prepare the exact text, audio list, and meanings that will be shown in the UI.
  const word = normalizeSearchWord(wordData?.[0]?.word || requestedWord);
  const phonetic = useMemo(() => findPhoneticText(wordData), [wordData]);
  const audioPronunciations = useMemo(() => getAudioPronunciations(wordData), [wordData]);
  const meanings = useMemo(() => flattenMeanings(wordData), [wordData]);

  // This function repeats the last dictionary request when the user presses Retry after an error.
  const retrySearch = async () => {
    if (!word) {
      setError(ERROR_MESSAGES.empty);
      return;
    }

    try {
      // Loading is shown while the app refreshes this word from the API.
      setLoading(true);
      setError("");
      const data = await fetchWordDefinition(word);
      setWordData(data);
      addSearch(word);
      setAudioError("");
    } catch (requestError) {
      setError(getFriendlyErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* This appears while the app is refreshing word details from the API. */}
        {loading ? <LoadingSpinner message="Refreshing word..." /> : null}

        {/* This appears if the details cannot be loaded and gives the user a Retry button. */}
        {!loading && error ? <ErrorMessage message={error} onRetry={retrySearch} /> : null}

        {!loading && !error ? (
          <>
            {/* This top card shows the selected word, phonetic spelling, and available pronunciation controls. */}
            <View style={styles.headerCard}>
              <View style={styles.headerGlowOne} />
              <View style={styles.headerGlowTwo} />
              <View style={styles.headerTopRow}>
                <View style={styles.wordIcon}>
                  <Text style={styles.wordInitial}>{(word || "?").slice(0, 1).toUpperCase()}</Text>
                </View>
                <View style={styles.wordCopy}>
                  <Text style={styles.eyebrow}>Dictionary result</Text>
                  <Text
                    adjustsFontSizeToFit
                    minimumFontScale={0.68}
                    numberOfLines={1}
                    selectable
                    style={styles.wordTitle}
                  >
                    {word || "Unknown word"}
                  </Text>
                </View>
                <View style={styles.resultBadge}>
                  <Ionicons name="sparkles" size={14} color={colors.gold} />
                </View>
              </View>
              <View style={styles.resultMetaRow}>
                <Text style={styles.resultMetaText}>{meanings.length || 0} meanings</Text>
                <Text style={styles.resultMetaDot}>•</Text>
                <Text style={styles.resultMetaText}>{audioPronunciations.length || 0} audio clips</Text>
              </View>
              <View style={styles.phoneticRow}>
                <Text selectable style={styles.phonetic}>
                  {phonetic}
                </Text>
                {/* If audio exists, each available pronunciation gets its own Play, Pause, and Stop controls. */}
                {audioPronunciations.length ? (
                  <View style={styles.pronunciationList}>
                    {audioPronunciations.map((pronunciation) => (
                      <View key={pronunciation.audioUrl} style={styles.pronunciationCard}>
                        <View style={styles.pronunciationCopy}>
                          <Text style={styles.pronunciationLabel}>{pronunciation.label}</Text>
                          {pronunciation.phoneticText ? (
                            <Text selectable style={styles.pronunciationText}>
                              {pronunciation.phoneticText}
                            </Text>
                          ) : null}
                        </View>
                        <AudioPlayer audioUrl={pronunciation.audioUrl} onError={setAudioError} />
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.noAudioCard}>
                    <Ionicons name="volume-mute-outline" size={18} color={colors.softText} />
                    <Text style={styles.noAudioText}>
                      No audio pronunciation is available for this word.
                    </Text>
                  </View>
                )}
              </View>
              {audioError ? <Text style={styles.audioError}>{audioError}</Text> : null}
            </View>

            {/* This section lists all meanings. Each meaning is numbered from 1 to the total number of meanings. */}
            {meanings.length ? (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Meanings</Text>
                  <Text style={styles.sectionMeta}>{meanings.length} found</Text>
                </View>
                {meanings.map((meaning, index) => (
                  <DefinitionCard
                    key={`${meaning?.partOfSpeech || "meaning"}-${index}`}
                    meaning={meaning}
                    meaningNumber={index + 1}
                    totalMeanings={meanings.length}
                  />
                ))}
              </>
            ) : (
              <ErrorMessage message={ERROR_MESSAGES.empty} onRetry={retrySearch} />
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

// These styles control the word detail page layout, including the header card, pronunciation cards, and meaning section.
function createStyles(colors) {
  return StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 36,
  },
  headerCard: {
    backgroundColor: colors.secondary,
    borderColor: colors.glass,
    borderRadius: 34,
    borderWidth: 1,
    elevation: 8,
    marginBottom: 20,
    overflow: "hidden",
    padding: 22,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.24,
    shadowRadius: 28,
  },
  headerGlowOne: {
    backgroundColor: colors.primary,
    borderRadius: 78,
    height: 156,
    opacity: 0.26,
    position: "absolute",
    right: -48,
    top: -58,
    width: 156,
  },
  headerGlowTwo: {
    backgroundColor: colors.accent,
    borderRadius: 54,
    bottom: -42,
    height: 108,
    left: -34,
    opacity: 0.2,
    position: "absolute",
    width: 108,
  },
  headerTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  wordIcon: {
    alignItems: "center",
    backgroundColor: colors.glass,
    borderColor: "rgba(255,255,255,0.22)",
    borderWidth: 1,
    borderRadius: 21,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  wordInitial: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
  },
  wordCopy: {
    flex: 1,
  },
  eyebrow: {
    color: colors.softText,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  wordTitle: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 40,
    marginTop: 2,
    textTransform: "capitalize",
  },
  resultBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 14,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  resultMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  resultMetaText: {
    color: colors.softText,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  resultMetaDot: {
    color: "rgba(255,255,255,0.46)",
    fontSize: 16,
    fontWeight: "900",
  },
  phoneticRow: {
    alignItems: "flex-start",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "column",
    gap: 14,
    marginTop: 18,
    padding: 15,
  },
  phonetic: {
    color: colors.heroText,
    fontSize: 16,
    fontStyle: "italic",
  },
  pronunciationList: {
    gap: 10,
    width: "100%",
  },
  pronunciationCard: {
    backgroundColor: "rgba(255,255,255,0.11)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  pronunciationCopy: {
    gap: 3,
  },
  pronunciationLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  pronunciationText: {
    color: colors.softText,
    fontSize: 13,
    fontStyle: "italic",
  },
  noAudioCard: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    padding: 12,
    width: "100%",
  },
  noAudioText: {
    color: colors.softText,
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  audioError: {
    color: colors.error,
    fontSize: 13,
    marginTop: 10,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 23,
    fontWeight: "900",
  },
  sectionMeta: {
    backgroundColor: colors.primarySoft || colors.softBlue,
    borderRadius: 14,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  });
}
