import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import InputBar from "./InputBar";
import Loader from "../Loader/Loader";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  type?: "date";
  label?: string;
  user?: string;
  text?: string;
  avatar?: string;
  time?: string;
  tag?: "admin" | "mod1" | "mod2" | "member";
  badgeEmoji?: string;
}

interface ClubChatProps {
  clubId?: string;
  navigation?: any;
}

// ─── Tag Config ──────────────────────────────────────────────────────────────
const TAG_CONFIG: Record<string, { label: string; color: string; bg: string }> =
  {
    admin: { label: "Admin", color: "#fff", bg: "#D32F2F" },
    mod1: { label: "Mod I", color: "#fff", bg: "#1565C0" },
    mod2: { label: "Mod II", color: "#fff", bg: "#6A1B9A" },
    member: { label: "Member", color: "#888", bg: "#e8e8e8" },
  };

const USER_COLORS: Record<string, string> = {
  John: "#E65100",
  Athalia: "#C2185B",
  Sofia: "#1565C0",
  Alex: "#2E7D32",
  You: "#D32F2F",
};
const getNameColor = (name: string) => USER_COLORS[name] ?? "#555";

// ─── Dummy Data ──────────────────────────────────────────────────────────────
const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    user: "John",
    text: "Can I come over?",
    avatar: "https://i.pravatar.cc/150?img=1",
    time: "10:24 AM",
    tag: "admin",
    badgeEmoji: "🔥",
  },
  {
    id: "2",
    user: "Athalia",
    text: "Of course, let me know before coming",
    avatar: "https://i.pravatar.cc/150?img=5",
    time: "10:25 AM",
    tag: "mod1",
    badgeEmoji: "⭐",
  },
  {
    id: "3",
    user: "Sofia",
    text: "K, I'm on my way",
    avatar: "https://i.pravatar.cc/150?img=9",
    time: "10:26 AM",
    tag: "mod2",
    badgeEmoji: "💎",
  },
  {
    id: "4",
    user: "Sofia",
    text: "Good Night everyone!",
    avatar: "https://i.pravatar.cc/150?img=9",
    time: "11:59 PM",
    tag: "mod2",
    badgeEmoji: "💎",
  },
  {
    id: "date-1",
    type: "date",
    label: "Sat, 17/10",
  },
  {
    id: "5",
    user: "John",
    text: "Good Morning Athalia",
    avatar: "https://i.pravatar.cc/150?img=1",
    time: "8:01 AM",
    tag: "admin",
    badgeEmoji: "🔥",
  },
  {
    id: "6",
    user: "Athalia",
    text: "Good Morning John 👋",
    avatar: "https://i.pravatar.cc/150?img=5",
    time: "8:03 AM",
    tag: "mod1",
    badgeEmoji: "⭐",
  },
  {
    id: "7",
    user: "Alex",
    text: "Hey everyone, new here!",
    avatar: "https://i.pravatar.cc/150?img=3",
    time: "8:10 AM",
    tag: "member",
    badgeEmoji: "🌱",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function ClubChat({ clubId, navigation }: ClubChatProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      user: "You",
      text,
      avatar: "https://i.pravatar.cc/150?img=12",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      tag: "member",
      badgeEmoji: "🌱",
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
  };

  const handleReport = (id: string) => {
    // Hook up your report logic here
    console.log("Reported message:", id);
  };

  const renderItem = ({ item }: { item: Message }) => {
    // Date separator
    if (item.type === "date") {
      return (
        <View style={styles.dateSeparator}>
          <View style={styles.dateLine} />
          <Text style={styles.dateLabel}>{item.label}</Text>
          <View style={styles.dateLine} />
        </View>
      );
    }

    const tagCfg = TAG_CONFIG[item.tag ?? "member"];

    return (
      <View style={styles.messageRow}>
        {/* <Loader overlay visible={true} message="Please wait..." /> */}
        {/* Avatar + Badge */}
        <TouchableOpacity
          onPress={() =>
            navigation?.navigate("UserProfile", { user: item.user })
          }
        >
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.badge}>
              <Text style={styles.badgeEmoji}>{item.badgeEmoji}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.messageContent}>
          {/* Name + Tag + Time */}
          <View style={styles.nameRow}>
            <Text
              style={[styles.userName, { color: getNameColor(item.user!) }]}
            >
              {item.user}
            </Text>
            <View style={[styles.tagPill, { backgroundColor: tagCfg.bg }]}>
              <Text style={[styles.tagText, { color: tagCfg.color }]}>
                {tagCfg.label}
              </Text>
            </View>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>

          {/* Message + Report */}
          <View style={styles.messageBody}>
            <Text style={styles.messageText}>{item.text}</Text>
            <TouchableOpacity
              style={styles.reportBtn}
              onPress={() => handleReport(item.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="flag-outline" size={14} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        // onLayout={
        //   () => flatListRef.current?.scrollToEnd({ animated: false }) // ← ADD this
        // }
        // maintainVisibleContentPosition={{
        //   // ← ADD this
        //   minIndexForVisible: 0,
        // }}
      />
 
      <InputBar
        inputText={inputText}
        setInputText={setInputText}
        sendMessage={sendMessage}
      />
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  listContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 14,
  },

  // ── Date Separator ───────────────────────────────────
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    gap: 8,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  dateLabel: {
    fontSize: 11,
    color: "#bbb",
    fontWeight: "500",
  },

  // ── Message Row ──────────────────────────────────────
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  // ── Avatar ───────────────────────────────────────────
  avatarWrapper: {
    position: "relative",
    width: 40,
    height: 40,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
  },
  badge: {
    position: "absolute",
    bottom: -2,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  badgeEmoji: {
    fontSize: 10,
  },

  // ── Content ──────────────────────────────────────────
  messageContent: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  userName: {
    fontSize: 13,
    fontWeight: "700",
  },
  tagPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  timeText: {
    fontSize: 10,
    color: "#bbb",
    marginLeft: "auto",
  },

  // ── Message Body ─────────────────────────────────────
  messageBody: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  reportBtn: {
    paddingTop: 3,
  },
});
