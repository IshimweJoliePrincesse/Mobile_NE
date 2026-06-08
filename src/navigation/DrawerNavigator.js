// This file creates the side drawer navigation. The drawer shows Search, Search History, theme mode, and Clear History.
// These imports bring in React, mobile UI elements, icons, navigation tools, screens, and shared history.
import React from "react";
import {
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
import { useSearchHistory } from "../context/SearchHistoryContext";
import { useTheme } from "../context/ThemeContext";
import HistoryScreen from "../screens/HistoryScreen";
import SearchScreen from "../screens/SearchScreen";
import WordDetailScreen from "../screens/WordDetailScreen";

// This creates the drawer navigation object used to register screens.
const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  // These values let the drawer navigate, read history count, clear history, and switch theme mode.
  const { navigation } = props;
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = createStyles(colors);
  const { history, clearHistory } = useSearchHistory();

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
          Open the Search History tab to view every saved word.
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

        {/* This button opens the dedicated drawer tab where all search history lives. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open search history"
          onPress={() => navigation.navigate("SearchHistory")}
          style={({ pressed }) => [styles.homeItem, pressed && styles.drawerPressed]}
        >
          <View style={styles.navIcon}>
            <Ionicons name="time-outline" size={18} color={colors.primary} />
          </View>
          <Text style={styles.homeText}>Search History</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{history.length}</Text>
          </View>
        </Pressable>
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
          {/* This drawer tab stores and displays every successful searched word. */}
          <Drawer.Screen
            name="SearchHistory"
            component={HistoryScreen}
            options={{
              title: "Search History",
              drawerLabel: "Search History",
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
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
  },
  countBadge: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
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
