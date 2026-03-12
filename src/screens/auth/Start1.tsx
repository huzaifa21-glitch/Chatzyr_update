import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Platform,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";

const DEFAULT_AVATAR =
  "https://e7.pngegg.com/pngimages/348/800/png-clipart-man-wearing-blue-shirt-illustration-computer-icons-avatar-user-login-avatar-blue-child.png";

export default function Start1({ navigation, route }: any) {
  const { username, email, password } = route.params;
  const [profileImage, setProfileImage] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = (image: { uri: string; type: string; name: string }) => {
    setUploading(true);
    const data = new FormData();
    data.append("file", { uri: image.uri, type: image.type, name: image.name } as any);
    data.append("upload_preset", "profilepics");
    data.append("cloud_name", "di01hbrje");

    fetch("https://api.cloudinary.com/v1_1/di01hbrje/image/upload", {
      method: "POST",
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.secure_url) {
          const secureUrl = data.secure_url.replace(/^http:/, "https:");
          setProfileImage(secureUrl);
        } else {
          Toast.show({ type: "error", text1: "Upload Failed", text2: "Could not upload image, try again." });
        }
      })
      .catch(() => {
        Toast.show({ type: "error", text1: "Connection Error", text2: "Cannot connect to server, try again later." });
      })
      .finally(() => setUploading(false));
  };

  const pickProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedAsset = result.assets[0];
      handleUpload({
        uri: selectedAsset.uri,
        type: `image/${selectedAsset.uri.split(".").pop()}`,
        name: `profile.${selectedAsset.uri.split(".").pop()}`,
      });
    }
  };

  const handleDone = () => {
    if (!profileImage) {
      Toast.show({ type: "error", text1: "No Image", text2: "Please select a profile picture" });
      return;
    }
    navigation.navigate("Start2", { profilePic: profileImage, email, password, username });
  };

  const handleSkip = () => {
    navigation.navigate("Start2", { profilePic: DEFAULT_AVATAR, email, password, username });
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
          <Text style={styles.title}>Profile Picture</Text>
          <Text style={styles.subtitle}>
            Upload a profile picture so your friends can recognize you.
          </Text>

          {/* Avatar Picker */}
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={pickProfileImage}
            activeOpacity={0.85}
          >
            <Image
              source={{ uri: profileImage || DEFAULT_AVATAR }}
              style={styles.avatar}
            />
            {/* Camera overlay */}
            <View style={styles.cameraOverlay}>
              {uploading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="camera" size={22} color="#fff" />
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.tapHint}>Tap to choose a photo</Text>

          {/* Upload Button */}
          <TouchableOpacity
            style={[styles.primaryButton, (!profileImage || uploading) && styles.buttonDisabled]}
            onPress={handleDone}
            activeOpacity={0.85}
            disabled={!profileImage || uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Continue</Text>
            )}
          </TouchableOpacity>

          {/* Skip Button */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
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
    marginBottom: 36,
    lineHeight: 20,
    paddingHorizontal: 10,
  },

  // ── Avatar ───────────────────────────────────────────
  avatarWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: "#D32F2F",
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "#D32F2F",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  tapHint: {
    fontSize: 13,
    color: "#aaa",
    marginBottom: 40,
  },

  // ── Buttons ──────────────────────────────────────────
  primaryButton: {
    height: 56,
    backgroundColor: "#D32F2F",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 14,
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
  skipButton: {
    height: 56,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: "#D32F2F",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  skipButtonText: {
    color: "#D32F2F",
    fontSize: 16,
    fontWeight: "600",
  },
});