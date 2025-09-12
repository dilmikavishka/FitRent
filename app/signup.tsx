import AnimatedHeader from "@/components/AnimatedHeader";
import { useTheme } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { signUp } from "./services/authService";

export default function SignupScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    try {
      await signUp(email, password);
      router.replace("/home");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
     <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
        >
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      <View style={styles.headerContainer}>
        <AnimatedHeader />
      </View>


      <View style={styles.formContainer}>
        <Text style={[styles.title, { color: colors.text }]}>
          Create Your Account
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              borderColor: colors.border,
              backgroundColor: colors.card,
              color: colors.text,
            },
          ]}
          placeholder="Email"
          placeholderTextColor={colors.text + "99"}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <TextInput
          style={[
            styles.input,
            {
              borderColor: colors.border,
              backgroundColor: colors.card,
              color: colors.text,
            },
          ]}
          placeholder="Password"
          placeholderTextColor={colors.text + "99"}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <LinearGradient
            colors={[colors.primary, colors.notification]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </LinearGradient>
        </TouchableOpacity>

        
        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={[styles.link, { color: colors.primary }]}>
            Already have an account? Log in
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  headerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },

  formContainer: {
    flex: 2,
    padding: 20,
    justifyContent: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 30,
  },

  input: {
    borderWidth: 1,
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    fontSize: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },

  button: {
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
  },

  gradient: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  link: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "500",
  },

  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});
