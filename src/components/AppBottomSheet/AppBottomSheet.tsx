import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Modal,
  PanResponder,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

const { height } = Dimensions.get("window");

// ─── Types ───────────────────────────────────────────────────────────────────
interface AppBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapHeight?: number;   // how tall the sheet is, default 50% of screen
  closeable?: boolean;   // can user drag to dismiss, default true
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function AppBottomSheet({
  visible,
  onClose,
  children,
  snapHeight = height * 0.55,
  closeable = true,
}: AppBottomSheetProps) {
  const translateY  = useRef(new Animated.Value(snapHeight)).current;
  const backdropOp  = useRef(new Animated.Value(0)).current;
  const dragY       = useRef(new Animated.Value(0)).current;
  const lastDragY   = useRef(0);

  // ── Open / Close animation ─────────────────────────
  useEffect(() => {
    if (visible) {
      dragY.setValue(0);
      translateY.setValue(snapHeight);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 22,
          stiffness: 200,
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
        Animated.timing(translateY, {
          toValue: snapHeight,
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

  // ── Pan responder for drag-to-dismiss ─────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => closeable,
      onMoveShouldSetPanResponder: (_, g) => closeable && g.dy > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) {
          translateY.setValue(g.dy);
          lastDragY.current = g.dy;
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > snapHeight * 0.35 || g.vy > 0.5) {
          // dismiss
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: snapHeight,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(backdropOp, {
              toValue: 0,
              duration: 180,
              useNativeDriver: true,
            }),
          ]).start(() => onClose());
        } else {
          // snap back
          Animated.spring(translateY, {
            toValue: 0,
            damping: 20,
            stiffness: 200,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      // statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={closeable ? onClose : undefined}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOp }]} />
        </TouchableWithoutFeedback>

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            { height: snapHeight, transform: [{ translateY }] },
          ]}
        >
          {/* Drag Handle */}
          <View {...panResponder.panHandlers} style={styles.handleArea}>
            <View style={styles.handle} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            {children}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
    overflow: "hidden",
  },
  handleArea: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e0e0e0",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
