import React, { useState } from "react";
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
import AppBottomSheet from "../../components/AppBottomSheet/AppBottomSheet";
import RoomInfoSheet from "../../components/AppBottomSheet/RoomInfoSheet";
import BadgeUpdateSheet from "../../components/AppBottomSheet/BadgeUpdateSheet";
import NameColorSheet from "../../components/AppBottomSheet/NameColorSheet";

const PLAYLIST = [
  { id: "1", title: "General Club Stream", url: "https://youtu.be/dQw4w9WgXcQ" },
  { id: "2", title: "IPTV Channel 1", url: "https://yourstream.com/live.m3u8" },
  { id: "3", title: "Another Video", url: "https://www.youtube.com/watch?v=5kNgRHPjxVk" },
];

export default function ClubChatScreen({ navigation, route }) {
  const clubName = route?.params?.club?.name ?? "General Chat Room";
  const members = route?.params?.club?.members ?? 3;
  const maxMembers = route?.params?.club?.maxMembers ?? 35;
  const [sheet, setSheet] = useState(null);
  var height = 100;
  const DUMMY_CLUB = {
    name: "General Chat Room",
    description:
      "A place for everyone to connect, share ideas, and have fun conversations. All topics welcome — keep it respectful and kind!",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80",
    members: 8,
    maxMembers: 35,
    likes: 142,
    ownerName: "John Doe",
    ownerAvatar: "https://i.pravatar.cc/150?img=1",
    ownerBadge: "🔥",
  };
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ClubHeader
        onEditClub={() => setSheet("roomInfo")}
        onChatColor={() => setSheet("nameColor")}
        onBadges={() => setSheet("badge")}
        onBlockList={() => navigation.navigate("BlockList")}
        navigation={navigation}
      ></ClubHeader>

      <AppBottomSheet visible={sheet !== null}
        onClose={() => setSheet(null)}
        snapHeight={sheet === "badge" ? 900 * 0.7 : 950 * 0.55}
      >
        {sheet === "roomInfo" && <RoomInfoSheet room={DUMMY_CLUB} />}
        {sheet === "badge" && <BadgeUpdateSheet currentBadge="🔥" onSave={() => { console.log("Badge updated"); }} />}
        {sheet === "nameColor" && <NameColorSheet currentName="John" currentColor="#D32F2F" onSave={() => { console.log("Badge updated"); }} />}
      </AppBottomSheet>
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