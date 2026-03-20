import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import useAuthStore from "../../../store/useAuthStore";
import { ipv4 } from "../../utils/config";
import { calcHeight } from "../../utils";

const { width } = Dimensions.get("window");

const DUMMY_PHOTOS = [
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&q=80",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=80",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&q=80",
  "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&q=80",
];

export default function UserProfileScreen({ navigation, route }: any) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const token = useAuthStore((state) => state.token);
  const currentUser = useAuthStore((state) => state.user);
  const userEmail = route?.params?.userEmail || "";
  // console.log(userEmail);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userEmail) return;
      setLoading(true);
      try {
        const res = await fetch(
          `${ipv4}users/${encodeURIComponent(userEmail)}/profile`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
          },
        );
        const data = await res.json();
        // console.log(data);

        setUser(data);
        setLiked(data.likedBy?.includes(currentUser?.email));
        setFollowing(
          data.friends?.some((f: any) => f.email === currentUser?.email),
        );

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userEmail]);

  // ── Skeleton Loader ──────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="chevron-back" size={22} color="#555" />
        </TouchableOpacity>
        <View style={styles.loaderContainer}>
          <View style={styles.skeletonAvatar} />
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, { width: "40%", marginTop: 8 }]} />
          <View style={styles.skeletonStats}>
            <View style={styles.skeletonStat} />
            <View style={styles.skeletonStat} />
          </View>
          <ActivityIndicator
            size="small"
            color="#D32F2F"
            style={{ marginTop: 24 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="chevron-back" size={22} color="#555" />
        </TouchableOpacity>
        <View style={styles.loaderContainer}>
          <Ionicons name="person-outline" size={48} color="#ddd" />
          <Text style={styles.errorText}>User not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#555" />
        </TouchableOpacity>

        {/* ── Cover / Background ───────────────────── */}
        {/* <View style={styles.coverWrapper}>
          <Image
            source={{ uri: user.BackImage || user.backgroundPic }}
            style={styles.coverImage}
          />
          <View style={styles.coverOverlay} />
        </View> */}

        {/* ── Avatar ───────────────────────────────── */}
        <View style={styles.avatarWrapper}>
          {(user.premium === "vip1" ||
            user.premium === "vip2" ||
            user.premium === "vip3") && <View style={styles.vipRing} />}
          <Image
            source={{
              uri:
                user.pic ||
                "https://cdn-icons-png.flaticon.com/512/3177/3177440.png",
            }}
            style={styles.avatar}
          />
        </View>

        {/* ── Name + VIP ───────────────────────────── */}
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: user.usernamecolor || "#111" }]}>
            {user.username}
          </Text>
          {(user.premium === "vip1" ||
            user.premium === "vip2" ||
            user.premium === "vip3") && (
              <View style={styles.vip}>
            <View style={styles.vipPill}>
              <Text style={styles.vipText}>✦ VIP</Text>
            </View>
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/9195/9195920.png",
                }}
                style={{ width: 16, height: 16, marginLeft: 4 }}
              />
              </View>
          )}
          
          
        </View>

        {/* ── Status ───────────────────────────────── */}
        {user.status && (
          <Text style={[styles.status, { color: user.statuscolor || "#aaa" }]}>
            {user.status}
          </Text>
        )}

        {/* ── Stats — Badge | Likes ─────────────────── */}
        <View style={styles.statsRow}>
          {/* Likes */}
          <View style={styles.statItem}>
            <Ionicons name="heart" size={20} color="#D32F2F" />
            <Text style={styles.statValue}>{user.likes || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>

          {/* Badge — center ─────────────────────────── */}
          <View style={styles.statDivider} />
          <View style={styles.badgeCenter}>
            {user.badge ? (
              <Image
                source={{ uri: user.badge }}
                style={styles.badgeLarge}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.badgePlaceholder}>
                <Ionicons name="ribbon-outline" size={28} color="#ddd" />
              </View>
            )}
            <Text style={styles.statLabel}>Badge</Text>
          </View>
          {/* <View style={styles.statDivider} /> */}

          {/* Friends */}
          {/* <View style={styles.statItem}>
            <Ionicons name="people" size={20} color="#1565C0" />
            <Text style={styles.statValue}>{user.friends?.length || 0}</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </View> */}
        </View>

        {/* ── Bio ──────────────────────────────────── */}
        {user.bio && (
          <View style={styles.bioWrapper}>
            <Text style={[styles.bio, { color: user.biocolor || "#555" }]}>
              {user.bio}
            </Text>
          </View>
        )}

        {/* ── Action Buttons ───────────────────────── */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.msgBtn}
            activeOpacity={0.85}
            onPress={() => navigation?.navigate("Chat", { userEmail })}
          >
            <Ionicons
              name="chatbubble-outline"
              size={18}
              color="#fff"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.msgBtnText}>Message</Text>
          </TouchableOpacity>

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

          <TouchableOpacity
            style={[
              styles.iconActionBtn,
              following && styles.iconActionBtnActive,
            ]}
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
            {Array.from(
              { length: Math.ceil(DUMMY_PHOTOS.length / 3) },
              (_, rowIndex) => (
                <View key={rowIndex} style={styles.photosRow}>
                  {DUMMY_PHOTOS.slice(rowIndex * 3, rowIndex * 3 + 3).map(
                    (uri, colIndex) => (
                      <TouchableOpacity
                        key={colIndex}
                        activeOpacity={0.85}
                        style={styles.photoWrapper}
                      >
                        <Image source={{ uri }} style={styles.photo} />
                      </TouchableOpacity>
                    ),
                  )}
                </View>
              ),
            )}
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { paddingBottom: 40, alignItems: "center" },

  // ── Loader ───────────────────────────────────────────
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  skeletonAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#f0f0f0",
    marginBottom: 16,
  },
  skeletonLine: {
    width: "65%",
    height: 16,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  skeletonStats: { flexDirection: "row", gap: 20, marginTop: 24 },
  skeletonStat: {
    width: 70,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  errorText: { fontSize: 15, color: "#bbb", marginTop: 12 },

  // ── Back ─────────────────────────────────────────────
  backBtn: {
    alignSelf: "flex-start",
    marginLeft: 16,
    marginTop: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  // ── Cover ────────────────────────────────────────────
  coverWrapper: {
    width: "100%",
    height: 160,
    marginTop: -44, // ← pull up behind back button
  },
  coverImage: { width: "100%", height: "100%" },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  // ── Avatar ───────────────────────────────────────────
  avatarWrapper: {
    marginTop: -25,
    marginBottom: 12,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 8,
  },
  vipRing: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 62,
    borderWidth: 3,
    borderColor: "#E6A817",
    zIndex: 1,
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
    marginBottom: 4,
    gap: 8,
  },
  name: { fontSize: 24, fontWeight: "800", letterSpacing: 0.2 },
  vipPill: {
    backgroundColor: "#FFF3CD",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  vip:{
    flexDirection: "row",

  },
  vipText: { fontSize: 10, fontWeight: "800", color: "#E6A817" },

  // ── Status ───────────────────────────────────────────
  status: {
    fontSize: 13,
    fontStyle: "italic",
    marginBottom: 16,
    textAlign: "center",
    paddingHorizontal: 32,
    letterSpacing: 0.3,
  },

  // ── Stats ────────────────────────────────────────────
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginHorizontal: 20,
    // shadowColor: '#000', shadowOpacity: 0.05,
    // shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
  },
  statItem: { alignItems: "center", paddingHorizontal: 20, gap: 4 },
  statDivider: { width: 1, height: 44, backgroundColor: "#eee" },
  statLabel: { fontSize: 11, color: "#aaa", fontWeight: "600", marginTop: 2 },
  statValue: { fontSize: 18, fontWeight: "800", color: "#111" },

  // ── Badge center ─────────────────────────────────────
  badgeCenter: { alignItems: "center", paddingHorizontal: 20, gap: 4 },
  badgeLarge: { width: 44, height: 44 },
  badgePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Bio ──────────────────────────────────────────────
  bioWrapper: {
    width: "100%",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  bio: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    fontStyle: "italic",
    letterSpacing: 0.2,
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
    backgroundColor: "#D32F2F",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#D32F2F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  msgBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
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
  iconActionBtnActive: { borderColor: "#D32F2F", backgroundColor: "#fff5f5" },

  // ── Photos ───────────────────────────────────────────
  section: { width: "100%", paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
    marginBottom: 10,
  },
  photosHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  seeAll: { fontSize: 14, color: "#aaa", fontWeight: "500" },
  photosGrid: { flexDirection: "column", gap: 4 },
  photosRow: { flexDirection: "row", gap: 4 },
  photoWrapper: { flex: 1, borderRadius: 10, overflow: "hidden" },
  photo: { width: "100%", aspectRatio: 1 },
});
