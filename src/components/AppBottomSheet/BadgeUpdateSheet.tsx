import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import Toast from "react-native-toast-message";
import useAppStore from "../../../store/useAppStore";
import useAuthStore from "../../../store/useAuthStore";
import { SafeAreaView } from "react-native-safe-area-context";
export default function BadgeUpdateSheet({
  onSave,
}: {
  onSave?: (badgeUrl: string) => void;
}) {
  const badgesFree = useAppStore((state) => state.badgesFree) ?? [];
  const badgesVip = useAppStore((state) => state.badgesVip) ?? [];
  const user = useAuthStore((state) => state.user);

  const [selected, setSelected] = useState<string>(user?.badge || "");
  const [loading, setLoading] = useState(false);

  const isVipUser = user?.premium === "vip1" || user?.premium === "vip2"; // ← check if user is vip

  const handleSave = async () => {
    if (selected === user?.badge) return;
    setLoading(true);
    try {
      await onSave?.(selected);
      Toast.show({
        type: "success",
        text1: "Badge Updated!",
        text2: "Your badge is now live.",
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not update badge.",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderBadge = (url: string, index: number, locked: boolean = false) => {
    const isSelected = selected === url;
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.badgeItem,
          isSelected && styles.badgeItemSelected,
          locked && styles.badgeItemLocked,
        ]}
        onPress={() => !locked && setSelected(url)}
        activeOpacity={locked ? 1 : 0.7}
      >
        <Image
          source={{ uri: url }}
          style={styles.badgeImage}
          resizeMode="contain"
        />
        {locked && <Text style={styles.lockIcon}>🔒</Text>}
        {isSelected && <View style={styles.selectedDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Choose Your Badge</Text>
        <Text style={styles.subtitle}>
          Your badge appears next to your name in all chats
        </Text>

        {/* Preview */}
        <View style={styles.preview}>
          {selected ? (
            <Image
              source={{ uri: selected }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.previewPlaceholder}>
              <Text style={styles.previewPlaceholderText}>
                No badge selected
              </Text>
            </View>
          )}
          <Text style={styles.previewLabel}>Current Badge</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Free Badges */}
          <Text style={styles.sectionTitle}>🆓 Free Badges</Text>
          <View style={styles.grid}>
            {badgesFree.map((url: string, i: number) =>
              renderBadge(url, i, false),
            )}
          </View>

          {/* VIP Badges */}
          <Text style={styles.sectionTitle}>👑 VIP Badges</Text>
          <View style={styles.grid}>
            {badgesVip.map((url: string, i: number) =>
              renderBadge(url, i, !isVipUser),
            )}
          </View>
        </ScrollView>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveBtn,
            (selected === user?.badge || loading) && styles.saveBtnDisabled,
          ]}
          onPress={handleSave}
          disabled={selected === user?.badge || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Apply Badge</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginBottom: 14 },
  title: { fontSize: 20, fontWeight: "800", color: "#111", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#aaa", marginBottom: 16 },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#555",
    marginBottom: 10,
    marginTop: 8,
  },

  // ── Preview ──────────────────────────────────────────
  preview: {
    alignItems: "center",
    backgroundColor: "#fff5f5",
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#fdd",
  },
  previewImage: { width: 80, height: 80, marginBottom: 8 },
  previewPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  previewPlaceholderText: { fontSize: 11, color: "#bbb", textAlign: "center" },
  previewLabel: { fontSize: 14, fontWeight: "700", color: "#D32F2F" },

  // ── Grid ─────────────────────────────────────────────
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingBottom: 16,
  },
  badgeItem: {
    width: "22%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#f8f8f8",
    borderWidth: 1.5,
    borderColor: "transparent",
    position: "relative",
  },
  badgeItemSelected: { backgroundColor: "#fff5f5", borderColor: "#D32F2F" },
  badgeItemLocked: { opacity: 0.45 },
  badgeImage: { width: "70%", height: "70%" },
  lockIcon: { position: "absolute", top: 4, right: 4, fontSize: 10 },
  selectedDot: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D32F2F",
  },

  // ── Save ─────────────────────────────────────────────
  saveBtn: {
    height: 52,
    backgroundColor: "#D32F2F",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
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
