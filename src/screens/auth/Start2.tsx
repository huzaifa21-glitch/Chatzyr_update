import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import axios from "axios";
import { ipv4 } from "../../utils/config";

export default function Start2({ navigation, route }: any) {
  const { username, email, password, profilePic } = route.params;
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (text: string) => {
    if (text.length > 650) return;
    setBio(text);
  };

  const handleDone = async () => {
    if (!bio.trim()) {
      Toast.show({ type: "error", text1: "Invalid Bio", text2: "Please enter a bio" });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(ipv4 + "register", {
        username,
        password,
        email,
        pic: profilePic,
        bio,
        backpic:
          "https://st4.depositphotos.com/4413287/40922/i/450/depositphotos_409223806-stock-photo-natural-linen-material-textile-canvas.jpg",
      });

      if (response.status === 200 || response.status === 201) {
        Toast.show({ type: "success", text1: "Welcome!", text2: "Account created successfully. Please log in." });
        navigation.navigate("Login");
      } else if (response.status === 401) {
        Toast.show({ type: "error", text1: "Email Exists", text2: "Try resetting your password instead" });
      }
    } catch (e) {
      Toast.show({ type: "error", text1: "Registration Failed", text2: "Try again later or use a different email" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#D32F2F" />

      {/* Red Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Image
          source={require("../../../assets/Logos/logo1.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* White Card */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Your Bio</Text>
          <Text style={styles.subtitle}>
            Write a short bio so others can get to know you better!
          </Text>

          {/* Bio Input */}
          <View style={styles.bioWrapper}>
            <TextInput
              placeholder="Your bio goes here..."
              placeholderTextColor="#aaa"
              value={bio}
              onChangeText={handleChange}
              style={styles.bioInput}
              multiline
              maxLength={650}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{bio.length}/650</Text>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleDone}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? "Creating Account..." : "Create Account"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D32F2F",
  },

  // ── Header ──────────────────────────────────────────
  header: {
    backgroundColor: "#D32F2F",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingBottom: 36,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: 62,
    padding: 8,
  },
  logo: {
    width: 220,
    height: 90,
  },

  // ── Scroll / Card ────────────────────────────────────
  scrollContent: {
    flexGrow: 1,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 48,
    minHeight: 500,
  },

  // ── Title ────────────────────────────────────────────
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
    paddingHorizontal: 10,
  },

  // ── Bio Input ────────────────────────────────────────
  bioWrapper: {
    borderWidth: 1.5,
    borderColor: "#D32F2F",
    borderRadius: 16,
    padding: 14,
    marginBottom: 32,
    minHeight: 160,
  },
  bioInput: {
    fontSize: 15,
    color: "#111",
    minHeight: 120,
    lineHeight: 22,
  },
  charCount: {
    fontSize: 12,
    color: "#bbb",
    textAlign: "right",
    marginTop: 8,
  },

  // ── Button ───────────────────────────────────────────
  primaryButton: {
    height: 56,
    backgroundColor: "#D32F2F",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    shadowColor: "#D32F2F",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: "#e08080",
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});