import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const PHOTO_SIZE = (width - 48) / 3;

// ─── Dummy Data ──────────────────────────────────────────────────────────────
const USER = {
  name: "Sofia",
  verified: true,
  bio: "I'm a positive person. I love to travel and eat. Always available for chat.",
  avatar: "https://i.pravatar.cc/300?img=47",
  friends: 120,
  likes: 345,
  badgeEmoji: "🔥",
  aboutMe:
    "Neque earum quo ea est porro asperiores reprehenderit sint. Dolore doloremque vitae ipsum officia accusamus aspernatur rerum. Voluptas quas distinctio blanditiis. Consectetur dolor vero ut. Fugiat voluptate non et consequuntur placeat voluptas voluptatem aliquid id. Saepe fugit repellendus sit eos porro voluptas voluptate cupiditate in.",
  photos: [
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&q=80",
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&q=80",
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&q=80",
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&q=80",
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&q=80",
  ],
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function UserProfileScreen({ navigation }: any) {
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Back Button — scrolls with content */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#555" />
        </TouchableOpacity>

        {/* ── Avatar ───────────────────────────────── */}
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: USER.avatar }} style={styles.avatar} />
        </View>

        {/* ── Name + Verified ──────────────────────── */}
        <View style={styles.nameRow}>
          <Text style={styles.name}>{USER.name}</Text>
          {USER.verified && (
            <Ionicons name="checkmark-circle" size={22} color="#4A90E2" style={{ marginLeft: 6 }} />
          )}
        </View>

        {/* ── Bio ──────────────────────────────────── */}
        <Text style={styles.bio}>{USER.bio}</Text>

        {/* ── Stats ────────────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Friends</Text>
            <Text style={styles.statValue}>{USER.friends}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Likes</Text>
            <Text style={styles.statValue}>{USER.likes}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Badge</Text>
            <Text style={styles.badgeEmoji}>{USER.badgeEmoji}</Text>
          </View>
        </View>

        {/* ── About Me ─────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.aboutText}>{USER.aboutMe}</Text>
        </View>

        {/* ── Action Buttons ───────────────────────── */}
        <View style={styles.actionsRow}>
          {/* Message */}
          <TouchableOpacity
            style={styles.msgBtn}
            activeOpacity={0.85}
            onPress={() => navigation?.navigate("Chat")}
          >
            <Text style={styles.msgBtnText}>Message</Text>
          </TouchableOpacity>

          {/* Like */}
          <TouchableOpacity
            style={[styles.iconActionBtn, liked && styles.iconActionBtnActive]}
            activeOpacity={0.8}
            onPress={() => setLiked(!liked)}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={22}
              color={liked ? "#D32F2F" : "#222"}
            />
          </TouchableOpacity>

          {/* Follow */}
          <TouchableOpacity
            style={[styles.iconActionBtn, following && styles.iconActionBtnActive]}
            activeOpacity={0.8}
            onPress={() => setFollowing(!following)}
          >
            <Ionicons
              name={following ? "people" : "people-outline"}
              size={22}
              color={following ? "#D32F2F" : "#222"}
            />
          </TouchableOpacity>
        </View>

        {/* ── Photos ───────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.photosHeader}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAll}>see all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.photosGrid}>
            {Array.from({ length: Math.ceil(USER.photos.length / 3) }, (_, rowIndex) => (
              <View key={rowIndex} style={styles.photosRow}>
                {USER.photos.slice(rowIndex * 3, rowIndex * 3 + 3).map((uri, colIndex) => (
                  <TouchableOpacity
                    key={colIndex}
                    activeOpacity={0.85}
                    style={styles.photoWrapper}
                  >
                    <Image source={{ uri }} style={styles.photo} />
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingBottom: 40,
    alignItems: "center",
  },

  // ── Back ─────────────────────────────────────────────
  backBtn: {
    alignSelf: "flex-start",
    marginLeft: 16,
    marginTop: 8,
    marginBottom: -20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Avatar ───────────────────────────────────────────
  avatarWrapper: {
    marginTop: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: "#fff",
  },

  // ── Name ─────────────────────────────────────────────
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  name: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111",
    letterSpacing: 0.2,
  },

  // ── Bio ──────────────────────────────────────────────
  bio: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    lineHeight: 21,
    paddingHorizontal: 32,
    marginBottom: 24,
  },

  // ── Stats ────────────────────────────────────────────
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    gap: 0,
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 28,
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#eee",
  },
  statLabel: {
    fontSize: 13,
    color: "#aaa",
    fontWeight: "500",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
  },
  badgeEmoji: {
    fontSize: 28,
    lineHeight: 32,
  },

  // ── Section ──────────────────────────────────────────
  section: {
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
  },

  // ── Actions ──────────────────────────────────────────
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 28,
    width: "100%",
  },
  msgBtn: {
    flex: 1,
    height: 52,
    backgroundColor: "#111",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  msgBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  iconActionBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  iconActionBtnActive: {
    borderColor: "#D32F2F",
    backgroundColor: "#fff5f5",
  },

  // ── Photos ───────────────────────────────────────────
  photosHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    color: "#aaa",
    fontWeight: "500",
  },
  photosGrid: {
    flexDirection: "column",
    gap: 4,
  },
  photosRow: {
    flexDirection: "row",
    gap: 4,
  },
  photoWrapper: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    aspectRatio: 1,
  },
});