// This screen displays the selected word, pronunciation, meanings, definitions, and examples.
import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import AudioPlayer from "../components/AudioPlayer";
import DefinitionCard from "../components/DefinitionCard";
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import { useSearchHistory } from "../context/SearchHistoryContext";
import {
  ERROR_MESSAGES,
  fetchWordDefinition,
  getFriendlyErrorMessage,
  normalizeSearchWord,
} from "../services/dictionaryService";

const COLORS = {
  primary: "#2D6BE4",
  secondary: "#1A1A2E",
  background: "#F0F4FF",
  card: "#FFFFFF",
  text: "#1C1C1E",
  muted: "#6B7280",
  softBlue: "#EAF1FF",
};

function findPhoneticText(entries) {
  const entryWithText = entries.find((entry) => entry?.phonetic);
  const phoneticWithText = entries
    .flatMap((entry) => entry?.phonetics || [])
    .find((phonetic) => phonetic?.text);

  return entryWithText?.phonetic || phoneticWithText?.text || "No phonetic spelling available";
}

function isValidAudioUrl(audioUrl) {
  return typeof audioUrl === "string" && /^https?:\/\//i.test(audioUrl);
}

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

function getAudioPronunciations(entries) {
  const phonetics = entries.flatMap((entry) => entry?.phonetics || []);
  const usedAudioUrls = new Set();
  const usedLabels = new Set();
  const pronunciations = [];

  phonetics.forEach((phonetic) => {
    if (!isValidAudioUrl(phonetic?.audio) || usedAudioUrls.has(phonetic.audio)) {
      return;
    }

    const label = getPronunciationLabel(phonetic, pronunciations.length + 1);
    const isRegionalLabel = label.includes("UK") || label.includes("US") || label.includes("AU");

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

function flattenMeanings(entries) {
  return entries.flatMap((entry) => (Array.isArray(entry?.meanings) ? entry.meanings : []));
}

export default function WordDetailScreen({ route }) {
  const initialWordData = Array.isArray(route?.params?.wordData) ? route.params.wordData : [];
  const initialWord = normalizeSearchWord(route?.params?.word || initialWordData?.[0]?.word);
  const [wordData, setWordData] = useState(initialWordData);
  const [requestedWord, setRequestedWord] = useState(initialWord);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialWordData.length ? "" : ERROR_MESSAGES.empty);
  const [audioError, setAudioError] = useState("");
  const { addSearch } = useSearchHistory();

  useEffect(() => {
    const nextWordData = Array.isArray(route?.params?.wordData) ? route.params.wordData : [];
    const nextWord = normalizeSearchWord(route?.params?.word || nextWordData?.[0]?.word);

    setRequestedWord(nextWord);
    setWordData(nextWordData);
    setAudioError("");
    setError(nextWordData.length ? "" : ERROR_MESSAGES.empty);
  }, [route?.params?.word, route?.params?.wordData]);

  const word = normalizeSearchWord(wordData?.[0]?.word || requestedWord);
  const phonetic = useMemo(() => findPhoneticText(wordData), [wordData]);
  const audioPronunciations = useMemo(() => getAudioPronunciations(wordData), [wordData]);
  const meanings = useMemo(() => flattenMeanings(wordData), [wordData]);

  const retrySearch = async () => {
    if (!word) {
      setError(ERROR_MESSAGES.empty);
      return;
    }

    try {
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
        {loading ? <LoadingSpinner message="Refreshing word..." /> : null}

        {!loading && error ? <ErrorMessage message={error} onRetry={retrySearch} /> : null}

        {!loading && !error ? (
          <>
            <View style={styles.headerCard}>
              <View style={styles.headerTopRow}>
                <View style={styles.wordIcon}>
                  <Text style={styles.wordInitial}>{(word || "?").slice(0, 1).toUpperCase()}</Text>
                </View>
                <View style={styles.wordCopy}>
                  <Text style={styles.eyebrow}>Dictionary result</Text>
                  <Text selectable style={styles.wordTitle}>
                    {word || "Unknown word"}
                  </Text>
                </View>
              </View>
              <View style={styles.phoneticRow}>
                <Text selectable style={styles.phonetic}>
                  {phonetic}
                </Text>
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
                ) : null}
              </View>
              {audioError ? <Text style={styles.audioError}>{audioError}</Text> : null}
            </View>

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

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 34,
  },
  headerCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 28,
    elevation: 5,
    marginBottom: 20,
    padding: 22,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  headerTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  wordIcon: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  wordInitial: {
    color: COLORS.card,
    fontSize: 24,
    fontWeight: "900",
  },
  wordCopy: {
    flex: 1,
  },
  eyebrow: {
    color: "#BFD3FF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  wordTitle: {
    color: COLORS.card,
    fontSize: 34,
    fontWeight: "900",
    marginTop: 2,
    textTransform: "capitalize",
  },
  phoneticRow: {
    alignItems: "flex-start",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 20,
    flexDirection: "column",
    gap: 14,
    marginTop: 18,
    padding: 14,
  },
  phonetic: {
    color: "#E6EEFF",
    fontSize: 16,
    fontStyle: "italic",
  },
  pronunciationList: {
    gap: 10,
    width: "100%",
  },
  pronunciationCard: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  pronunciationCopy: {
    gap: 3,
  },
  pronunciationLabel: {
    color: COLORS.card,
    fontSize: 14,
    fontWeight: "900",
  },
  pronunciationText: {
    color: "#BFD3FF",
    fontSize: 13,
    fontStyle: "italic",
  },
  audioError: {
    color: "#EF4444",
    fontSize: 13,
    marginTop: 10,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    color: COLORS.secondary,
    fontSize: 20,
    fontWeight: "900",
  },
  sectionMeta: {
    backgroundColor: COLORS.softBlue,
    borderRadius: 12,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});
