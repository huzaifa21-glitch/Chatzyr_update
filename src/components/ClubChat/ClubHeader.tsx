import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import VIPDrawer from "./VIPDrawer";
import { ipv4 } from "../../utils/config";
import axios from "axios";
import useAuthStore from '../../../store/useAuthStore';
// ─── Types ───────────────────────────────────────────────────────────────────
interface ClubHeaderProps {
  clubName?: string;
  members?: number;
  maxMembers?: number;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  onInboxPress?: () => void;
  onEditClub?: () => void;
  onChatColor?: () => void;
  onBadges?: () => void;
  onBlockList?: () => void;
  onHomePress?: () => void;
  onMembers?: () => void;
  navigation?: any; // ← for navigating to BlockList, etc.
  mod: boolean; // ← is current user a mod? Show extra options if true
}

// ─── Menu Items ──────────────────────────────────────────────────────────────
const MENU_ITEMS = [
  { key: "edit", label: "Club Info", icon: "information-circle-outline" },
  { key: "color", label: "Profile", icon: "person-outline" },
  { key: "badges", label: "Badges", icon: "ribbon-outline" },
  { key: "blocklist", label: "Block List", icon: "ban-outline" },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function ClubHeader({
  clubName = "General Chat Room",
  members = 9,
  maxMembers = 100,
  onMenuPress,
  onNotificationPress,
  onInboxPress,
  onEditClub,
  onChatColor,
  onBadges,
  onBlockList,
  onHomePress,
  onMembers,
  navigation,
  mod,
}: ClubHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const [vipDrawerOpen, setVipDrawerOpen] = useState(false);
    const user = useAuthStore((state) => state.user)
  const openMenu = () => {
    setMenuOpen(true);
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 130,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 130,
        useNativeDriver: true,
      }),
    ]).start(() => setMenuOpen(false));
  };

  const handleItemPress = (key: string) => {
    closeMenu();
    switch (key) {
      case "edit":
        onEditClub?.();
        break;
      case "color":
        onChatColor?.();
        break;
      case "badges":
        onBadges?.();
        break;
      case "blocklist":
        onBlockList?.();
        break;
    }
  };

  return (
    <View>
      <View style={styles.header}>
        <VIPDrawer
          visible={vipDrawerOpen}
          onClose={() => setVipDrawerOpen(!vipDrawerOpen)}
          user={{ name: user.username, avatar: user.pic, isVip: true }}
          onBuyVip={async (planId) => {
            await axios.post(`${ipv4}buyvip`, { planId });
          }}
          onGiftVip={async (planId, username) => {
            await axios.post(`${ipv4}giftvip`, { planId, username });
          }}
        />

        <View style={styles.left}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setVipDrawerOpen(true)}>
            <Ionicons name="menu" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.clubInfo}>
              <TouchableOpacity
              style={styles.onlineRow}
              onPress={() => {
                if (onHomePress) {
                  onHomePress();
                } else {
                  navigation?.navigate("Home");
                }
              }}
            >
            <Text style={styles.clubName} numberOfLines={1}>
              {clubName}
            </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.onlineRow}
              onPress={() => {
                if (onMembers) {
                  onMembers();
                } else {
                  navigation?.navigate("Members");
                }
              }}
            >
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>
                {members}/{maxMembers} online
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Right — Notification, Inbox, More */}
        <View style={styles.right}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onNotificationPress}
          >
            <Ionicons name="notifications-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={onInboxPress}>
            <Ionicons name="chatbubble-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, menuOpen && styles.iconBtnActive]}
            onPress={menuOpen ? closeMenu : openMenu}
          >
            <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown Menu */}
      {menuOpen && (
        <>
          {/* Backdrop — tap outside to close */}
          <TouchableWithoutFeedback onPress={closeMenu}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          {/* Menu Card */}
          <Animated.View
            style={[
              styles.menuCard,
              {
                opacity: opacityAnim,
                transform: [
                  { scale: scaleAnim },
                  {
                    translateY: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-8, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {MENU_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.menuItem,
                  index < MENU_ITEMS.length - 1 && styles.menuItemBorder,
                  item.key === "blocklist" && styles.menuItemDanger,
                ]}
                onPress={() => handleItemPress(item.key)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.menuIconWrapper,
                    item.key === "blocklist" && styles.menuIconDanger,
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={17}
                    color={item.key === "blocklist" ? "#D32F2F" : "#555"}
                  />
                </View>
                <Text
                  style={[
                    styles.menuLabel,
                    item.key === "blocklist" && styles.menuLabelDanger,
                  ]}
                >
                  {item.label}
                </Text>
                <Ionicons name="chevron-forward" size={14} color="#ccc" />
              </TouchableOpacity>
            ))}
          </Animated.View>
        </>
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#D32F2F",
    paddingHorizontal: 8,
    paddingVertical: 10,
    zIndex: 10,
  },

  // ── Left ─────────────────────────────────────────────
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  clubInfo: {
    flexShrink: 1,
  },
  clubName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#4cff72",
  },
  onlineText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
  },

  // ── Right ────────────────────────────────────────────
  right: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    padding: 6,
    borderRadius: 6,
  },
  iconBtnActive: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  // ── Backdrop ─────────────────────────────────────────
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: -2000,
    zIndex: 8,
  },

  // ── Menu Card ────────────────────────────────────────
  menuCard: {
    position: "absolute",
    top: 2,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    zIndex: 20,
    minWidth: 210,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemDanger: {
    backgroundColor: "#fff9f9",
  },
  menuIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  menuIconDanger: {
    backgroundColor: "#fff0f0",
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  menuLabelDanger: {
    color: "#D32F2F",
  },
});
