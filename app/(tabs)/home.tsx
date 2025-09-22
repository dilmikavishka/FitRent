import type { Product } from "@/types";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getAllProducts } from "../services/catalogService";

const categories = ["All", "Coat", "Suit", "Accessory", "Trouser", "Waistcoat"];

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { colors } = useTheme();
  const router = useRouter();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const allProducts = await getAllProducts();
        const arrProducts = Object.values(allProducts);
        setProducts(arrProducts);
        setFilteredProducts(arrProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    if (search) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredProducts(filtered);
  }, [search, selectedCategory, products]);

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (products.length === 0) {
    return (
      <SafeAreaView
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <Text style={{ color: colors.text }}>No products available.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <TextInput
          placeholder="Search products..."
          placeholderTextColor={colors.text + "88"}
          style={[styles.searchInput, { color: colors.text }]}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={{ paddingVertical: 8 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                {
                  backgroundColor:
                    selectedCategory === cat ? colors.primary : colors.card,
                },
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={{
                  color: selectedCategory === cat ? "#fff" : colors.text,
                  fontWeight: "bold",
                }}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              { backgroundColor: colors.card, flex: 1, marginHorizontal: 4 },
            ]}
            onPress={() => router.push(`/product/${item.id}`)}
          >
            {item.images[0] && (
              <Image source={{ uri: item.images[0] }} style={styles.image} />
            )}
            <Text style={[styles.title, { color: colors.text }]}>
              {item.title}
            </Text>
            <Text style={{ color: colors.text }}>
              Category: {item.category}
            </Text>
            <Text style={{ color: colors.text }}>
              Price per day: Rs.{item.pricePerDay}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: { width: "100%", height: 150, borderRadius: 8, marginBottom: 8 },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  searchContainer: {
    margin: 16,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    fontSize: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
  },
});
