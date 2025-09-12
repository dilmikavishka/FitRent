import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { MotiText, MotiView } from "moti";

const { width, height } = Dimensions.get("window");
const letters = "FITRENT".split("");

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
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
              style={styles.text}
            >
              {letter}
            </MotiText>
          ))}
        </MotiView>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8E4FC", 
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
  },
  text: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#6856FF", 
    letterSpacing: 4,
    fontFamily: "UberMoveMedium", 
  },
});
