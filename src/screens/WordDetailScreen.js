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
};

function findPhoneticText(entries) {
  const entryWithText = entries.find((entry) => entry?.phonetic);
  const phoneticWithText = entries
    .flatMap((entry) => entry?.phonetics || [])
    .find((phonetic) => phonetic?.text);

  return entryWithText?.phonetic || phoneticWithText?.text || "No phonetic spelling available";
}

function findAudioUrl(entries) {
  const audioItem = entries
    .flatMap((entry) => entry?.phonetics || [])
    .find((phonetic) => /^https?:\/\//i.test(phonetic?.audio || ""));

  return audioItem?.audio || "";
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
  const audioUrl = useMemo(() => findAudioUrl(wordData), [wordData]);
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
              <Text selectable style={styles.wordTitle}>
                {word || "Unknown word"}
              </Text>
              <View style={styles.phoneticRow}>
                <Text selectable style={styles.phonetic}>
                  {phonetic}
                </Text>
                <AudioPlayer audioUrl={audioUrl} onError={setAudioError} />
              </View>
              {audioError ? <Text style={styles.audioError}>{audioError}</Text> : null}
            </View>

            {meanings.length ? (
              meanings.map((meaning, index) => (
                <DefinitionCard
                  key={`${meaning?.partOfSpeech || "meaning"}-${index}`}
                  meaning={meaning}
                />
              ))
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
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    elevation: 3,
    marginBottom: 16,
    padding: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  wordTitle: {
    color: COLORS.secondary,
    fontSize: 32,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  phoneticRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginTop: 12,
  },
  phonetic: {
    color: COLORS.muted,
    flex: 1,
    fontSize: 16,
    fontStyle: "italic",
  },
  audioError: {
    color: "#EF4444",
    fontSize: 13,
    marginTop: 10,
  },
});
