// This component validates pronunciation URLs and controls repeatable play, pause, and stop actions.
import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, ToastAndroid, View } from "react-native";
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
        if (activeSound === sound) {
          activeSound = null;
        }
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

  const canStop = Boolean(sound) && playbackState !== PLAYBACK_STATES.stopped;
  const canPause = playbackState === PLAYBACK_STATES.playing;

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
      } else {
        setSound(null);
        setLoadedUrl("");
      }

      setPlaybackState(PLAYBACK_STATES.stopped);
    } catch (_error) {
      handlePlaybackError();
    }
  };

  const pauseAudio = async () => {
    try {
      if (!sound || !canPause) {
        return;
      }

      const status = await sound.getStatusAsync();

      if (status.isLoaded && status.isPlaying) {
        await sound.pauseAsync();
        setPlaybackState(PLAYBACK_STATES.paused);
      } else if (!status.isLoaded) {
        setSound(null);
        setLoadedUrl("");
        setPlaybackState(PLAYBACK_STATES.stopped);
      }
    } catch (_error) {
      handlePlaybackError();
    }
  };

  const playAudio = async () => {
    try {
      if (sound && loadedUrl === audioUrl) {
        const status = await sound.getStatusAsync();

        if (status.isLoaded) {
          if (activeSound && activeSound !== sound) {
            await activeSound.stopAsync().catch(() => {});
            await activeSound.unloadAsync().catch(() => {});
          }

          if (playbackState === PLAYBACK_STATES.stopped) {
            await sound.setPositionAsync(0);
          }

          activeSound = sound;
          await sound.playAsync();
          setPlaybackState(PLAYBACK_STATES.playing);
          return;
        }

        if (activeSound === sound) {
          activeSound = null;
        }

        setSound(null);
        setLoadedUrl("");
        setPlaybackState(PLAYBACK_STATES.stopped);
      }

      if (sound && loadedUrl !== audioUrl) {
        await sound.stopAsync().catch(() => {});
        await sound.unloadAsync().catch(() => {});
        if (activeSound === sound) {
          activeSound = null;
        }
        setSound(null);
        setLoadedUrl("");
        setPlaybackState(PLAYBACK_STATES.stopped);
      }

      if (activeSound && activeSound !== sound) {
        await activeSound.stopAsync().catch(() => {});
        await activeSound.unloadAsync().catch(() => {});
        activeSound = null;
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
        accessibilityLabel="Play pronunciation"
        onPress={playAudio}
        style={({ pressed }) => [
          styles.button,
          styles.playButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons name="play" size={17} color={COLORS.white} />
        <Text style={styles.buttonText}>Play</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Pause pronunciation"
        onPress={pauseAudio}
        disabled={!canPause}
        style={({ pressed }) => [
          styles.button,
          styles.pauseButton,
          !canPause && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons name="pause" size={17} color={COLORS.white} />
        <Text style={styles.buttonText}>Pause</Text>
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
        <Text style={styles.buttonText}>Stop</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  button: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    flexDirection: "row",
    gap: 4,
    height: 40,
    justifyContent: "center",
    paddingHorizontal: 9,
  },
  playButton: {
    backgroundColor: COLORS.primary,
  },
  pauseButton: {
    backgroundColor: COLORS.success,
  },
  stopButton: {
    backgroundColor: "#EF4444",
  },
  disabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.75,
  },
});
