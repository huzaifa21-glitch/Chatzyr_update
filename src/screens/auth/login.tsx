import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
// import Logo from "../../../assets/Logos/logo.png";

const { width, height } = Dimensions.get("window");

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const SOCIAL_LINKS = {
    facebook:
      "https://www.facebook.com/people/Chatzyr-App/pfbid02iCv5hAx8WUfCBwF9CmfBBd9DNw18esaQpqEwguMjQvyQPhS13P6tJTuebyyqU2KGl/",
    instagram: "https://www.instagram.com/chatzyrapp/",
    x: "https://x.com/ChatzyrNews",
  };

  const handleSocialPress = (url: string) => {
    Linking.openURL(url);
  };

  const handleLogin = () => {
    // Add your login logic here
    navigation?.navigate("Home");
    console.log("Login pressed", { email, password });
  };

  const handleSignUp = () => {
    navigation?.navigate("SignUp");
  };

  const handleForgotPassword = () => {
    navigation?.navigate("Forgot1");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#D32F2F" />

      {/* Red Header Section */}
      <View style={styles.header}>
        <Image
          source={require("../../../assets/Logos/logo1.png")}
          style={{ width: 258, height: 128 }}
          resizeMode="contain"
        />
      </View>

      {/* White Card Section */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Connect With Us!</Text>

          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={22}
                color="#000000"
              />
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotWrapper}
            onPress={handleForgotPassword}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleSignUp} activeOpacity={0.7}>
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
          {/* Follow Us */}
          <View style={styles.followRow}>
            <Text style={styles.followText}>Follow us on</Text>
          </View>

          <View style={styles.socialRow}>
            {/* Facebook */}
            <TouchableOpacity
              style={styles.socialButton}
              activeOpacity={0.8}
              onPress={() => handleSocialPress(SOCIAL_LINKS.facebook)}
            >
              <View style={[styles.socialIcon, styles.facebookIcon]}>
                <Ionicons name="logo-facebook" size={22} color="#ffffff" />
              </View>
            </TouchableOpacity>

            {/* Instagram */}
            <TouchableOpacity
              style={styles.socialButton}
              activeOpacity={0.8}
              onPress={() => handleSocialPress(SOCIAL_LINKS.instagram)}
            >
              <View style={[styles.socialIcon, styles.instagramIcon]}>
                <Ionicons name="logo-instagram" size={22} color="#ffffff" />
              </View>
            </TouchableOpacity>

            {/* X */}
            <TouchableOpacity
              style={styles.socialButton}
              activeOpacity={0.8}
              onPress={() => handleSocialPress(SOCIAL_LINKS.x)}
            >
              <View style={[styles.socialIcon, styles.xIcon]}>
                <Text
                  style={[
                    styles.socialIconText,
                    { color: "#fff", fontSize: 18, fontWeight: "800" },
                  ]}
                >
                  𝕏
                </Text>
              </View>
            </TouchableOpacity>
          </View>
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
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoIconWrapper: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  burst: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.85)",
    transform: [{ rotate: "15deg" }],
  },
  logoIcon: {
    fontSize: 22,
  },
  logoText: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
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
    minHeight: height * 0.65,
  },

  // ── Title ────────────────────────────────────────────
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111",
    textAlign: "center",
    marginBottom: 28,
    letterSpacing: 0.2,
  },

  // ── Inputs ───────────────────────────────────────────
  inputWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  input: {
    height: 56,
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: 50,
    paddingHorizontal: 22,
    fontSize: 15,
    color: "#111",
    backgroundColor: "#fff",
  },
  passwordInput: {
    paddingRight: 56,
  },
  eyeButton: {
    position: "absolute",
    right: 18,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 36,
  },
  eyeIcon: {
    fontSize: 18,
  },

  // ── Forgot ───────────────────────────────────────────
  forgotWrapper: {
    alignItems: "flex-end",
    marginBottom: 24,
    marginTop: 4,
  },
  forgotText: {
    fontSize: 14,
    color: "#555",
  },

  // ── Login Button ─────────────────────────────────────
  loginButton: {
    height: 56,
    backgroundColor: "#D32F2F",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: "#D32F2F",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // ── Divider ──────────────────────────────────────────
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dividerText: {
    fontSize: 14,
    color: "#888",
  },

  // ── Sign Up ──────────────────────────────────────────
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  signupText: {
    fontSize: 15,
    color: "#444",
  },
  signupLink: {
    fontSize: 15,
    color: "#D32F2F",
    fontWeight: "700",
  },

  // ── Social ───────────────────────────────────────────
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  socialButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: {
    width: 60,
    height: 60,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  socialIconText: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
  },
  facebookIcon: {
    backgroundColor: "#1877F2",
  },
  instagramIcon: {
    backgroundColor: "#E1306C",
  },
  xIcon: {
    backgroundColor: "#000",
  },
  followRow: {
    alignItems: "center",
    marginBottom: 16,
  },
  followText: {
    fontSize: 14,
    color: "#888",
  },
});
