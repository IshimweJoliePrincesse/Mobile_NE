// This component validates pronunciation URLs and controls repeatable play, pause, and stop actions.
import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, ToastAndroid, View } from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  primary: "#2D6BE4",
  success: "#10B981",
  white: "#FFFFFF",
};

const PLAYBACK_STATES = {
  stopped: "stopped",
  playing: "playing",
  paused: "paused",
};

let activeSound = null;

function isValidAudioUrl(audioUrl) {
  return typeof audioUrl === "string" && /^https?:\/\//i.test(audioUrl);
}

function showAudioError() {
  const message = "Unable to play pronunciation.";

  if (ToastAndroid?.show) {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert("Audio error", message);
}

export default function AudioPlayer({ audioUrl, onError }) {
  const [sound, setSound] = useState(null);
  const [loadedUrl, setLoadedUrl] = useState("");
  const [playbackState, setPlaybackState] = useState(PLAYBACK_STATES.stopped);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
    };
  }, [sound]);

  if (!isValidAudioUrl(audioUrl)) {
    return null;
  }

  const handlePlaybackError = () => {
    setPlaybackState(PLAYBACK_STATES.stopped);
    showAudioError();
    onError?.("Unable to play pronunciation.");
  };

  const isPlaying = playbackState === PLAYBACK_STATES.playing;
  const canStop = Boolean(sound) && playbackState !== PLAYBACK_STATES.stopped;

  const stopAudio = async () => {
    try {
      if (!sound) {
        setPlaybackState(PLAYBACK_STATES.stopped);
        return;
      }

      const status = await sound.getStatusAsync();

      if (status.isLoaded) {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
      }

      setPlaybackState(PLAYBACK_STATES.stopped);
    } catch (_error) {
      handlePlaybackError();
    }
  };

  const playAudio = async () => {
    try {
      if (sound && loadedUrl === audioUrl) {
        const status = await sound.getStatusAsync();

        if (status.isLoaded && status.isPlaying) {
          await sound.pauseAsync();
          setPlaybackState(PLAYBACK_STATES.paused);
          return;
        }

        if (status.isLoaded && playbackState === PLAYBACK_STATES.stopped) {
          await sound.setPositionAsync(0);
        }

        await sound.playAsync();
        setPlaybackState(PLAYBACK_STATES.playing);
        return;
      }

      if (sound && loadedUrl !== audioUrl) {
        await sound.stopAsync().catch(() => {});
        await sound.unloadAsync().catch(() => {});
        setSound(null);
        setLoadedUrl("");
        setPlaybackState(PLAYBACK_STATES.stopped);
      }

      if (activeSound) {
        await activeSound.stopAsync().catch(() => {});
        await activeSound.unloadAsync().catch(() => {});
      }

      const { sound: loadedSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            setPlaybackState(PLAYBACK_STATES.stopped);
          }
        },
      );

      activeSound = loadedSound;
      setSound(loadedSound);
      setLoadedUrl(audioUrl);
      setPlaybackState(PLAYBACK_STATES.playing);
    } catch (_error) {
      handlePlaybackError();
    }
  };

  return (
    <View style={styles.controls}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? "Pause pronunciation" : "Play pronunciation"}
        onPress={playAudio}
        style={({ pressed }) => [
          styles.button,
          isPlaying && styles.playing,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons name={isPlaying ? "pause" : "volume-high"} size={22} color={COLORS.white} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Stop pronunciation"
        onPress={stopAudio}
        disabled={!canStop}
        style={({ pressed }) => [
          styles.button,
          styles.stopButton,
          !canStop && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons name="stop" size={18} color={COLORS.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  button: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  playing: {
    backgroundColor: COLORS.success,
  },
  stopButton: {
    height: 38,
    width: 38,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.75,
  },
});
