import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  StatusBar,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const DRAWER_WIDTH = width * 0.65;

// ─── Types ───────────────────────────────────────────────────────────────────
interface DrawerProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
  user?: {
    name: string;
    avatar: string;
    tag?: string;
  };
  activeRoute?: string;
  onLogout?: () => void;
}

// ─── Nav Items ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: "Home",         label: "Home",          icon: "home-outline",         iconActive: "home"          },
  { key: "Friends",      label: "Friends",        icon: "people-outline",       iconActive: "people"        },
  { key: "Balance",      label: "Balance",        icon: "wallet-outline",       iconActive: "wallet"        },
  { key: "Notification", label: "Notifications",  icon: "notifications-outline", iconActive: "notifications" },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function AppDrawer({
  visible,
  onClose,
  navigation,
  user = {
    name: "John Doe",
    avatar: "https://i.pravatar.cc/150?img=1",
    tag: "Member",
  },
  activeRoute = "Home",
  onLogout,
}: DrawerProps) {
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 180,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -DRAWER_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleNavigate = (key: string) => {
    onClose();
    setTimeout(() => navigation?.navigate(key), 200);
  };

  const handleLogout = () => {
    onClose();
    setTimeout(() => onLogout?.(), 250);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.backdrop,
            { opacity: backdropOpacity },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Drawer Panel */}
      <Animated.View
        style={[
          styles.drawer,
          { transform: [{ translateX }] },
        ]}
      >
        <SafeAreaView style={styles.drawerInner} edges={["top", "bottom"]}>

          {/* ── Red Header Section ─────────────────── */}
          <View style={styles.drawerHeader}>
            {/* Background decoration */}
            <View style={styles.headerDecorCircle1} />
            <View style={styles.headerDecorCircle2} />

            {/* Close button */}
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>

            {/* User info */}
            <View style={styles.userSection}>
              <View style={styles.avatarWrapper}>
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
                <View style={styles.onlineBadge} />
              </View>
              <Text style={styles.userName}>{user.name}</Text>
              <View style={styles.tagPill}>
                <Text style={styles.tagText}>{user.tag}</Text>
              </View>
            </View>
          </View>

          {/* ── Nav Items ──────────────────────────── */}
          <View style={styles.navSection}>
            <Text style={styles.navSectionLabel}>MENU</Text>

            {NAV_ITEMS.map((item, index) => {
              const isActive = activeRoute === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.navItem, isActive && styles.navItemActive]}
                  onPress={() => handleNavigate(item.key)}
                  activeOpacity={0.7}
                >
                  {/* Active indicator bar */}
                  {isActive && <View style={styles.activeBar} />}

                  <View style={[styles.navIconWrapper, isActive && styles.navIconWrapperActive]}>
                    <Ionicons
                      name={(isActive ? item.iconActive : item.icon) as any}
                      size={20}
                      color={isActive ? "#D32F2F" : "#888"}
                    />
                  </View>

                  <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                    {item.label}
                  </Text>

                  {isActive && (
                    <Ionicons name="chevron-forward" size={16} color="#D32F2F" style={{ marginLeft: "auto" }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Divider ────────────────────────────── */}
          <View style={styles.divider} />

          {/* ── Logout ─────────────────────────────── */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <View style={styles.logoutIconWrapper}>
              <Ionicons name="log-out-outline" size={20} color="#D32F2F" />
            </View>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          {/* ── Version ────────────────────────────── */}
          <Text style={styles.version}>ChatZyr v1.0.0</Text>

        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  // ── Drawer ───────────────────────────────────────────
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 20,
  },
  drawerInner: {
    flex: 1,
  },

  // ── Header ───────────────────────────────────────────
  drawerHeader: {
    backgroundColor: "#D32F2F",
    paddingTop: 20,
    paddingBottom: 28,
    paddingHorizontal: 20,
    overflow: "hidden",
  },
  headerDecorCircle1: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.07)",
    top: -40,
    right: -30,
  },
  headerDecorCircle2: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: -20,
    right: 60,
  },
  closeBtn: {
    alignSelf: "flex-end",
    padding: 4,
    marginBottom: 16,
  },
  userSection: {
    alignItems: "flex-start",
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.6)",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4cff72",
    borderWidth: 2,
    borderColor: "#D32F2F",
  },
  userName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  tagPill: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  tagText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  // ── Nav ──────────────────────────────────────────────
  navSection: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 12,
  },
  navSectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ccc",
    letterSpacing: 1.5,
    marginLeft: 16,
    marginBottom: 8,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 4,
    gap: 14,
    position: "relative",
    overflow: "hidden",
  },
  navItemActive: {
    backgroundColor: "#fff5f5",
  },
  activeBar: {
    position: "absolute",
    left: 0,
    top: "20%",
    bottom: "20%",
    width: 3,
    backgroundColor: "#D32F2F",
    borderRadius: 2,
  },
  navIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  navIconWrapperActive: {
    backgroundColor: "#ffeaea",
  },
  navLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  navLabelActive: {
    color: "#D32F2F",
    fontWeight: "700",
  },

  // ── Divider ──────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 20,
    marginBottom: 16,
  },

  // ── Logout ───────────────────────────────────────────
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
    marginBottom: 8,
  },
  logoutIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#fff0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#D32F2F",
  },

  // ── Version ──────────────────────────────────────────
  version: {
    textAlign: "center",
    fontSize: 11,
    color: "#ccc",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
});