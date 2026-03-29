import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake'

import VideoPlayer from "../../components/Videoplayer/VideoPlayer";
import ClubChat from "../../components/ClubChat/ClubChat";
import ClubHeader from "../../components/ClubChat/ClubHeader";
import AppBottomSheet from "../../components/AppBottomSheet/AppBottomSheet";
import RoomInfoSheet from "../../components/AppBottomSheet/RoomInfoSheet";
import BadgeUpdateSheet from "../../components/AppBottomSheet/BadgeUpdateSheet";
import NameColorSheet from "../../components/AppBottomSheet/NameColorSheet";

import useSocket from '../../../hooks/useSocket'
import useChatStore from '../../../store/useChatStore'
import useAuthStore from '../../../store/useAuthStore'
import useAppStore from "../../../store/useAppStore";
import { isMod } from "../../utils/userRoles";

export default function ClubChatScreen({ navigation, route }) {

  const rooms = useAppStore((state) => state.rooms)
  const club = rooms.find(r => r.roomId === route?.params?.room?.roomId) ?? route?.params?.room ?? {}
  const roomId = club?.roomId
  const [sheet, setSheet] = useState(null)

  // ── Socket hook ────────────────────────────────
  const { sendMessage, startTyping, stopTyping, disconnect } = useSocket(roomId)

  const handleHomePress = () => {
    disconnect();
    navigation.navigate("Home");
  };

  // ── Chat state from Zustand ────────────────────
  const messages = useChatStore((state) => state.messages)
  const onlineUsers = useChatStore((state) => state.onlineUsers)
  const typingUsers = useChatStore((state) => state.typingUsers)
  const isConnected = useChatStore((state) => state.isConnected)
  const isConnecting = useChatStore((state) => state.isConnecting)
  const user = useAuthStore((state) => state.user)
  const mods = useAppStore((state) => state.mods);

  const mod = isMod(user, mods)
  // console.log(mod);


  // console.log(onlineUsers);

  // ── Keep screen awake ──────────────────────────
  useEffect(() => {
    activateKeepAwakeAsync()
    return () => deactivateKeepAwake()
  }, [])

  // ── Build playlist from room data (newest first) ──────────────
  const playlist = (club?.videourl || [])
    .slice() // avoid mutating data from route params
    .reverse() // show last stream first
    .map((url, i) => ({
      id: String(i),
      title: `${club.name} — Stream ${i + 1}`,
      url,
    }))

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>

      <ClubHeader
        onEditClub={() => setSheet("roomInfo")}
        onChatColor={() => setSheet("nameColor")}
        onBadges={() => setSheet("badge")}
        onBlockList={() => navigation.navigate("BlockList")}
        onMembers={() => navigation.navigate("Members", { onlineUsers })}
        onHomePress={handleHomePress}
        navigation={navigation}
        clubName={club.name}
        members={onlineUsers.length}        // ← live count from socket
        isConnected={isConnected}
        isConnecting={isConnecting}
        mod={mod}
      />

      <AppBottomSheet
        visible={sheet !== null}
        onClose={() => setSheet(null)}
        snapHeight={sheet === "badge" ? 900 * 0.7 : 950 * 0.55}
      >
        {sheet === "roomInfo" && <RoomInfoSheet room={club} mod={mod} />}
        {sheet === "badge" && <BadgeUpdateSheet onSave={(badge) => console.log("Badge updated:", badge)} />}
        {sheet === "nameColor" && <NameColorSheet onSave={(name, color) => console.log("Updated:", name, color)} />}
      </AppBottomSheet>

      {/* ── Chat ──────────────────────────────────── */}
      <View style={styles.chatArea}>
        <ClubChat
          room={club}
          messages={messages}
          onlineUsers={onlineUsers}
          typingUsers={typingUsers}
          isConnected={isConnected}
          isConnecting={isConnecting}
          currentUserEmail={user?.email}
          onSendMessage={sendMessage}
          onStartTyping={startTyping}
          onStopTyping={stopTyping}
          navigation={navigation}
        />
      </View>

      {/* ── Video Player ──────────────────────────── */}
      {playlist.length > 0 && <VideoPlayer playlist={playlist} />}

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f0f0" },
  chatArea: { flex: 1 },
})