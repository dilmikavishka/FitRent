import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "./hooks/useColorScheme";
import { LightTheme, AppDarkTheme } from "@/app/theme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    UberMoveMedium: require("../assets/fonts/UberMoveMedium.otf"),
  });

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? AppDarkTheme : LightTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="product/[id]" />
      </Stack>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}
