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
import * as Linking from "expo-linking";
import { Ionicons } from "@expo/vector-icons";
import InputBar from "./InputBar";
import useChatStore from "../../../store/useChatStore";
import useAppStore from "../../../store/useAppStore";
import useAuthStore from "../../../store/useAuthStore";
import { chatGetTag, formatTime } from "../../utils/formatter";
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
const URL_REGEX = /((https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}([^\s]*))/g;
const URL_TEST_REGEX = /^((https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}([^\s]*))$/;




const renderMessageText = (text: string, color: string) => {
  const parts = text.split(URL_REGEX);

  return (
    <Text style={[styles.messageText, { color }]}>
      {parts.map((part, i) => {
        if (URL_TEST_REGEX.test(part)) {
          const url = part.startsWith("http") ? part : `https://${part}`;

          return (
            <Text
              key={i}
              style={styles.linkText}
              onPress={() => Linking.openURL(url)}
            >
              {part}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
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
  const addMessage = useChatStore((state) => state.addMessage);
  const mods = useAppStore((state) => state.mods);
  const user = useAuthStore((state) => state.user);
  const prevLastMessageRef = useRef<any>(null);

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

  useEffect(() => {
    if (!initialScrollDone || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];

    // If last message changed → new message came → scroll
    if (prevLastMessageRef.current !== lastMessage) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }

    prevLastMessageRef.current = lastMessage;
  }, [messages]);

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

    // Create optimistic message
    const optimisticMessage = {
      user_id: currentUserEmail,
      username: user?.username || currentUserEmail,
      content: text,
      time: new Date().toISOString(),
      pic: user?.pic,
      badge: user?.badge,
      premium: user?.premium,
      usernamecolor: user?.usernamecolor || "#555",
      chatcolor: user?.chatcolor || "#333",
    };

    // Add locally immediately for optimistic UI
    addMessage(optimisticMessage);

    // Send to server
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

 
  // ── Render message ───────────────────────────────────
  const renderItem = ({ item }: { item: any }) => {
    // console.log('👤 message item:', JSON.stringify(item, null, 2))
    const isMe = item.user_id === currentUserEmail;
    const nameColor = item.usernamecolor || "#555";
    const chatColor = item.chatcolor || "#333";
    const tags = chatGetTag(item,mods);
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
              {item.username || item.user_id}
            </Text>
            {(item.premium === "vip1" ||
              item.premium === "vip2" ||
              item.premium === "vip3") && (
              <View style={styles.vip}>
                <Image
                  source={{
                    uri: "https://cdn-icons-png.flaticon.com/512/9195/9195920.png",
                  }}
                  style={{ width: 16, height: 16, marginLeft: 0 }}
                />
              </View>
            )}
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
          {renderMessageText(item.content, chatColor)}
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
        keyExtractor={(item, index) => `${item.user_id}-${item.time}-${index}`}
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
  linkText: {
    color: "#1565C0",
    textDecorationLine: "underline",
    fontFamily: "Nunito_600SemiBold",
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
  vip: {
    flexDirection: "row",
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
    right: -8,
    width: 21,
    height: 21,
    borderRadius: 9,
    // backgroundColor: "#fff",
  },
  messageContent: { flex: 1, gap: 3 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  userName: {
    fontSize: 13,
    fontFamily: "Nunito_800ExtraBold", // ← replaces fontWeight: 800
    letterSpacing: 0.1,
    flexShrink: 1,
  },
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
  messageText: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: "Nunito_800ExtraBold", // ← readable weight for colored text
    letterSpacing: 0.1,
  },

  // ── Typing ───────────────────────────────────────
  typingRow: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: "#f5f5f5",
  },
  typingText: {
    fontSize: 12,
    color: "#aaa",
    fontStyle: "italic",
    fontFamily: "Nunito_400Regular",
  },

  // ── Empty ────────────────────────────────────────
  emptyState: { alignItems: "center", marginTop: 60 },
  emptyText: { fontSize: 14, color: "#bbb" },
});
