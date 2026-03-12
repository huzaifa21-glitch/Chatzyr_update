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

export default function ForgotPassword3({ navigation, route }: any) {
  const { email } = route.params;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDone = async () => {
    if (!password) {
      Toast.show({ type: "error", text1: "Error", text2: "Password can't be empty" });
      return;
    }
    if (password.length < 8) {
      Toast.show({ type: "error", text1: "Error", text2: "Password must be at least 8 characters" });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({ type: "error", text1: "Error", text2: "Passwords don't match" });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(ipv4 + "resetpassword", {
        email: email.trim(),
        password,
      });

      if (response.status === 200) {
        Toast.show({ type: "success", text1: "Success!", text2: "Password reset successfully" });
        navigation.navigate("Login");
      } else {
        Toast.show({ type: "error", text1: "Network Error", text2: "An error occurred, try again later" });
      }
    } catch (e) {
      Toast.show({ type: "error", text1: "Network Error", text2: "An error occurred, try again later" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
     

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

          {/* Icon */}
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-circle-outline" size={36} color="#22c55e" />
          </View>

          <Text style={styles.title}>OTP Verified!</Text>
          <Text style={styles.subtitle}>
            Create a new password for{"\n"}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          {/* New Password */}
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.inputWithEye]}
              placeholder="New Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.inputWithEye]}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeButton}>
              <Ionicons name={showConfirm ? "eye-outline" : "eye-off-outline"} size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Reset Button */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleDone}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? "Resetting..." : "Reset Password"}
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
    alignItems: "center",
    minHeight: 500,
  },

  // ── Icon ─────────────────────────────────────────────
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0fdf4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "#bbf7d0",
  },

  // ── Title ────────────────────────────────────────────
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  emailHighlight: {
    color: "#D32F2F",
    fontWeight: "700",
  },

  // ── Inputs ───────────────────────────────────────────
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: 50,
    height: 56,
    paddingHorizontal: 18,
    marginBottom: 16,
    backgroundColor: "#fff",
    width: "100%",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#111",
    height: "100%",
  },
  inputWithEye: {
    paddingRight: 8,
  },
  eyeButton: {
    padding: 4,
  },

  // ── Button ───────────────────────────────────────────
  primaryButton: {
    height: 56,
    backgroundColor: "#D32F2F",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 12,
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