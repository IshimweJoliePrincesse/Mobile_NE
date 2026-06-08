// This component plays one pronunciation audio file. It gives users separate Play, Pause, and Stop buttons.
// These imports provide React state, mobile UI elements, Expo audio playback, and button icons.
import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

// These three states describe exactly what the audio is doing: stopped, playing, or paused.
const PLAYBACK_STATES = {
  stopped: "stopped",
  playing: "playing",
  paused: "paused",
};

// This variable remembers the one audio file currently active so two pronunciations do not play at the same time.
let activeSound = null;

// This helper makes sure the audio link starts with http or https before the app tries to play it.
function isValidAudioUrl(audioUrl) {
  return typeof audioUrl === "string" && /^https?:\/\//i.test(audioUrl);
}

// This helper shows a simple message if the phone cannot load or play the pronunciation.
function showAudioError() {
  const message = "Unable to play pronunciation.";

  if (ToastAndroid?.show) {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert("Audio error", message);
}

export default function AudioPlayer({ audioUrl, onError }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // These state values remember the loaded audio object, the URL it belongs to, and whether it is stopped, playing, or paused.
  const [sound, setSound] = useState(null);
  const [loadedUrl, setLoadedUrl] = useState("");
  const [playbackState, setPlaybackState] = useState(PLAYBACK_STATES.stopped);

  // This cleanup unloads the audio when the component disappears, such as when the user searches a different word.
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

  // If there is no valid audio link, this component hides itself instead of showing broken buttons.
  if (!isValidAudioUrl(audioUrl)) {
    return null;
  }

  // This function resets the player and tells the parent screen that audio playback failed.
  const handlePlaybackError = () => {
    setPlaybackState(PLAYBACK_STATES.stopped);
    showAudioError();
    onError?.("Unable to play pronunciation.");
  };

  // These values decide when the Pause and Stop buttons should be active.
  const canStop = Boolean(sound) && playbackState !== PLAYBACK_STATES.stopped;
  const canPause = playbackState === PLAYBACK_STATES.playing;

  // Stop ends playback and resets the audio to the beginning.
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

  // Pause keeps the current position, so pressing Play later continues from the same place.
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

  // Play starts audio for the first time, resumes paused audio, or reloads audio if an old sound was already unloaded.
  const playAudio = async () => {
    try {
      // If this audio file is already loaded, reuse it instead of downloading it again.
      if (sound && loadedUrl === audioUrl) {
        const status = await sound.getStatusAsync();

        if (status.isLoaded) {
          // Stop any other pronunciation before this one starts so the app never plays two clips together.
          if (activeSound && activeSound !== sound) {
            await activeSound.stopAsync().catch(() => {});
            await activeSound.unloadAsync().catch(() => {});
          }

          // When the user pressed Stop before, Play should restart from the beginning.
          if (playbackState === PLAYBACK_STATES.stopped) {
            await sound.setPositionAsync(0);
          }

          activeSound = sound;
          await sound.playAsync();
          setPlaybackState(PLAYBACK_STATES.playing);
          return;
        }

        // If the saved sound was already unloaded, clear it and load a fresh copy below.
        if (activeSound === sound) {
          activeSound = null;
        }

        setSound(null);
        setLoadedUrl("");
        setPlaybackState(PLAYBACK_STATES.stopped);
      }

      // If the URL changed, remove the old audio object before loading the new one.
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

      // Before loading a fresh sound, unload any other active pronunciation.
      if (activeSound && activeSound !== sound) {
        await activeSound.stopAsync().catch(() => {});
        await activeSound.unloadAsync().catch(() => {});
        activeSound = null;
      }

      // This is where Expo loads the online audio file and immediately starts playing it.
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
      {/* Play starts new audio or resumes audio from the paused position. */}
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
        <Ionicons name="play" size={17} color="#FFFFFF" />
        <Text style={styles.buttonText}>Play</Text>
      </Pressable>

      {/* Pause temporarily stops the audio without resetting its current position. */}
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
        <Ionicons name="pause" size={17} color="#FFFFFF" />
        <Text style={styles.buttonText}>Pause</Text>
      </Pressable>

      {/* Stop stops the audio and resets it back to the beginning. */}
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
        <Ionicons name="stop" size={18} color="#FFFFFF" />
        <Text style={styles.buttonText}>Stop</Text>
      </Pressable>
    </View>
  );
}

// These styles control the row of audio buttons and their colors.
function createStyles(colors) {
  return StyleSheet.create({
  controls: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    height: 44,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  playButton: {
    backgroundColor: colors.primary,
  },
  pauseButton: {
    backgroundColor: colors.accent,
  },
  stopButton: {
    backgroundColor: colors.rose || colors.error,
  },
  disabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.75,
  },
  });
}
