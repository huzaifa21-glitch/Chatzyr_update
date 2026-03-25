// src/screens/Home/MembersScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import useAuthStore from '../../../store/useAuthStore'
import useChatStore from '../../../store/useChatStore'
import { getTag,getPremiumColor,getTagBackgroundColor,getTagTextColor } from '../../utils/formatter'
const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 48) / 3  // 3 columns

export default function MembersScreen({ navigation, route }: any) {
  const [search, setSearch] = useState("") 
  const onlineUsers = useChatStore((state) => state.onlineUsers)
  //  console.log(onlineUsers);
  const members = onlineUsers 

  const filtered = members.filter((m: { username: string; }) =>
    m.username.toLowerCase().includes(search.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    const order: any = { vip3: 0, vip2: 1, vip1:2, free: 3 }
    return (order[a.premium] ?? 2) - (order[b.premium] ?? 2)
  })

  const renderMember = ({ item }: any) => {
    const ringColor = getPremiumColor(item.premium)
    const userTag = getTag(item)

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation?.navigate("UserProfile", { userEmail: item.email })}
      >
        {/* Avatar with optional VIP ring */}
        <View style={[styles.avatarWrapper, ringColor && { borderColor: ringColor }]}>
          <Image source={{ uri: item.pic }} style={styles.avatar} />
          {/* Online dot */}
          <View style={styles.onlineDot} />
        </View>

        {/* Name */}
        <Text style={styles.username} numberOfLines={1}>
          {item.username}
        </Text>

        {/* User Tag */}
        <View style={[styles.userTag, { backgroundColor: getTagBackgroundColor(userTag) }]}>
          <Text style={[styles.userTagText, { color: getTagTextColor(userTag) }]}>
            {userTag}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#222" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Members</Text>
          <Text style={styles.headerSub}>{members.length} online</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color="#aaa" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search members..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color="#ccc" />
          </TouchableOpacity>
        )}
      </View>

      {/* Grid */}
      <FlatList
        data={sorted}
       keyExtractor={(item) => `${item.badge}_${item.email}`}
        numColumns={3}
        renderItem={renderMember}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color="#ddd" />
            <Text style={styles.emptyText}>No members found</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },

  // ── Header ───────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: "#f5f5f5",
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "#fff", alignItems: "center",
    justifyContent: "center", elevation: 2,
    shadowColor: "#000", shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 6,
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#111" },
  headerSub: { fontSize: 12, color: "#D32F2F", fontWeight: "600" },

  // ── Search ───────────────────────────────────────────
  searchWrapper: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#fff", borderRadius: 50,
    marginHorizontal: 16, marginBottom: 16,
    paddingHorizontal: 16, height: 48,
    shadowColor: "#000", shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#222" },

  // ── Grid ─────────────────────────────────────────────
  grid: { paddingHorizontal: 12, paddingBottom: 24 },

  // ── Card ─────────────────────────────────────────────
  card: {
    width: CARD_SIZE,
    alignItems: "center",
    paddingVertical: 16,
    margin: 4,
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },

  // ── Avatar ───────────────────────────────────────────
  avatarWrapper: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 2.5, borderColor: "transparent",
    marginBottom: 10, position: "relative",
  },
  avatar: {
    width: "100%", height: "100%",
    borderRadius: 32,
  },
  onlineDot: {
    position: "absolute", bottom: 1, right: 1,
    width: 13, height: 13, borderRadius: 7,
    backgroundColor: "#4cff72",
    borderWidth: 2, borderColor: "#fff",
  },

  // ── Name & Tag ───────────────────────────────────────
  username: {
    fontSize: 12, fontWeight: "700",
    color: "#111", textAlign: "center",
    paddingHorizontal: 4, marginBottom: 4,
  },
  userTag: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 20,
  },
  userTagText: {
    fontSize: 9, fontWeight: "800", letterSpacing: 0.5,
  },

  // ── Empty ────────────────────────────────────────────
  empty: { alignItems: "center", marginTop: 80, gap: 12 },
  emptyText: { fontSize: 15, color: "#bbb" },
})