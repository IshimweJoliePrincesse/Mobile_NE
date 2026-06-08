// This file creates the side drawer navigation. The drawer shows Search, search history, and Clear History.
// These imports bring in React state, mobile UI elements, icons, navigation tools, screens, history, and API helpers.
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  NavigationContainer,
  NavigationIndependentTree,
} from "@react-navigation/native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import ErrorMessage from "../components/ErrorMessage";
import { useSearchHistory } from "../context/SearchHistoryContext";
import { useTheme } from "../context/ThemeContext";
import SearchScreen from "../screens/SearchScreen";
import WordDetailScreen from "../screens/WordDetailScreen";
import {
  fetchWordDefinition,
  getFriendlyErrorMessage,
} from "../services/dictionaryService";

// This creates the drawer navigation object used to register screens.
const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  // These values let the drawer navigate, read history, clear history, and show loading/errors for history taps.
  const { navigation } = props;
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = createStyles(colors);
  const { history, addSearch, clearHistory } = useSearchHistory();
  const [loadingWord, setLoadingWord] = useState("");
  const [error, setError] = useState("");
  const [lastHistoryWord, setLastHistoryWord] = useState("");

  // This function runs when a user taps a word in history. It fetches fresh data and opens the details screen.
  const openHistoryWord = async (word) => {
    try {
      setError("");
      setLoadingWord(word);
      setLastHistoryWord(word);

      // A history tap performs a new API request so the user sees up-to-date word details.
      const data = await fetchWordDefinition(word);
      addSearch(word);
      navigation.closeDrawer();
      navigation.navigate("WordDetail", {
        word,
        wordData: data,
      });
    } catch (requestError) {
      setError(getFriendlyErrorMessage(requestError));
    } finally {
      setLoadingWord("");
    }
  };

  return (
    <SafeAreaView style={styles.drawerSafeArea}>
      {/* This top drawer area displays the app identity. */}
      <View style={styles.drawerHeader}>
        <View style={styles.drawerGlow} />
        <View style={styles.logo}>
          <Ionicons name="book" size={28} color="#FFFFFF" />
        </View>
        <View>
          <Text style={styles.drawerTitle}>Dictionary</Text>
          <Text style={styles.drawerSubtitle}>LexiTech Solutions Ltd</Text>
        </View>
      </View>
      {/* This small drawer card explains what the search history section is for. */}
      <View style={styles.drawerHero}>
        <View style={styles.drawerHeroIcon}>
          <Ionicons name="library-outline" size={18} color={colors.gold} />
        </View>
        <Text style={styles.drawerHeroTitle}>Your word library</Text>
        <Text style={styles.drawerHeroText}>
          Recent searches stay here for quick lookup.
        </Text>
      </View>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.drawerScrollContent}
      >
        {/* This button takes the user back to the main Search screen. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open search"
          onPress={() => navigation.navigate("Search")}
          style={({ pressed }) => [styles.homeItem, pressed && styles.drawerPressed]}
        >
          <View style={styles.navIcon}>
            <Ionicons name="search-outline" size={18} color={colors.primary} />
          </View>
          <Text style={styles.homeText}>Search</Text>
        </Pressable>

        {/* This label starts the search history section. */}
        <Text style={styles.historyLabel}>Search History</Text>

        {/* If no searches exist yet, show a friendly empty message instead of a blank drawer. */}
        {history.length === 0 ? (
          <View style={styles.drawerEmpty}>
            <Ionicons name="time-outline" size={26} color={colors.drawerMuted} />
            <Text style={styles.drawerEmptyText}>No searched words yet.</Text>
          </View>
        ) : (
          // Each history item can be tapped to search that word again.
          history.map((word) => (
            <Pressable
              key={word}
              accessibilityRole="button"
              accessibilityLabel={`Search ${word}`}
              onPress={() => openHistoryWord(word)}
              disabled={Boolean(loadingWord)}
              style={({ pressed }) => [
                styles.historyItem,
                pressed && styles.drawerPressed,
              ]}
            >
              <View style={styles.historyIcon}>
                <Text style={styles.historyInitial}>{word.slice(0, 1).toUpperCase()}</Text>
              </View>
              <Text style={styles.historyText}>{word}</Text>
              {loadingWord === word ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
              <Ionicons name="chevron-forward" size={18} color={colors.drawerMuted} />
              )}
            </Pressable>
          ))
        )}

        {/* If a history search fails, show the error and let the user retry that word. */}
        {error ? (
          <ErrorMessage
            compact
            message={error}
            onRetry={() => openHistoryWord(lastHistoryWord)}
          />
        ) : null}
      </DrawerContentScrollView>

      {/* This footer contains the Clear History button at the bottom of the drawer. */}
      <View style={styles.drawerFooter}>
        {/* This button switches the app between light mode and dark mode. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle light and dark mode"
          onPress={toggleTheme}
          style={({ pressed }) => [styles.themeButton, pressed && styles.drawerPressed]}
        >
          <Ionicons
            name={isDark ? "sunny-outline" : "moon-outline"}
            size={18}
            color="#FFFFFF"
          />
          <Text style={styles.themeText}>{isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search history"
          onPress={clearHistory}
          disabled={history.length === 0}
          style={({ pressed }) => [
            styles.clearButton,
            history.length === 0 && styles.clearButtonDisabled,
            pressed && styles.drawerPressed,
          ]}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text style={styles.clearText}>Clear History</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// This component connects the Search screen and Word Detail screen inside a drawer navigator.
export default function DrawerNavigator() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <Drawer.Navigator
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            drawerStyle: styles.drawer,
            headerStyle: styles.header,
            headerTintColor: colors.text,
            headerTitleStyle: styles.headerTitle,
            sceneContainerStyle: styles.scene,
          }}
        >
          {/* This is the main screen where users type words. */}
          <Drawer.Screen
            name="Search"
            component={SearchScreen}
            options={{
              title: "Dictionary",
              drawerLabel: "Search",
            }}
          />
          {/* This screen is hidden from the drawer list because users reach it after searching. */}
          <Drawer.Screen
            name="WordDetail"
            component={WordDetailScreen}
            options={{
              title: "Word Details",
              drawerItemStyle: { display: "none" },
            }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}

// These styles control drawer colors, spacing, row layout, and the app header appearance.
function createStyles(colors) {
  return StyleSheet.create({
  scene: {
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.background,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  drawer: {
    backgroundColor: colors.secondary,
    width: 310,
  },
  drawerSafeArea: {
    backgroundColor: colors.secondary,
    flex: 1,
  },
  drawerHeader: {
    alignItems: "center",
    borderBottomColor: "rgba(255,255,255,0.08)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
    overflow: "hidden",
    paddingHorizontal: 18,
    paddingTop: 26,
    paddingBottom: 18,
  },
  drawerGlow: {
    backgroundColor: colors.primary,
    borderRadius: 70,
    height: 140,
    opacity: 0.22,
    position: "absolute",
    right: -48,
    top: -60,
    width: 140,
  },
  logo: {
    alignItems: "center",
    backgroundColor: colors.glass,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  drawerTitle: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
  },
  drawerSubtitle: {
    color: colors.softText,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  drawerHero: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 22,
    borderWidth: 1,
    marginHorizontal: 14,
    marginBottom: 18,
    marginTop: 16,
    padding: 16,
  },
  drawerHeroIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 15,
    height: 34,
    justifyContent: "center",
    marginBottom: 10,
    width: 34,
  },
  drawerHeroTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  drawerHeroText: {
    color: colors.softText,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  drawerScrollContent: {
    paddingTop: 0,
  },
  homeItem: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 12,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  navIcon: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  homeText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  historyLabel: {
    color: colors.softText,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginHorizontal: 18,
    textTransform: "uppercase",
  },
  drawerEmpty: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    marginHorizontal: 12,
    paddingHorizontal: 28,
    paddingVertical: 26,
  },
  drawerEmptyText: {
    color: colors.drawerMuted,
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  historyItem: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    marginHorizontal: 12,
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  historyIcon: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 15,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  historyInitial: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  historyText: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 16,
    textTransform: "capitalize",
  },
  drawerFooter: {
    borderTopColor: "rgba(255,255,255,0.12)",
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  clearButton: {
    alignItems: "center",
    borderColor: colors.error,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    paddingVertical: 12,
  },
  clearButtonDisabled: {
    opacity: 0.4,
  },
  clearText: {
    color: colors.error,
    fontSize: 15,
    fontWeight: "700",
  },
  drawerPressed: {
    backgroundColor: "rgba(45,107,228,0.18)",
  },
  themeButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginBottom: 10,
    minHeight: 50,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  themeText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  });
}
