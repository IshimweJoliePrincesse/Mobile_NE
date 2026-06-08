// This screen shows a short book-opening animation before the dictionary search screen appears.
// These imports provide React animation tools, mobile UI pieces, icons, and the current app theme.
import React, { useEffect, useRef } from "react";
import { Animated, Easing, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function BookOpeningScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // These animated values control the left and right pages so the book appears to open.
  const leftPage = useRef(new Animated.Value(0)).current;
  const rightPage = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;

  // This effect starts the book-opening animation as soon as the loading screen appears.
  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(leftPage, {
          toValue: 1,
          duration: 850,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(rightPage, {
          toValue: 1,
          duration: 850,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [contentFade, leftPage, rightPage]);

  // These rotations make the two book covers move away from the center.
  const leftPageRotation = leftPage.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-18deg"],
  });

  const rightPageRotation = rightPage.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "18deg"],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* This title area tells the user the dictionary is getting ready. */}
        <View style={styles.titleBlock}>
          <View style={styles.logoCircle}>
            <Ionicons name="book-outline" size={36} color="#FFFFFF" />
          </View>
          <Text style={styles.brandLabel}>LexiTech Solutions Ltd</Text>
          <Text style={styles.title}>Opening Dictionary</Text>
        </View>

        {/* This animated book uses two panels to create a simple opening-book effect. */}
        <View style={styles.bookWrap}>
          <Animated.View
            style={[
              styles.bookPage,
              styles.leftBookPage,
              {
                transform: [
                  { perspective: 700 },
                  { translateX: -4 },
                  { rotateY: leftPageRotation },
                ],
              },
            ]}
          >
            <View style={styles.pageLine} />
            <View style={styles.pageLineShort} />
            <View style={styles.pageLine} />
          </Animated.View>

          <Animated.View
            style={[
              styles.bookPage,
              styles.rightBookPage,
              {
                transform: [
                  { perspective: 700 },
                  { translateX: 4 },
                  { rotateY: rightPageRotation },
                ],
              },
            ]}
          >
            <View style={styles.pageLine} />
            <View style={styles.pageLineShort} />
            <View style={styles.pageLine} />
          </Animated.View>

          <View style={styles.bookSpine} />
        </View>

        {/* This message fades in after the book opens. */}
        <Animated.View style={[styles.loadingCopy, { opacity: contentFade }]}>
          <Text style={styles.loadingTitle}>Preparing your word search</Text>
          <Text style={styles.loadingText}>Definitions, examples, history, and pronunciations are almost ready.</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

// These styles control the full-screen loading view and the animated book illustration.
function createStyles(colors) {
  return StyleSheet.create({
    safeArea: {
      backgroundColor: colors.background,
      flex: 1,
    },
    container: {
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
      padding: 24,
    },
    titleBlock: {
      alignItems: "center",
      marginBottom: 34,
    },
    logoCircle: {
      alignItems: "center",
      backgroundColor: colors.primary,
      borderRadius: 30,
      height: 70,
      justifyContent: "center",
      marginBottom: 16,
      width: 70,
    },
    brandLabel: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    title: {
      color: colors.text,
      fontSize: 30,
      fontWeight: "900",
      marginTop: 6,
      textAlign: "center",
    },
    bookWrap: {
      alignItems: "center",
      flexDirection: "row",
      height: 150,
      justifyContent: "center",
      marginVertical: 6,
      width: 230,
    },
    bookPage: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 18,
      borderWidth: 1,
      elevation: 4,
      height: 140,
      justifyContent: "center",
      padding: 18,
      shadowColor: colors.secondary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      width: 105,
    },
    leftBookPage: {
      borderBottomRightRadius: 6,
      borderTopRightRadius: 6,
    },
    rightBookPage: {
      borderBottomLeftRadius: 6,
      borderTopLeftRadius: 6,
    },
    bookSpine: {
      backgroundColor: colors.primary,
      borderRadius: 6,
      height: 132,
      position: "absolute",
      width: 10,
    },
    pageLine: {
      backgroundColor: colors.border,
      borderRadius: 2,
      height: 5,
      marginBottom: 13,
      width: "100%",
    },
    pageLineShort: {
      backgroundColor: colors.border,
      borderRadius: 2,
      height: 5,
      marginBottom: 13,
      width: "72%",
    },
    loadingCopy: {
      alignItems: "center",
      marginTop: 34,
    },
    loadingTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "900",
      textAlign: "center",
    },
    loadingText: {
      color: colors.muted,
      fontSize: 14,
      lineHeight: 21,
      marginTop: 8,
      maxWidth: 300,
      textAlign: "center",
    },
  });
}
