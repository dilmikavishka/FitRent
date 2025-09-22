import {
  getUserProfile,
  upsertUserProfile,
} from "@/app/services/profileService";
import type { Card, Order, UserProfile } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useTheme } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { deleteCard, getSavedCards, saveCard } from "../services/cardService";
import { getOrders } from "../services/orderService";

type Tab = "AccountDetails" | "TrackOrders" | "SavedCards";

export default function AccountPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("AccountDetails");
  const { colors } = useTheme();

  const [profile, setProfile] = useState<Partial<UserProfile>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    photoURL: "",
    address: "",
    city: "",
    country:"",
    postalCode:"",
    province:"",
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [cards, setCards] = useState<Card[]>([]);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [holderName, setHolderName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // useEffect(() => {
  //   if (!user?.uid) return;
  //   (async () => {
  //     const data = await getUserProfile(user.uid);
  //     if (data) setProfile(data);
  //   })();
  // }, [user?.uid]);

  // useEffect(() => {
  //   if (!user?.uid) return;
  //   (async () => {
  //     setOrdersLoading(true);
  //     const data = await getOrders(user.uid);
  //     setOrders(Object.values(data));
  //     setOrdersLoading(false);
  //   })();
  // }, [user?.uid]);

  // useEffect(() => {
  //   if (!user?.uid) return;
  //   (async () => {
  //     const data = await getSavedCards(user.uid);
  //     setCards(data);
  //   })();
  // }, [user?.uid]);
  useFocusEffect(
  useCallback(() => {
    if (!user?.uid) return;
    (async () => {
      const data = await getUserProfile(user.uid);
      if (data) setProfile(data);
    })();
  }, [user?.uid])
);

// Orders
useFocusEffect(
  useCallback(() => {
    if (!user?.uid) return;
    (async () => {
      setOrdersLoading(true);
      const data = await getOrders(user.uid);
      setOrders(Object.values(data));
      setOrdersLoading(false);
    })();
  }, [user?.uid])
);

// Saved cards
useFocusEffect(
  useCallback(() => {
    if (!user?.uid) return;
    (async () => {
      const data = await getSavedCards(user.uid);
      setCards(data);
    })();
  }, [user?.uid])
);

  const handleSaveProfile = async () => {
    if (!user?.uid) return;
    if (!profile.email) {
      Alert.alert("Error", "Email is required");
      return;
    }
    await upsertUserProfile(user.uid, profile);
    Alert.alert("Success", "Profile updated!");
  };
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      setProfile((p) => ({ ...p, photoURL: result.assets[0].uri }));
    }
  };

  const handleAddCard = async () => {
    if (!user?.uid) return;
    if (!cardNumber || !holderName || !expiry || !cvc) {
      Alert.alert("Error", "Please enter card details");
      return;
    }
    const newCard: Card = { cardNumber, expiry, cvc };
    const saved = await saveCard(user.uid, newCard);
    setCards((prev) => [...prev, saved]);
    setCardNumber("");
    setHolderName("");
  };

  const handleDeleteCard = async (id?: string) => {
    if (!user?.uid || !id) return;
    await deleteCard(user.uid, id);
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  const renderTabButtons = () => {
    const tabs: Tab[] = ["AccountDetails", "TrackOrders", "SavedCards"];
    return (
      <View style={styles.tabButtonContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && {
                borderBottomColor: colors.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabButtonText,
                { color: colors.text },
                activeTab === tab && {
                  color: colors.primary,
                  fontWeight: "bold",
                },
              ]}
            >
              {tab === "AccountDetails"
                ? "Account Details"
                : tab === "TrackOrders"
                ? "Track Orders"
                : "Saved Cards"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderTabContent = () => {
    if (activeTab === "AccountDetails") {
      return (
        <ScrollView contentContainerStyle={{ padding: 16, marginTop: 36 }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Account Details
          </Text>

          <TouchableOpacity onPress={pickImage}>
            {profile.photoURL ? (
              <Image
                source={{ uri: profile.photoURL }}
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 50,
                  marginTop: 24,
                }}
              />
            ) : (
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: colors.border,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text style={{ color: colors.text }}>Pick Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {["firstName", "lastName", "email", "phone","province","country","city","address","postal code"].map((field) => (
            <TextInput
              key={field}
              placeholder={field.replace(/([A-Z])/g, " $1").trim()}
              placeholderTextColor={colors.border}
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.card,
                },
              ]}
              value={(profile as any)[field]}
              onChangeText={(text) =>
                setProfile((p) => ({ ...p, [field]: text }))
              }
            />
          ))}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleSaveProfile}
          >
            <Text style={styles.buttonText}>Save Profile</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    } else if (activeTab === "TrackOrders") {
      if (ordersLoading)
        return (
          <Text style={{ margin: 16, color: colors.text }}>
            Loading orders...
          </Text>
        );
      if (!orders.length)
        return (
          <Text style={{ margin: 16, color: colors.text }}>
            No orders found.
          </Text>
        );

      return (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id ?? ""}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                { borderColor: colors.border, backgroundColor: colors.card },
              ]}
            >
              <Text style={{ fontWeight: "bold", color: colors.text }}>
                Order ID: {item.id}
              </Text>
              <Text style={{ color: colors.text }}>Status: {item.status}</Text>
              <Text style={{ color: colors.text }}>Total: Rs.{item.total}</Text>
              <Text style={{ color: colors.text }}>
                Items: {item.items.map((i) => i.title).join(", ")}
              </Text>
            </View>
          )}
        />
      );
    } else if (activeTab === "SavedCards") {
      return (
        <View style={{ flex: 1 }}>
          <FlatList
            data={cards}
            keyExtractor={(item) => item.id ?? ""}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            renderItem={({ item }) => (
              <View
                style={{
                  borderRadius: 12,
                  marginBottom: 16,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <LinearGradient
                  colors={[colors.primary, "#262626ff"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    padding: 20,
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => handleDeleteCard(item.id)}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      zIndex: 10,
                      backgroundColor: "rgba(0,0,0,0.4)",
                      borderRadius: 20,
                      padding: 6,
                    }}
                  >
                    <Ionicons name="close" size={20} color="#fff" />
                  </TouchableOpacity>

                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 26,
                      fontWeight: "bold",
                      marginBottom: 8,
                    }}
                  >
                    FitRent Card
                  </Text>

                  <Text style={{ color: "#fff", fontSize: 16 }}>
                    **** **** **** {item.cardNumber.slice(-4)}
                  </Text>

                  <Text style={{ color: "#fff", marginTop: 6 }}>
                    Expiry: {item.expiry}
                  </Text>
                </LinearGradient>
              </View>
            )}
          />

          <TouchableOpacity
            onPress={() => setShowAddForm(true)}
            style={{
              position: "absolute",
              bottom: 50,
              right: 20,
              backgroundColor: colors.primary,
              borderRadius: 30,
              width: 56,
              height: 56,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>

          <Modal
            visible={showAddForm}
            transparent
            animationType="fade"
            onRequestClose={() => setShowAddForm(false)}
          >
            <BlurView
              intensity={70}
              tint="dark"
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: "85%",
                  padding: 20,
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  shadowColor: "#000",
                  shadowOpacity: 0.2,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 6,
                  elevation: 6,
                }}
              >
                <TouchableOpacity
                  onPress={() => setShowAddForm(false)}
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                  }}
                >
                  <Ionicons name="close" size={22} color={colors.text} />
                </TouchableOpacity>

                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    marginBottom: 16,
                    color: colors.text,
                  }}
                >
                  Add New Card
                </Text>

                <TextInput
                  placeholder="Card Number"
                  placeholderTextColor={colors.text}
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  style={[styles.inputCard, { color: colors.text }]}
                />
                <TextInput
                  placeholder="Card Holder Name"
                  placeholderTextColor={colors.text}
                  value={holderName}
                  onChangeText={setHolderName}
                  style={[styles.inputCard, { color: colors.text }]}
                />
                <TextInput
                  placeholder="CVC"
                  placeholderTextColor={colors.text}
                  value={cvc}
                  onChangeText={setCvc}
                  style={[styles.inputCard, { color: colors.text }]}
                />
                <TextInput
                  placeholder="Expiry (MM/YY)"
                  placeholderTextColor={colors.text}
                  value={expiry}
                  onChangeText={setExpiry}
                  style={[styles.inputCard, { color: colors.text }]}
                />

                <TouchableOpacity
                  onPress={async () => {
                    await handleAddCard();
                    setShowAddForm(false);
                  }}
                  style={[styles.button, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.buttonText}>Add Card</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </Modal>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {renderTabButtons()}
      {renderTabContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  tabButton: { paddingVertical: 12 },
  tabButtonText: { fontSize: 14, fontWeight: "500" },
  sectionTitle: { fontSize: 28, fontWeight: "bold", marginBottom: 12 },
  input: {
    borderWidth: 1,
    padding: 15,
    borderRadius: 8,
    marginTop: 12,
  },
  inputCard: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 14,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  card: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
});
