import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import VideoPlayer from "../../components/Videoplayer/VideoPlayer";
import ClubChat from "../../components/ClubChat/ClubChat";
import ClubHeader from "../../components/ClubChat/ClubHeader";

const PLAYLIST = [
  { id: "1", title: "General Club Stream", url: "https://youtu.be/dQw4w9WgXcQ" },
  { id: "2", title: "IPTV Channel 1", url: "https://yourstream.com/live.m3u8" },
  { id: "3", title: "Another Video", url: "https://www.youtube.com/watch?v=5kNgRHPjxVk" },
];

export default function ClubChatScreen({ navigation, route }) {
  const clubName = route?.params?.club?.name ?? "General Chat Room";
  const members = route?.params?.club?.members ?? 3;
  const maxMembers = route?.params?.club?.maxMembers ?? 35;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>

      <ClubHeader
        onEditClub={() => navigation.navigate("EditClub")}
        onChatColor={() => navigation.navigate("ChatColor")}
        onBadges={() => navigation.navigate("Badges")}
        onBlockList={() => navigation.navigate("BlockList")}
      ></ClubHeader>
      {/* ── Chat (fills all space between header and video) ── */}
      <View style={styles.chatArea}>
        <ClubChat clubId={route?.params?.club?.id} navigation={navigation} />
      </View>

      {/* ── Video Player (pinned to bottom) ─────────── */}
      <VideoPlayer playlist={PLAYLIST} />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },

  chatArea: {
    flex: 1,
  },
});