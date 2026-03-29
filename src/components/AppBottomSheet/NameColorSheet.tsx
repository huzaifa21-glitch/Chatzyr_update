import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import useAppStore from "../../../store/useAppStore";
import useAuthStore from "../../../store/useAuthStore";
import useChatStore from "../../../store/useChatStore";
import { ipv4 } from "../../utils/config";
const FREE_COLORS = [
  "#000000", // Black
  // "#D32F2F", // Red
  // "#333333", // Dark Grey
  // "#1565C0", // Blue
  // "#2E7D32", // Green
  // "#6A1B9A", // Purple
];
export default function NameColorSheet({ onClose }: { onClose?: () => void }) {
  const colors = useAppStore((state) => state.colors);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const saveAuth = useAuthStore((state) => state.saveAuth);
  const socket = useChatStore((state) => state.socket);

  const isVip = user?.premium === "vip1" || user?.premium === "vip2";
  const allColors: string[] = [...(colors.vip1 || []), ...(colors.vip2 || [])];
  const uniqueColors = [...new Set(allColors)];

  const vipColors: string[] = [...(colors.vip1 || []), ...(colors.vip2 || [])];
  const uniqueVipColors = [...new Set(vipColors)];
  const displayColors = isVip ? uniqueVipColors : FREE_COLORS;
  const [username, setUsername] = useState(user?.username || "");
  const [usernamecolor, setUsernamecolor] = useState(
    user?.usernamecolor || "#D32F2F",
  );
  const [chatcolor, setChatcolor] = useState(user?.chatcolor || "#333333");
  const [pic, setPic] = useState(user?.pic || "");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeColorPicker, setActiveColorPicker] = useState<
    "username" | "chat"
  >("username");

  const hasChanged =
    username !== user?.username ||
    usernamecolor !== user?.usernamecolor ||
    chatcolor !== user?.chatcolor ||
    pic !== user?.pic;

  // ── Pick + upload image ──────────────────────────
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Toast.show({ type: "error", text1: "Permission needed" });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    setUploading(true);
    try {
      const uri = result.assets[0].uri;
      const formData = new FormData();
      formData.append("file", {
        uri,
        type: "image/jpeg",
        name: "profile.jpg",
      } as any);
      formData.append("upload_preset", "profilepics");
      formData.append("cloud_name", "di01hbrje");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/di01hbrje/image/upload",
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await res.json();
      if (data.secure_url) {
        setPic(data.secure_url);
      } else {
        Toast.show({ type: "error", text1: "Upload failed" });
      }
    } catch {
      Toast.show({ type: "error", text1: "Upload error" });
    } finally {
      setUploading(false);
    }
  };

  // ── Save ─────────────────────────────────────────
  const handleSave = async () => {
    if (!username.trim()) {
      Toast.show({ type: "error", text1: "Username cannot be empty" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${ipv4}user/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          email: user?.email,
          username: username.trim(),
          usernamecolor,
          chatcolor,
          pic,
        }),
      });

      const data = await res.json();

      if (data.success) {
        await saveAuth(token, data.user); // ← update local user
        socket?.emit("user_updated", { email: user?.email }); // ← broadcast live
        Toast.show({ type: "success", text1: "Profile updated!" });
        onClose?.();
      } else {
        Toast.show({ type: "error", text1: data.message || "Update failed" });
      }
    } catch {
      Toast.show({ type: "error", text1: "Could not save changes" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Edit Profile</Text>
        <Text style={styles.subtitle}>
          Changes appear live across all chats
        </Text>
        {/* ── Profile Picture ───────────────────── */}
        <TouchableOpacity
          style={styles.picWrapper}
          onPress={pickImage}
          disabled={uploading}
        >
          <Image
            source={{
              uri:
                pic ||
                "https://cdn-icons-png.flaticon.com/512/3177/3177440.png",
            }}
            style={styles.pic}
          />
          <View style={styles.picOverlay}>
            {uploading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="camera" size={20} color="#fff" />
            )}
          </View>
        </TouchableOpacity>
        {/* ── Live Preview ──────────────────────── */}
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>Preview</Text>
          <View style={styles.previewRow}>
            <Image
              source={{
                uri:
                  pic ||
                  "https://cdn-icons-png.flaticon.com/512/3177/3177440.png",
              }}
              style={styles.previewAvatar}
            />
            <View>
              <Text style={[styles.previewName, { color: usernamecolor }]}>
                {username || "Your Name"}
              </Text>
              <Text style={[styles.previewMsg, { color: chatcolor }]}>
                Hey everyone! 👋
              </Text>
            </View>
          </View>
        </View>
        {/* ── Username ──────────────────────────── */}
        <Text style={styles.fieldLabel}>Display Name</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={18} color="#999" />
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Your display name"
            placeholderTextColor="#ccc"
            maxLength={30}
            autoCorrect={false}
          />
          <Text style={styles.charCount}>{username.length}/30</Text>
        </View>
        {/* ── Color picker toggle ───────────────── */}
        <View style={styles.colorToggleRow}>
          <TouchableOpacity
            style={[
              styles.colorToggleBtn,
              activeColorPicker === "username" && styles.colorToggleActive,
            ]}
            onPress={() => setActiveColorPicker("username")}
          >
            <Text
              style={[
                styles.colorToggleText,
                activeColorPicker === "username" &&
                  styles.colorToggleTextActive,
              ]}
            >
              Username Color
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.colorToggleBtn,
              activeColorPicker === "chat" && styles.colorToggleActive,
            ]}
            onPress={() => setActiveColorPicker("chat")}
          >
            <Text
              style={[
                styles.colorToggleText,
                activeColorPicker === "chat" && styles.colorToggleTextActive,
              ]}
            >
              Chat Color
            </Text>
          </TouchableOpacity>
        </View>
        {/* ── Selected color preview ────────────── */}
        <View style={styles.selectedColorRow}>
          <View
            style={[
              styles.selectedColorDot,
              {
                backgroundColor:
                  activeColorPicker === "username" ? usernamecolor : chatcolor,
              },
            ]}
          />
          <Text style={styles.selectedColorText}>
            {activeColorPicker === "username" ? usernamecolor : chatcolor}
          </Text>
        </View>
        {/* ── Color grid ───────────────────────── */}
        {/* // ← UPDATE the color grid — use displayColors, remove locked logic: */}
        <View style={styles.colorGrid}>
          {displayColors.map((hex: string, index: number) => {
            const isSelected =
              activeColorPicker === "username"
                ? usernamecolor === hex
                : chatcolor === hex;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.colorItem,
                  { backgroundColor: hex },
                  isSelected && styles.colorItemSelected,
                ]}
                onPress={() => {
                  if (activeColorPicker === "username") setUsernamecolor(hex);
                  else setChatcolor(hex);
                }}
                activeOpacity={0.8}
              >
                {isSelected && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            );
          })}

          {/* ← Show VIP upgrade hint for free users */}
          {!isVip && (
            <TouchableOpacity style={styles.upgradeHint} activeOpacity={0.8}>
              <Ionicons name="lock-closed" size={12} color="#E6A817" />
              <Text style={styles.upgradeText}>VIP colors</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.colorGrid}>
          {uniqueColors.map((hex: string, index: number) => {
            const isLocked = !isVip;
            const isSelected =
              activeColorPicker === "username"
                ? usernamecolor === hex
                : chatcolor === hex;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.colorItem,
                  { backgroundColor: hex },
                  isSelected && styles.colorItemSelected,
                  isLocked && styles.colorItemDimmed,
                ]}
                onPress={() => {
                  if (isLocked) return;
                  if (activeColorPicker === "username") setUsernamecolor(hex);
                  else setChatcolor(hex);
                }}
                activeOpacity={isLocked ? 1 : 0.8}
              >
                {isSelected && !isLocked && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
                {isLocked && (
                  <Ionicons
                    name="lock-closed"
                    size={12}
                    color="rgba(255,255,255,0.7)"
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        {/* ── Save ─────────────────────────────── */}
        <TouchableOpacity
          style={[
            styles.saveBtn,
            (!hasChanged || loading) && styles.saveBtnDisabled,
          ]}
          onPress={handleSave}
          disabled={!hasChanged || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 32 },
  title: { fontSize: 20, fontWeight: "800", color: "#111", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#aaa", marginBottom: 20 },

  // ── Profile pic ──────────────────────────────────────
  picWrapper: {
    alignSelf: "center",
    marginBottom: 20,
    position: "relative",
  },
  pic: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "#eee",
  },
  picOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#D32F2F",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
upgradeHint: {
  paddingHorizontal: 10,
  height: 40,
  borderRadius: 20,
  backgroundColor: '#FFF3CD',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  gap: 4,
  borderWidth: 1,
  borderColor: '#E6A817',
  // marginTop: 10,
},
upgradeText: {
  fontSize: 10,
  fontWeight: '800',
  color: '#E6A817',
},
  // ── Preview ──────────────────────────────────────────
  preview: {
    backgroundColor: "#f8f8f8",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 10,
    color: "#bbb",
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  previewRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  previewAvatar: { width: 36, height: 36, borderRadius: 18 },
  previewName: { fontSize: 13, fontWeight: "800" },
  previewMsg: { fontSize: 13, marginTop: 2 },

  // ── Input ────────────────────────────────────────────
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#555",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#eee",
    borderRadius: 50,
    height: 52,
    paddingHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "#fafafa",
    gap: 10,
  },
  input: { flex: 1, fontSize: 15, color: "#111", height: "100%" },
  charCount: { fontSize: 11, color: "#ccc" },

  // ── Color toggle ─────────────────────────────────────
  colorToggleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  colorToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: "#eee",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  colorToggleActive: {
    backgroundColor: "#D32F2F",
    borderColor: "#D32F2F",
  },
  colorToggleText: { fontSize: 13, fontWeight: "700", color: "#888" },
  colorToggleTextActive: { color: "#fff" },

  // ── Selected color ───────────────────────────────────
  selectedColorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  selectedColorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  selectedColorText: { fontSize: 12, color: "#888", fontWeight: "600" },

  // ── Locked banner ────────────────────────────────────
  lockedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff5f5",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#fdd",
  },
  lockedText: { fontSize: 12, color: "#D32F2F", fontWeight: "600" },

  // ── Color grid ───────────────────────────────────────
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  colorItemSelected: {
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  colorItemDimmed: { opacity: 0.45 },

  // ── Save ─────────────────────────────────────────────
  saveBtn: {
    height: 52,
    backgroundColor: "#D32F2F",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#D32F2F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  saveBtnDisabled: {
    backgroundColor: "#e08080",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});
