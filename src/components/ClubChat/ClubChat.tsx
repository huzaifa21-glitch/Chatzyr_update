import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import InputBar from "./InputBar";
import useChatStore from "../../../store/useChatStore";
import useAppStore from "../../../store/useAppStore";

type ClubChatProps = {
  room?: any;
  messages: any[];
  onlineUsers: any[];
  typingUsers: any[];
  isConnected: boolean;
  isConnecting: boolean;
  currentUserEmail?: string;
  onSendMessage: (content: string) => void;
  onStartTyping: () => void;
  onStopTyping: () => void;
  navigation?: any;
};

const formatTime = (isoString: string) => {
  try {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const ClubChat: React.FC<ClubChatProps> = ({
  room,
  messages,
  onlineUsers,
  typingUsers,
  isConnected,
  isConnecting,
  currentUserEmail,
  onSendMessage,
  onStartTyping,
  onStopTyping,
  navigation,
}) => {
  const [inputText, setInputText] = useState("");
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimer = useRef<any>(null);
  const loadMore = useChatStore((state) => state.loadMore);
  const hasMore = useChatStore((state) => state.hasMore);
  const mods = useAppStore((state) => state.mods);

  // ── Scroll to bottom ONCE when messages first load ───
  useEffect(() => {
    if (messages.length > 0 && !initialScrollDone && isConnected) {
      // Small delay to ensure FlatList has rendered
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
        setInitialScrollDone(true);
      }, 300);
    }
  }, [messages.length, isConnected]);

  // ── Scroll to bottom on new message ─────────────────
  const prevLengthRef = useRef(0);
  useEffect(() => {
    if (messages.length > prevLengthRef.current && initialScrollDone) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
    prevLengthRef.current = messages.length;
  }, [messages.length]);

  // ── Load more on scroll to top ───────────────────────
  const handleLoadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    await new Promise((resolve) => setTimeout(resolve, 300)); // ← small delay feels natural
    loadMore();
    setLoadingMore(false);
  };

  // ── Send ─────────────────────────────────────────────
  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    onSendMessage(text);
    setInputText("");
    onStopTyping();
    if (typingTimer.current) clearTimeout(typingTimer.current);
  };

  // ── Typing ───────────────────────────────────────────
  const handleTextChange = (text: string) => {
    setInputText(text);
    if (text.length > 0) {
      onStartTyping();
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => onStopTyping(), 2000);
    } else {
      onStopTyping();
    }
  };

  const getTag = (item: any) => {
    const email = item.user_id;
    const tags = [];

    // Owner
    if (email === "Leohax@gmail.com") {
      tags.push({ label: "Owner", bg: "#D32F2F", color: "#fff" });
    }

    // Mod — just check if email exists in flat array
    if (mods?.includes(email)) {
      tags.push({ label: "Mod", bg: "#1565C0", color: "#fff" });
    }

    // VIP
    if (item.premium === "vip1" || item.premium === "vip2" || item.premium === "vip3") {
      tags.push({ label: "VIP", bg: "#FFF3CD", color: "#E6A817" });
    }

    return tags;
  };

  // ── Render message ───────────────────────────────────
  const renderItem = ({ item }: { item: any }) => {

  // console.log('👤 message item:', JSON.stringify(item, null, 2))
    const isMe = item.user_id === currentUserEmail;
    const nameColor = item.usernamecolor || "#555";
    const chatColor = item.chatcolor || "#333";
    const tags = getTag(item);
    return (
      <View style={styles.messageRow}>
        <TouchableOpacity
          onPress={() =>
            navigation?.navigate("UserProfile", { userEmail: item.user_id })
          }
        >
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri:
                  item.pic ||
                  "https://cdn-icons-png.flaticon.com/512/3177/3177440.png",
              }}
              style={styles.avatar}
            />
            {item.badge && (
              <Image
                source={{ uri: item.badge }}
                style={styles.badgeImg}
                resizeMode="contain"
              />
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.messageContent}>
          <View style={styles.nameRow}>
            <Text style={[styles.userName, { color: nameColor }]}>
              {isMe ? "You" : item.username || item.user_id}
            </Text>
            {tags.map((tag, i) => (
              <View
                key={i}
                style={[styles.tagPill, { backgroundColor: tag.bg }]}
              >
                <Text style={[styles.tagText, { color: tag.color }]}>
                  {tag.label}
                </Text>
              </View>
            ))}
            <Text style={styles.timeText}>{formatTime(item.time)}</Text>
          </View>
          <Text style={[styles.messageText, { color: chatColor }]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  // ── Better full screen loader ─────────────────────────
  if (isConnecting && messages.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#D32F2F" />
        <Text style={styles.loaderText}>Joining room...</Text>
        <Text style={styles.loaderSub}>Loading messages</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Connection lost banner */}
      {!isConnected && !isConnecting && (
        <View style={styles.statusBanner}>
          <Text style={styles.statusText}>🔴 Disconnected — retrying...</Text>
        </View>
      )}
      {!isConnected && isConnecting && messages.length > 0 && (
        <View style={[styles.statusBanner, styles.statusBannerConnecting]}>
          <Text style={styles.statusText}>⏳ Reconnecting...</Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        // ── Load more when scrolled to top ──
        onScrollBeginDrag={() => {}}
        onEndReachedThreshold={1}
        ListHeaderComponent={
          loadingMore ? (
            <View style={styles.loadMoreIndicator}>
              <ActivityIndicator size="small" color="#D32F2F" />
              <Text style={styles.loadMoreText}>Loading older messages...</Text>
            </View>
          ) : hasMore ? (
            <TouchableOpacity
              style={styles.loadMoreBtn}
              onPress={handleLoadMore}
            >
              <Text style={styles.loadMoreBtnText}>Load older messages</Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No messages yet. Say hello! 👋</Text>
          </View>
        }
      />

      {/* Typing indicator */}
      {typingUsers.filter((e) => e !== currentUserEmail).length > 0 && (
        <View style={styles.typingRow}>
          <Text style={styles.typingText}>
            {typingUsers.filter((e) => e !== currentUserEmail).length === 1
              ? `Someone is typing...`
              : `Multiple people are typing...`}
          </Text>
        </View>
      )}

      <InputBar
        inputText={inputText}
        setInputText={handleTextChange}
        sendMessage={handleSend}
      />
    </KeyboardAvoidingView>
  );
};

export default ClubChat;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },

  // ── Full screen loader ───────────────────────────
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    gap: 12,
  },
  loaderText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  loaderSub: {
    fontSize: 13,
    color: "#aaa",
  },

  // ── Status banners ───────────────────────────────
  statusBanner: {
    backgroundColor: "#ffebee",
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  statusBannerConnecting: { backgroundColor: "#fff8e1" },
  statusText: { fontSize: 12, color: "#555", fontWeight: "600" },

  // ── Load more ────────────────────────────────────
  loadMoreIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  loadMoreText: { fontSize: 12, color: "#888" },
  loadMoreBtn: {
    alignItems: "center",
    paddingVertical: 10,
  },
  loadMoreBtnText: {
    fontSize: 12,
    color: "#D32F2F",
    fontWeight: "600",
  },

  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    gap: 14,
  },

  // ── Message Row ──────────────────────────────────
  tagPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  avatarWrapper: { position: "relative", width: 40, height: 40 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
  },
  badgeImg: {
    position: "absolute",
    bottom: -2,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#fff",
  },
  messageContent: { flex: 1, gap: 3 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  userName: { fontSize: 13, fontWeight: "700" },
  vipPill: {
    backgroundColor: "#FFF3CD",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 20,
  },
  vipText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#E6A817",
    letterSpacing: 0.5,
  },
  timeText: { fontSize: 10, color: "#bbb", marginLeft: "auto" },
  messageText: { flex: 1, fontSize: 14, lineHeight: 20 },

  // ── Typing ───────────────────────────────────────
  typingRow: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: "#f5f5f5",
  },
  typingText: { fontSize: 12, color: "#888", fontStyle: "italic" },

  // ── Empty ────────────────────────────────────────
  emptyState: { alignItems: "center", marginTop: 60 },
  emptyText: { fontSize: 14, color: "#bbb" },
});
