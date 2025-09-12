import React from "react";
import { View, StyleSheet } from "react-native";
import { MotiText, MotiView } from "moti";

const letters = "FITRENT".split("");

export default function AnimatedHeader() {
  return (
    <View style={styles.container}>
      {/* Animated Brand Name */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1000 }}
      >
        <MotiView
          from={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1200, duration: 1200 }}
          style={styles.row}
        >
          {letters.map((letter, index) => (
            <MotiText
              key={index}
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                delay: index * 150,
                duration: 500,
              }}
              style={styles.titleText}

            >
              {letter}
            </MotiText>
          ))}
        </MotiView>
      </MotiView>

      {/* Tagline */}
      <MotiText
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 2000, duration: 800 }}
        style={styles.tagline}
      >
        You can prepare for anything
      </MotiText>
      <MotiText
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 2400, duration: 800 }}
        style={styles.tagline}
      >
        Just click and pre-order and we will get to you
      </MotiText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  row: {
    flexDirection: "row",
    marginBottom: 10,
  },
  titleText: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#6856FF",
    letterSpacing: 4,
    fontFamily: "UberMoveMedium", // ✅ replace if not installed
  },
  tagline: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    marginTop: 4,
  },
});
