import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Modal,
  Text,
  Image,
} from "react-native";

// ─── Types ───────────────────────────────────────────────────────────────────
interface LoaderProps {
  visible?: boolean;
  overlay?: boolean;
  size?: "small" | "medium" | "large";
  message?: string;
  color?: string;
}

const SIZES = {
  small:  { ring: 36, logo: 18, stroke: 3 },
  medium: { ring: 56, logo: 28, stroke: 4 },
  large:  { ring: 80, logo: 40, stroke: 5 },
};

// ─── Spinning Ring Loader ─────────────────────────────────────────────────────
function SpinnerRing({
  size = "medium",
  color = "#D32F2F",
}: {
  size?: "small" | "medium" | "large";
  color?: string;
}) {
  const rotation = useRef(new Animated.Value(0)).current;
  const pulse    = useRef(new Animated.Value(1)).current;
  const { ring, logo, stroke } = SIZES[size];

  useEffect(() => {
    // Continuous spin
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Gentle pulse on center
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.15,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={{ width: ring, height: ring, alignItems: "center", justifyContent: "center" }}>
      {/* Outer track ring */}
      <View
        style={{
          position: "absolute",
          width: ring,
          height: ring,
          borderRadius: ring / 2,
          borderWidth: stroke,
          borderColor: `${color}22`,
        }}
      />

      {/* Spinning arc — simulated with a partial border */}
      <Animated.View
        style={{
          position: "absolute",
          width: ring,
          height: ring,
          borderRadius: ring / 2,
          borderWidth: stroke,
          borderColor: "transparent",
          borderTopColor: color,
          borderRightColor: color,
          transform: [{ rotate: spin }],
        }}
      />

      {/* Inner glow ring */}
      <View
        style={{
          position: "absolute",
          width: ring - stroke * 4,
          height: ring - stroke * 4,
          borderRadius: (ring - stroke * 4) / 2,
          backgroundColor: `${color}10`,
        }}
      />

      {/* Center pulsing dot / logo */}
      <Animated.View
        style={{
          width: logo,
          height: logo,
          borderRadius: logo / 2,
          backgroundColor: color,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale: pulse }],
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        {/* Mini lightning bolt — brand feel */}
        <Text style={{ fontSize: logo * 0.5, lineHeight: logo * 0.6 }}>⚡</Text>
      </Animated.View>
    </View>
  );
}

// ─── Loader Core ─────────────────────────────────────────────────────────────
function LoaderCore({
  size = "medium",
  message,
  color = "#D32F2F",
}: {
  size?: "small" | "medium" | "large";
  message?: string;
  color?: string;
}) {
  const fadeAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.4,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.loaderCore}>
      <SpinnerRing size={size} color={color} />
      {message && (
        <Animated.Text style={[styles.message, { color, opacity: fadeAnim }]}>
          {message}
        </Animated.Text>
      )}
    </View>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function Loader({
  visible = true,
  overlay = false,
  size = "medium",
  message,
  color = "#D32F2F",
}: LoaderProps) {
  if (!visible) return null;

  if (overlay) {
    return (
      <Modal transparent animationType="fade" visible={visible}>
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            {/* Top accent bar */}
            <View style={[styles.accentBar, { backgroundColor: color }]} />
            <View style={styles.overlayInner}>
              <LoaderCore size={size} message={message} color={color} />
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return <LoaderCore size={size} message={message} color={color} />;
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  loaderCore: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 8,
  },
  message: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  // ── Overlay ──────────────────────────────────────────
  overlay: {
    flex: 1,
   backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  overlayCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
    minWidth: 160,
  },
  accentBar: {
    height: 4,
    width: "100%",
  },
  overlayInner: {
    paddingHorizontal: 40,
    paddingVertical: 32,
    alignItems: "center",
  },
});