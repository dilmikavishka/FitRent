import { DefaultTheme, DarkTheme, Theme } from "@react-navigation/native";

export const LightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#6856FF", 
    background: "#FFFFFF",
    card: "#F9F9F9",
    text: "#333333",
    border: "#E5E5E5",
    notification: "#9A86FD",
  },
};

export const AppDarkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#9A86FD", 
    background: "#121212",
    card: "#1E1E1E",
    text: "#FFFFFF",
    border: "#333333",
    notification: "#6856FF",
  },
};
