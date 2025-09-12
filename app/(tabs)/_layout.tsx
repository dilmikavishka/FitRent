import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useTheme } from "@react-navigation/native";

export default function TabLayout() {
  const [loaded] = useFonts({
    UberMoveMedium: require("../../assets/fonts/UberMoveMedium.otf"),
  });

  const { colors, dark } = useTheme();

  if (!loaded) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: dark ? "#aaa" : "#666",
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 70,
          position: "absolute",
          shadowColor: dark ? "#000" : "#333",
          shadowOpacity: 0.05,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 5,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginBottom: 5,
          fontFamily: "UberMoveMedium",
          color: colors.text,
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: "Wishlist",
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color }) => (
            <Ionicons name="cart" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
