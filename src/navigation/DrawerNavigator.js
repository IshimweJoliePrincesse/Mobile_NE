// This navigator wraps the app in a drawer and renders searchable history inside the drawer panel.
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
import SearchScreen from "../screens/SearchScreen";
import WordDetailScreen from "../screens/WordDetailScreen";
import {
  fetchWordDefinition,
  getFriendlyErrorMessage,
} from "../services/dictionaryService";

const Drawer = createDrawerNavigator();

const COLORS = {
  primary: "#2D6BE4",
  secondary: "#1A1A2E",
  background: "#F0F4FF",
  card: "#FFFFFF",
  muted: "#6B7280",
  error: "#EF4444",
};

function CustomDrawerContent(props) {
  const { navigation } = props;
  const { history, addSearch, clearHistory } = useSearchHistory();
  const [loadingWord, setLoadingWord] = useState("");
  const [error, setError] = useState("");
  const [lastHistoryWord, setLastHistoryWord] = useState("");

  const openHistoryWord = async (word) => {
    try {
      setError("");
      setLoadingWord(word);
      setLastHistoryWord(word);

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
      <View style={styles.drawerHeader}>
        <View style={styles.logo}>
          <Ionicons name="book" size={28} color={COLORS.card} />
        </View>
        <View>
          <Text style={styles.drawerTitle}>Dictionary</Text>
          <Text style={styles.drawerSubtitle}>LexiTech Solutions Ltd</Text>
        </View>
      </View>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.drawerScrollContent}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open search"
          onPress={() => navigation.navigate("Search")}
          style={({ pressed }) => [styles.homeItem, pressed && styles.drawerPressed]}
        >
          <Ionicons name="search-outline" size={20} color={COLORS.card} />
          <Text style={styles.homeText}>Search</Text>
        </Pressable>

        <Text style={styles.historyLabel}>Search History</Text>

        {history.length === 0 ? (
          <View style={styles.drawerEmpty}>
            <Ionicons name="time-outline" size={26} color={COLORS.muted} />
            <Text style={styles.drawerEmptyText}>No searched words yet.</Text>
          </View>
        ) : (
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
              <Text style={styles.historyText}>{word}</Text>
              {loadingWord === word ? (
                <ActivityIndicator color={COLORS.card} size="small" />
              ) : (
                <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
              )}
            </Pressable>
          ))
        )}

        {error ? (
          <ErrorMessage
            compact
            message={error}
            onRetry={() => openHistoryWord(lastHistoryWord)}
          />
        ) : null}
      </DrawerContentScrollView>

      <View style={styles.drawerFooter}>
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
          <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          <Text style={styles.clearText}>Clear History</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default function DrawerNavigator() {
  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <Drawer.Navigator
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            drawerStyle: styles.drawer,
            headerStyle: styles.header,
            headerTintColor: COLORS.secondary,
            headerTitleStyle: styles.headerTitle,
            sceneContainerStyle: styles.scene,
          }}
        >
          <Drawer.Screen
            name="Search"
            component={SearchScreen}
            options={{
              title: "Dictionary",
              drawerLabel: "Search",
            }}
          />
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

const styles = StyleSheet.create({
  scene: {
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.background,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    color: COLORS.secondary,
    fontWeight: "800",
  },
  drawer: {
    backgroundColor: COLORS.secondary,
    width: 300,
  },
  drawerSafeArea: {
    backgroundColor: COLORS.secondary,
    flex: 1,
  },
  drawerHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 22,
  },
  logo: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  drawerTitle: {
    color: COLORS.card,
    fontSize: 24,
    fontWeight: "800",
  },
  drawerSubtitle: {
    color: "#C7D2FE",
    fontSize: 12,
    marginTop: 2,
  },
  drawerScrollContent: {
    paddingTop: 0,
  },
  homeItem: {
    alignItems: "center",
    borderRadius: 14,
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 12,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  homeText: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: "700",
  },
  historyLabel: {
    color: "#C7D2FE",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginHorizontal: 18,
    textTransform: "uppercase",
  },
  drawerEmpty: {
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 26,
  },
  drawerEmptyText: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  historyItem: {
    alignItems: "center",
    borderLeftColor: COLORS.primary,
    borderLeftWidth: 4,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 12,
    marginVertical: 3,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  historyText: {
    color: COLORS.card,
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
    borderColor: COLORS.error,
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
    color: COLORS.error,
    fontSize: 15,
    fontWeight: "700",
  },
  drawerPressed: {
    backgroundColor: "rgba(45,107,228,0.18)",
  },
});
