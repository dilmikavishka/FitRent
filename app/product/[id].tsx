import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type { Product, ID } from "@/types";
import { getProduct, getAllProducts } from "../services/catalogService";
import { addToCart } from "../services/cartService";
import {
 addToWishlist, removeFromWishlist,
  isInWishlist,
} from "../services/wishlistService";
import { useAuth } from "../hooks/useAuth"; 

export default function Product() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth(); 

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  
  useEffect(() => {
    async function fetchData() {
      try {
        if (!id) return;
        const prod = await getProduct(id as ID);
        setProduct(prod);

        const all = await getAllProducts();
        const arr = Object.values(all);
        setRelatedProducts(arr.filter((p) => p.id !== id).slice(0, 4));

        if (user?.uid && id) {
          const fav = await isInWishlist(user.uid, id as ID);
          setWishlist(fav);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, user?.uid]);

  
  const handleAddToCart = async () => {
    if (!user?.uid || !product) {
      Alert.alert("Login required", "Please sign in to add items to cart.");
      return;
    }

    try {
      await addToCart(user.uid, {
        productId: product.id as ID,
        qty: 1,
        startDate: Date.now(),
        endDate: Date.now() + 24 * 60 * 60 * 1000, 
        addedAt: Date.now(),
        size: selectedSize || undefined,
      });
      Alert.alert("Added", `${product.title} added to your cart.`);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not add to cart.");
    }
  };

  const toggleWishlist = async () => {
    if (!user?.uid || !product) {
      Alert.alert("Login required", "Please sign in to manage your wishlist.");
      return;
    }

    try {
      if (wishlist) {
        await removeFromWishlist(user.uid, product.id as ID);
        setWishlist(false);
      } else {
        await addToWishlist(user.uid, product.id as ID);
        setWishlist(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- UI ---
  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Product not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {product.images[0] && (
          <Image source={{ uri: product.images[0] }} style={styles.image} />
        )}
        <Text style={[styles.title, { color: colors.text }]}>{product.title}</Text>
        <Text style={{ color: colors.text, marginBottom: 8 }}>
          Category: {product.category}
        </Text>
        <Text style={{ color: colors.text, marginBottom: 12 }}>
          Price per day: Rs.{product.pricePerDay}
        </Text>
        <Text style={{ color: colors.text, marginBottom: 16 }}>
          {product.description || "No description available."}
        </Text>
<View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 16 }}>
  {product.sizes?.map((size, index) => (
    <TouchableOpacity
      key={index}
      onPress={() => setSelectedSize(size)}
      style={{
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: selectedSize === size ? colors.primary : colors.card,
        marginRight: 8,
        marginBottom: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border || "#ccc",
      }}
    >
      <Text style={{ color: selectedSize === size ? "#fff" : colors.text }}>{size}</Text>
    </TouchableOpacity>
  )) || <Text style={{ color: colors.text }}>N/A</Text>}
</View>


       
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.cartButton, { backgroundColor: colors.primary }]}
            onPress={handleAddToCart}
          >
            <Text style={styles.cartText}>Add to Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.heartButton, { backgroundColor: colors.card }]}
            onPress={toggleWishlist}
          >
            <Ionicons
              name={wishlist ? "heart" : "heart-outline"}
              size={24}
              color={wishlist ? "red" : colors.text}
            />
          </TouchableOpacity>
        </View>

       
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Related Products
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {relatedProducts.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.relatedCard, { backgroundColor: colors.card }]}
              onPress={() =>
                router.push({ pathname: "/product/[id]", params: { id: p.id } })
              }
            >
              {p.images[0] && (
                <Image source={{ uri: p.images[0] }} style={styles.relatedImage} />
              )}
              <Text style={{ color: colors.text, fontWeight: "600" }}>{p.title}</Text>
              <Text style={{ color: colors.text, fontSize: 12 }}>
                Rs.{p.pricePerDay}/day
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width: "100%", height: 400, borderRadius: 12, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  buttonRow: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
  },
  cartButton: {
    flex: 3,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 8,
  },
  cartText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  heartButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  relatedCard: {
    width: 140,
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
  },
  relatedImage: { width: "100%", height: 100, borderRadius: 8, marginBottom: 6 },
});
