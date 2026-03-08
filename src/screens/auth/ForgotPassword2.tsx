import React, { useState, useEffect } from "react";
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
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import Toast from "react-native-toast-message";
import { ipv4 } from "../../utils/config";

export default function ForgotPassword2({ navigation, route }: any) {
  const { email } = route.params;
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sent) {
      sendOtp(email);
      setSent(true);
    }
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const sendOtp = async (emailAddr: string) => {
    try {
      const response = await axios.post(ipv4 + "sendotp", {
        email: emailAddr.trim(),
      });
      if (response.data.otp) {
        Toast.show({ type: "success", text1: "OTP Sent", text2: "Check your email for the code" });
      } else {
        Toast.show({ type: "error", text1: "Error", text2: "Could not send OTP, try again" });
      }
    } catch (e) {
      Toast.show({ type: "error", text1: "Network Error", text2: "Could not send OTP, try again later" });
    }
  };

  const handleResendOTP = () => {
    sendOtp(email);
    setTimer(60);
  };

  const handleVerify = async () => {
    if (!otp.trim()) {
      Toast.show({ type: "error", text1: "Empty OTP", text2: "Please enter the OTP sent to your email" });
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(ipv4 + "verotp", {
        email: email.trim(),
        otp: otp.trim(), 
      });
      if (response.status === 200) {
        navigation.navigate("Forgot3", { email: email.trim() });
      } else {
        Toast.show({ type: "error", text1: "Invalid OTP", text2: "The code you entered is incorrect" });
      }
    } catch (e) {
      Toast.show({ type: "error", text1: "Error", text2: "An error occurred, try again later" });
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

          {/* Icon */}
          <View style={styles.iconCircle}>
            <MaterialIcons name="mark-email-read" size={36} color="#D32F2F" />
          </View>

          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            We sent a verification code to{"\n"}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          {/* OTP Input */}
          <View style={styles.inputWrapper}>
            <Ionicons name="key-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter OTP code"
              placeholderTextColor="#999"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={6}
            />
          </View>

          {/* Resend Timer */}
          <TouchableOpacity
            style={[styles.timerButton, timer === 0 ? styles.timerActive : styles.timerInactive]}
            onPress={handleResendOTP}
            disabled={timer !== 0}
            activeOpacity={0.8}
          >
            <MaterialIcons name="timer" size={18} color="#fff" />
            <Text style={styles.timerText}>
              {timer === 0 ? "Resend OTP" : `Resend in ${timer}s`}
            </Text>
          </TouchableOpacity>

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.primaryButton, (!otp.trim() || loading) && styles.buttonDisabled]}
            onPress={handleVerify}
            activeOpacity={0.85}
            disabled={!otp.trim() || loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? "Verifying..." : "Verify Code"}
            </Text>
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity
            style={styles.backToLogin}
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={16} color="#D32F2F" />
            <Text style={styles.backToLoginText}>Back to Login</Text>
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
    backgroundColor: "#fff5f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "#fdd",
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

  // ── Input ────────────────────────────────────────────
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: 50,
    height: 56,
    paddingHorizontal: 18,
    marginBottom: 20,
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
    letterSpacing: 4,
  },

  // ── Timer ────────────────────────────────────────────
  timerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
    marginBottom: 28,
  },
  timerActive: {
    backgroundColor: "#D32F2F",
  },
  timerInactive: {
    backgroundColor: "#333",
  },
  timerText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  // ── Button ───────────────────────────────────────────
  primaryButton: {
    height: 56,
    backgroundColor: "#D32F2F",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 20,
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

  // ── Back to Login ────────────────────────────────────
  backToLogin: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  backToLoginText: {
    fontSize: 15,
    color: "#D32F2F",
    fontWeight: "600",
  },
});