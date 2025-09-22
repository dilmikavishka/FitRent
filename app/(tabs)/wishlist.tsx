import type { ID, Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { getProduct } from "../services/catalogService";
import { getWishlist, removeFromWishlist } from "../services/wishlistService";

export default function WishList() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const wishlistIds = await getWishlist(user.uid);
      const productPromises = Object.keys(wishlistIds).map((id) =>
        getProduct(id as ID)
      );
      const products = (await Promise.all(productPromises)).filter(Boolean) as Product[];
      setWishlistProducts(products);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not fetch wishlist.");
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchWishlist();
  // }, [user?.uid]);
  useFocusEffect(
  useCallback(() => {
    fetchWishlist();
  }, [user?.uid])
);

  const handleRemove = async (productId: ID) => {
    if (!user?.uid) return;
    try {
      await removeFromWishlist(user.uid, productId);
      setWishlistProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not remove item.");
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!wishlistProducts.length) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Your wishlist is empty</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>My Wishlist</Text>
      </View>

      <FlatList
        data={wishlistProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 24,
          marginTop: 8,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity  onPress={() => router.push(`/product/${item.id}`)}>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {item.images[0] && (
              <Image source={{ uri: item.images[0] }} style={styles.image} />
            )}
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: colors.text, fontWeight: "bold" }}>
                {item.title}
              </Text>
              <Text style={{ color: colors.text }}>Rs.{item.pricePerDay}/day</Text>
            </View>
            <TouchableOpacity onPress={() => handleRemove(item.id)}>
              <Ionicons name="trash-outline" size={24} color="red" />
            </TouchableOpacity>
          </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListFooterComponent={() => (
          <Text style={[styles.footerNote, { color: colors.text }]}>
            Note: Some items may be removed from your wishlist after a one-month period.
          </Text>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingHorizontal: 16,
    paddingTop: 36,
    paddingBottom: 58,
  },
  pageTitle: { fontSize: 34, fontWeight: "bold" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  footerNote: {
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 16,
  },
});
