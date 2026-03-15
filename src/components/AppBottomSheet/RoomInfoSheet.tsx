import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
interface RoomInfoSheetProps {
  room?: {
    name: string;
    bio: string;
    badgeurl: string;
    onlineCount: number;
    maxMembers: number;
    likes: number;
    roomOwner: string;
  };
  onClose?: () => void;
}



export default function RoomInfoSheet({ room, onClose }: RoomInfoSheetProps) {
  if (!room) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Room info unavailable</Text>
        </View>
      </SafeAreaView>
    );
  }

  const fillPercent = Math.round((room.onlineCount / 100) * 100);

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>

      {/* Room Image */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: room.badgeurl }} style={styles.roomImage} />
        <View style={styles.imageOverlay} />
        <Text style={styles.roomNameOverlay}>{room.name}</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="people" size={18} color="#D32F2F" />
          <Text style={styles.statValue}>{room.onlineCount}/{100}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="heart" size={18} color="#D32F2F" />
          <Text style={styles.statValue}>{room.likes}</Text>
          <Text style={styles.statLabel}>Likes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{fillPercent}%</Text>
          <Text style={styles.statLabel}>Full</Text>
        </View>
      </View>

      {/* Capacity bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${fillPercent}%` }]} />
      </View>

      {/* Description */}
      <Text style={styles.sectionTitle}>About</Text>
      <Text style={styles.description}>{room.bio}</Text>

      {/* Owner */}
      <Text style={styles.sectionTitle}>Owner</Text>
      <View style={styles.ownerRow}>
        {/* <View style={styles.ownerAvatarWrapper}>
          <Image source={{ uri: room.ownerAvatar }} style={styles.ownerAvatar} />
          <Text style={styles.ownerBadge}>{room.ownerBadge}</Text>
        </View> */}
        <Text style={styles.ownerName}>{room.roomOwner}</Text>
        <View style={styles.ownerPill}>
          <Text style={styles.ownerPillText}>Owner</Text>
        </View>
      </View>

    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: "#555",
  },

  // ── Image ────────────────────────────────────────────
  imageWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    height: 200,
    position: "relative",
  },
  roomImage: {
    width: "100%",
    height: "100%",
    // resizeMode: "cover",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  roomNameOverlay: {
    position: "absolute",
    bottom: 12,
    left: 14,
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  // ── Stats ────────────────────────────────────────────
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 12,
  },
  statItem: {
    alignItems: "center",
    gap: 3,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
  },
  statLabel: {
    fontSize: 11,
    color: "#aaa",
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#eee",
  },

  // ── Progress ─────────────────────────────────────────
  progressBg: {
    height: 5,
    backgroundColor: "#f0e0e0",
    borderRadius: 4,
    marginBottom: 20,
  },
  progressFill: {
    height: 5,
    backgroundColor: "#D32F2F",
    borderRadius: 4,
  },

  // ── Text ─────────────────────────────────────────────
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#aaa",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#444",
    lineHeight: 22,
    marginBottom: 20,
  },

  // ── Owner ────────────────────────────────────────────
  ownerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  ownerAvatarWrapper: {
    position: "relative",
  },
  ownerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: "#D32F2F",
  },
  ownerBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    fontSize: 14,
  },
  ownerName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },
  ownerPill: {
    backgroundColor: "#fff0f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D32F2F",
  },
  ownerPillText: {
    fontSize: 11,
    color: "#D32F2F",
    fontWeight: "700",
  },
});
