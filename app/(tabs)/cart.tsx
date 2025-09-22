import type { Card, ID, Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useTheme } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { getSavedCards, saveCard } from "../services/cardService";
import type { CartItem } from "../services/cartService";
import { getCart, removeFromCart } from "../services/cartService";
import { getProduct } from "../services/catalogService";
import { createOrderFromCart } from "../services/orderService";

export default function Cart() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState<
    (CartItem & { product?: Product; id: ID })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCVC] = useState("");
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [saveCardOption, setSaveCardOption] = useState(false);

  const [savedCards, setSavedCards] = useState<Card[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const fetchCart = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const cart = await getCart(user.uid);
      const itemsWithProduct = await Promise.all(
        Object.values(cart).map(async (ci) => {
          const product = await getProduct(ci.productId);
          return { ...ci, product, id: ci.productId };
        })
      );
      setCartItems(
        itemsWithProduct.filter(
          (i): i is typeof i & { product: Product } =>
            i.product !== null && i.product !== undefined
        )
      );
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not fetch cart.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedCards = async () => {
    if (!user?.uid) return;
    try {
      const cards = await getSavedCards(user.uid);
      setSavedCards(cards);
    } catch (err) {
      console.error(err);
    }
  };

  useFocusEffect(
  useCallback(() => {
    fetchCart();
    fetchSavedCards();
  }, [user?.uid])
);
  const handleRemove = async (productId: ID) => {
    if (!user?.uid) return;
    try {
      await removeFromCart(user.uid, productId);
      setCartItems((prev) => prev.filter((i) => i.productId !== productId));
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not remove item.");
    }
  };

  const handlePlaceOrder = async () => {
    if (!user?.uid) return;
    if (!name || !email || !phone) {
      Alert.alert("Error", "Please fill customer details.");
      return;
    }
    if (
      !selectedCardId &&
      showCardDetails &&
      (!cardNumber || !expiry || !cvc)
    ) {
      Alert.alert("Error", "Please fill card details.");
      return;
    }

    try {
      const cartMap: Record<ID, CartItem> = {};
      cartItems.forEach((ci) => {
        cartMap[ci.productId] = {
          productId: ci.productId,
          size: ci.size,
          qty: ci.qty,
          startDate: ci.startDate,
          endDate: ci.endDate,
          addedAt: ci.addedAt,
        };
      });

      const productsMap: Record<ID, Product> = {};
      cartItems.forEach((ci) => {
        if (ci.product) productsMap[ci.productId] = ci.product;
      });

      await createOrderFromCart(user.uid, cartMap, productsMap);

      if (saveCardOption && cardNumber && expiry && cvc) {
        await saveCard(user.uid, { cardNumber, expiry, cvc });
      }

      Alert.alert("Success", "Order placed successfully!");

      setCartItems([]);
      setName("");
      setEmail("");
      setPhone("");
      setCardNumber("");
      setExpiry("");
      setCVC("");
      setShowCardDetails(false);
      setSaveCardOption(false);
      setSelectedCardId(null);

      fetchSavedCards();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not place order.");
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.pricePerDay ?? 0;
    const days = Math.max(
      1,
      Math.ceil((item.endDate - item.startDate) / (1000 * 60 * 60 * 24))
    );
    return sum + price * days * item.qty;
  }, 0);

  const deposit = Math.round(subtotal * 0.2);
  const total = subtotal + deposit;

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!cartItems.length) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Your cart is empty</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>Checkout</Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Cart Items
        </Text>
        {cartItems.map((item) => (
          <View
            key={item.id}
            style={[styles.card, { backgroundColor: colors.card }]}
          >
            {item.product?.images?.[0] && (
              <Image
                source={{ uri: item.product.images[0] }}
                style={styles.image}
              />
            )}
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: colors.text, fontWeight: "bold" }}>
                {item.product?.title}
              </Text>
              <Text style={{ color: colors.text }}>
                Rs.{item.product?.pricePerDay}/day x {item.qty}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleRemove(item.productId)}>
              <Ionicons name="trash-outline" size={24} color="red" />
            </TouchableOpacity>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Customer Details
        </Text>
        <TextInput
          placeholder="Full Name"
          style={[
            styles.input,
            { color: colors.text, borderColor: colors.border || "#ccc" },
          ]}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Email"
          style={[
            styles.input,
            { color: colors.text, borderColor: colors.border || "#ccc" },
          ]}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Phone"
          style={[
            styles.input,
            { color: colors.text, borderColor: colors.border || "#ccc" },
          ]}
          value={phone}
          onChangeText={setPhone}
        />

        {savedCards.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Saved Cards
            </Text>
            {savedCards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={[
                  styles.savedCardRow,
                  selectedCardId === card.id
                    ? { borderColor: colors.primary }
                    : { borderColor: colors.border || "#ccc" },
                ]}
                onPress={() => setSelectedCardId(card.id ?? null)}
              >
                <Text style={{ color: colors.text }}>
                  **** **** **** {card.cardNumber.slice(-4)}
                </Text>
                {selectedCardId === card.id && (
                  <Ionicons
                    name="checkmark-outline"
                    size={20}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
            <Text
              style={{
                textAlign: "center",
                marginVertical: 8,
                color: colors.text,
              }}
            >
              or enter new card
            </Text>
          </>
        )}

        <TouchableOpacity
          style={styles.toggleCardRow}
          onPress={() => setShowCardDetails(!showCardDetails)}
        >
          <Text style={{ color: colors.text, fontWeight: "bold" }}>
            Enter New Card
          </Text>
          <Ionicons
            name={
              showCardDetails ? "chevron-up-outline" : "chevron-down-outline"
            }
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>

        {showCardDetails && !selectedCardId && (
          <View>
            <TextInput
              placeholder="Card Number"
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="number-pad"
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border || "#ccc" },
              ]}
            />
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TextInput
                placeholder="Expiry MM/YY"
                value={expiry}
                onChangeText={setExpiry}
                style={[
                  styles.inputHalf,
                  { color: colors.text, borderColor: colors.border || "#ccc" },
                ]}
              />
              <TextInput
                placeholder="CVC"
                value={cvc}
                onChangeText={setCVC}
                style={[
                  styles.inputHalf,
                  { color: colors.text, borderColor: colors.border || "#ccc" },
                ]}
              />
            </View>
            <TouchableOpacity
              style={styles.saveCardRow}
              onPress={() => setSaveCardOption(!saveCardOption)}
            >
              <Ionicons
                name={saveCardOption ? "checkbox-outline" : "square-outline"}
                size={24}
                color={colors.text}
              />
              <Text style={{ color: colors.text, marginLeft: 8 }}>
                Save card for future
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View
          style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: colors.card,
            borderRadius: 12,
          }}
        >
          <Text
            style={{ color: colors.text, fontWeight: "bold", fontSize: 16 }}
          >
            Order Summary
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            <Text style={{ color: colors.text }}>Subtotal:</Text>
            <Text style={{ color: colors.text }}>Rs.{subtotal}</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 4,
            }}
          >
            <Text style={{ color: colors.text }}>Deposit (20%):</Text>
            <Text style={{ color: colors.text }}>Rs.{deposit}</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 4,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: "bold" }}>
              Total:
            </Text>
            <Text style={{ color: colors.text, fontWeight: "bold" }}>
              Rs.{total}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.checkoutText}>Place Order</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  pageTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  image: { width: 80, height: 80, borderRadius: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12 },
  inputHalf: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  checkoutButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  checkoutText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  toggleCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  saveCardRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  savedCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
});
