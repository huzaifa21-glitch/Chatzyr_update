import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import useAppStore from "../../../store/useAppStore"; // ← adjust path
import useAuthStore from "../../../store/useAuthStore"; // ← adjust path

export default function NameColorSheet({
  onSave,
}: {
  onSave?: (name: string, color: string) => void;
}) {
  const colors = useAppStore((state) => state.colors);
  const user = useAuthStore((state) => state.user);

  const isVip = user?.premium === "vip1" || user?.premium === "vip2";

  // All available colors based on vip status
  const allColors: string[] = [...(colors.vip1 || []), ...(colors.vip2 || [])];
  const uniqueColors = [...new Set(allColors)];

  const [name, setName] = useState(user?.username || "");
  const [color, setColor] = useState(user?.usernamecolor || "#D32F2F");
  const [loading, setLoading] = useState(false);

  const hasChanged = name !== user?.username || color !== user?.usernamecolor;

  const handleSave = async () => {
    if (!name.trim()) {
      Toast.show({
        type: "error",
        text1: "Invalid Name",
        text2: "Name cannot be empty",
      });
      return;
    }
    setLoading(true);
    try {
      await onSave?.(name.trim(), color);
      Toast.show({
        type: "success",
        text1: "Updated!",
        text2: "Your name and color are live.",
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not save changes, try again.",
      });
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
      <Text style={styles.title}>Name & Chat Color</Text>
      <Text style={styles.subtitle}>
        Changes appear in real time across all chats
      </Text>

      {/* Live Preview */}
      <View style={styles.preview}>
        <Text style={styles.previewLabel}>Preview</Text>
        <View style={styles.previewRow}>
          <View style={[styles.previewDot, { backgroundColor: color }]} />
          <Text style={[styles.previewName, { color }]}>
            {name || "Your Name"}
          </Text>
          <Text style={styles.previewMsg}> Hey everyone! 👋</Text>
        </View>
      </View>

      {/* Name Input */}
      <Text style={styles.fieldLabel}>Display Name</Text>
      <View style={styles.inputWrapper}>
        <Ionicons
          name="person-outline"
          size={18}
          color="#999"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your display name"
          placeholderTextColor="#ccc"
          maxLength={30}
          autoCorrect={false}
        />
        <Text style={styles.charCount}>{name.length}/30</Text>
      </View>

      {/* Color Picker */}
      <Text style={styles.fieldLabel}>Chat Color</Text>

      {!isVip && (
        <View style={styles.lockedBanner}>
          <Ionicons name="lock-closed" size={14} color="#D32F2F" />
          <Text style={styles.lockedText}>
            Upgrade to VIP to unlock chat colors
          </Text>
        </View>
      )}

      <View style={styles.colorGrid}>
        {uniqueColors.map((hex: string, index: number) => {
          const isSelected = color === hex;
          const isLocked = !isVip; // ← locked for non-vip but still visible

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.colorItem,
                { backgroundColor: hex },
                isSelected && styles.colorItemSelected,
                isLocked && styles.colorItemDimmed, // ← slightly dimmed but visible
              ]}
              onPress={() => !isLocked && setColor(hex)} // ← can't select if locked
              activeOpacity={isLocked ? 1 : 0.8} // ← no press feedback if locked
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

        {/* Show locked placeholder swatches for non-vip */}
        {!isVip &&
          [...Array(12)].map((_, i) => (
            <View key={`locked-${i}`} style={styles.colorItemLocked}>
              <Ionicons name="lock-closed" size={12} color="#ccc" />
            </View>
          ))}
      </View>

      {/* Save Button */}
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
  container: { paddingBottom: 24 },
  title: { fontSize: 20, fontWeight: "800", color: "#111", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#aaa", marginBottom: 16 },

  // ── Preview ──────────────────────────────────────────
  preview: {
    backgroundColor: "#f8f8f8",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  colorItemDimmed: {
  opacity: 0.45,
},
  previewLabel: {
    fontSize: 10,
    color: "#bbb",
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  previewRow: { flexDirection: "row", alignItems: "center" },
  previewDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  previewName: { fontSize: 14, fontWeight: "700" },
  previewMsg: { fontSize: 14, color: "#555" },

  // ── Field Label ──────────────────────────────────────
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#555",
    marginBottom: 8,
    letterSpacing: 0.3,
  },

  // ── Input ────────────────────────────────────────────
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
  inputIcon: { marginRight: 2 },
  input: { flex: 1, fontSize: 15, color: "#111", height: "100%" },
  charCount: { fontSize: 11, color: "#ccc" },

  // ── Locked Banner ────────────────────────────────────
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

  // ── Color Grid ───────────────────────────────────────
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
  colorItemLocked: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    opacity: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },

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
