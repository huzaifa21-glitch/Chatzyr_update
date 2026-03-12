import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("window");
const DRAWER_WIDTH = width * 0.88;

// ─── VIP Plans ───────────────────────────────────────────────────────────────
const VIP_PLANS = [
  {
    id: "1",
    label: "1 Month",
    price: "$4.99",
    badge: null,
    description: "Try VIP for a month",
  },
  {
    id: "2",
    label: "3 Months",
    price: "$12.99",
    badge: "SAVE 13%",
    description: "Best for regular users",
  },
  {
    id: "3",
    label: "6 Months",
    price: "$22.99",
    badge: "SAVE 23%",
    description: "Most popular choice",
  },
  {
    id: "4",
    label: "1 Year",
    price: "$39.99",
    badge: "BEST VALUE",
    description: "Maximum savings",
  },
];

// ─── VIP Perks ───────────────────────────────────────────────────────────────
const VIP_PERKS = [
  { icon: "ribbon",           text: "Exclusive VIP badge" },
  { icon: "color-palette",    text: "Custom chat colors"  },
  { icon: "star",             text: "Priority in rooms"   },
  { icon: "sparkles",         text: "Special animations"  },
  { icon: "people",           text: "Unlimited friends"   },
  { icon: "chatbubbles",      text: "Ad-free experience"  },
];

// ─── Types ───────────────────────────────────────────────────────────────────
interface VIPDrawerProps {
  visible: boolean;
  onClose: () => void;
  user?: {
    name: string;
    avatar: string;
    isVip?: boolean;
  };
  onBuyVip?: (planId: string) => Promise<void>;
  onGiftVip?: (planId: string, username: string) => Promise<void>;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function VIPDrawer({
  visible,
  onClose,
  user = {
    name: "John Doe",
    avatar: "https://i.pravatar.cc/150?img=1",
    isVip: false,
  },
  onBuyVip,
  onGiftVip,
}: VIPDrawerProps) {
  const translateX    = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const backdropOp    = useRef(new Animated.Value(0)).current;
  const [tab, setTab] = useState<"buy" | "gift">("buy");
  const [selectedPlan, setSelectedPlan] = useState("2");
  const [giftUsername, setGiftUsername] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Animation ──────────────────────────────────────
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          damping: 22,
          stiffness: 180,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOp, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: DRAWER_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOp, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleBuy = async () => {
    setLoading(true);
    try {
      await onBuyVip?.(selectedPlan);
      Toast.show({ type: "success", text1: "VIP Activated! 👑", text2: "Welcome to the VIP club!" });
      onClose();
    } catch {
      Toast.show({ type: "error", text1: "Payment Failed", text2: "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleGift = async () => {
    if (!giftUsername.trim()) {
      Toast.show({ type: "error", text1: "Invalid Username", text2: "Please enter a username to gift." });
      return;
    }
    setLoading(true);
    try {
      await onGiftVip?.(selectedPlan, giftUsername.trim());
      Toast.show({ type: "success", text1: "Gift Sent! 🎁", text2: `VIP gifted to @${giftUsername}` });
      setGiftUsername("");
      onClose();
    } catch {
      Toast.show({ type: "error", text1: "Gift Failed", text2: "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanData = VIP_PLANS.find((p) => p.id === selectedPlan);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      // statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOp }]} />
        </TouchableWithoutFeedback>

        {/* Drawer — slides from right */}
        <Animated.View
          style={[styles.drawer, { transform: [{ translateX }] }]}
        >
          <SafeAreaView style={styles.drawerInner} edges={["top", "bottom"]}>

            {/* ── Header ───────────────────────────── */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color="#ffffff" />
              </TouchableOpacity>
              <View style={styles.headerDecor1} />
              <View style={styles.headerDecor2} />

              {/* Crown */}
              <View style={styles.crownWrapper}>
                <Text style={styles.crownEmoji}>👑</Text>
              </View>
              <Text style={styles.headerTitle}>ChatZyr VIP</Text>
              <Text style={styles.headerSubtitle}>
                Unlock exclusive features and stand out
              </Text>

              {/* User Row */}
              <View style={styles.userRow}>
                <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
                <View>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userStatus}>
                    {user.isVip ? "✅ Active VIP Member" : "⚪ Free Member"}
                  </Text>
                </View>
              </View>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* ── Perks ──────────────────────────── */}
              <View style={styles.perksGrid}>
                {VIP_PERKS.map((perk, i) => (
                  <View key={i} style={styles.perkItem}>
                    <Ionicons name={perk.icon as any} size={18} color="#D32F2F" />
                    <Text style={styles.perkText}>{perk.text}</Text>
                  </View>
                ))}
              </View>

              {/* ── Tabs ───────────────────────────── */}
              <View style={styles.tabRow}>
                <TouchableOpacity
                  style={[styles.tab, tab === "buy" && styles.tabActive]}
                  onPress={() => setTab("buy")}
                >
                  <Ionicons
                    name="card-outline"
                    size={16}
                    color={tab === "buy" ? "#fff" : "#888"}
                  />
                  <Text style={[styles.tabText, tab === "buy" && styles.tabTextActive]}>
                    Buy VIP
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, tab === "gift" && styles.tabActive]}
                  onPress={() => setTab("gift")}
                >
                  <Ionicons
                    name="gift-outline"
                    size={16}
                    color={tab === "gift" ? "#fff" : "#888"}
                  />
                  <Text style={[styles.tabText, tab === "gift" && styles.tabTextActive]}>
                    Gift VIP
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ── Plans ──────────────────────────── */}
              <View style={styles.plans}>
                {VIP_PLANS.map((plan) => {
                  const isSelected = selectedPlan === plan.id;
                  return (
                    <TouchableOpacity
                      key={plan.id}
                      style={[styles.planCard, isSelected && styles.planCardSelected]}
                      onPress={() => setSelectedPlan(plan.id)}
                      activeOpacity={0.8}
                    >
                      {/* Selected indicator */}
                      <View style={[styles.planRadio, isSelected && styles.planRadioSelected]}>
                        {isSelected && <View style={styles.planRadioDot} />}
                      </View>

                      <View style={styles.planInfo}>
                        <Text style={[styles.planLabel, isSelected && styles.planLabelSelected]}>
                          {plan.label}
                        </Text>
                        <Text style={styles.planDesc}>{plan.description}</Text>
                      </View>

                      <View style={styles.planRight}>
                        <Text style={[styles.planPrice, isSelected && styles.planPriceSelected]}>
                          {plan.price}
                        </Text>
                        {plan.badge && (
                          <View style={styles.planBadge}>
                            <Text style={styles.planBadgeText}>{plan.badge}</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* ── Gift Username Input ─────────────── */}
              {tab === "gift" && (
                <View style={styles.giftSection}>
                  <Text style={styles.giftLabel}>Gift to</Text>
                  <View style={styles.giftInput}>
                    <Text style={styles.atSign}>@</Text>
                    <TextInput
                      style={styles.giftTextInput}
                      placeholder="Enter username"
                      placeholderTextColor="#ccc"
                      value={giftUsername}
                      onChangeText={setGiftUsername}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>
              )}

              {/* ── CTA Button ─────────────────────── */}
              <TouchableOpacity
                style={[styles.ctaBtn, loading && styles.ctaBtnDisabled]}
                onPress={tab === "buy" ? handleBuy : handleGift}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.ctaBtnInner}>
                    <Ionicons
                      name={tab === "buy" ? "card" : "gift"}
                      size={18}
                      color="#fff"
                    />
                    <Text style={styles.ctaBtnText}>
                      {tab === "buy"
                        ? `Buy ${selectedPlanData?.label} — ${selectedPlanData?.price}`
                        : `Gift ${selectedPlanData?.label} — ${selectedPlanData?.price}`}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text style={styles.legalText}>
                Payments are securely processed. Cancel anytime.
              </Text>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  // ── Drawer ───────────────────────────────────────────
  drawer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: -6, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  drawerInner: {
    flex: 1,
  },

  // ── Header ───────────────────────────────────────────
  header: {
    backgroundColor: "#D32F2F",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    overflow: "hidden",
    position: "relative",
  },
  headerDecor1: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -60,
    right: -40,
  },
  headerDecor2: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: -20,
    left: 30,
  },
  closeBtn: {
    alignSelf: "flex-end",
    padding: 4,
    marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  crownWrapper: {
    alignSelf: "center",
    marginBottom: 8,
  },
  crownEmoji: {
    fontSize: 44,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    marginBottom: 20,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: 14,
    padding: 10,
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  userName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  userStatus: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    marginTop: 2,
  },

  // ── Scroll Content ───────────────────────────────────
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  // ── Perks ────────────────────────────────────────────
  perksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  perkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff5f5",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fdd",
  },
  perkText: {
    fontSize: 12,
    color: "#444",
    fontWeight: "500",
  },

  // ── Tabs ─────────────────────────────────────────────
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: "#D32F2F",
    shadowColor: "#D32F2F",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
  },
  tabTextActive: {
    color: "#fff",
  },

  // ── Plans ────────────────────────────────────────────
  plans: {
    gap: 8,
    marginBottom: 16,
  },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#eee",
    backgroundColor: "#fafafa",
    gap: 12,
  },
  planCardSelected: {
    borderColor: "#D32F2F",
    backgroundColor: "#fff5f5",
  },
  planRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  planRadioSelected: {
    borderColor: "#D32F2F",
  },
  planRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#D32F2F",
  },
  planInfo: {
    flex: 1,
  },
  planLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
  },
  planLabelSelected: {
    color: "#D32F2F",
  },
  planDesc: {
    fontSize: 11,
    color: "#aaa",
    marginTop: 2,
  },
  planRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#333",
  },
  planPriceSelected: {
    color: "#D32F2F",
  },
  planBadge: {
    backgroundColor: "#D32F2F",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  planBadgeText: {
    fontSize: 9,
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // ── Gift Input ───────────────────────────────────────
  giftSection: {
    marginBottom: 16,
  },
  giftLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#555",
    marginBottom: 8,
  },
  giftInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#eee",
    borderRadius: 50,
    height: 52,
    paddingHorizontal: 18,
    backgroundColor: "#fafafa",
    gap: 4,
  },
  atSign: {
    fontSize: 16,
    color: "#D32F2F",
    fontWeight: "700",
  },
  giftTextInput: {
    flex: 1,
    fontSize: 15,
    color: "#111",
  },

  // ── CTA ──────────────────────────────────────────────
  ctaBtn: {
    height: 54,
    backgroundColor: "#D32F2F",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#D32F2F",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaBtnDisabled: {
    backgroundColor: "#e08080",
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ctaBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  legalText: {
    fontSize: 11,
    color: "#ccc",
    textAlign: "center",
  },
});
