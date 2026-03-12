import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { VideoView, useVideoPlayer } from "expo-video";
import YoutubePlayer from "react-native-youtube-iframe";

const { width } = Dimensions.get("window");
const PLAYER_HEIGHT = width * (9 / 16);

// ─── Helper ──────────────────────────────────────────────────────────────────
const getYoutubeId = (url: string): string | null => {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
};

const isYoutubeUrl = (url: string) =>
  url.includes("youtube.com") || url.includes("youtu.be");

// ─── Types ───────────────────────────────────────────────────────────────────
interface VideoItem {
  id: string;
  title: string;
  url: string;
}

interface VideoPlayerProps {
  playlist: VideoItem[];
  onIndexChange?: (index: number) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function VideoPlayer({
  playlist,
  onIndexChange,
}: VideoPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  const current = playlist[currentIndex];
  const isYT = isYoutubeUrl(current.url);
  const youtubeId = isYT ? getYoutubeId(current.url) : null;

  const player = useVideoPlayer(current.url, (player) => {
    player.loop = false;
  });

  useEffect(() => {
    if (!isYT) {
      player.replace(current.url);
      setPlaying(false);
    }
  }, [currentIndex]);

  const goTo = (index: number) => {
    if (index < 0 || index >= playlist.length) return;
    setCurrentIndex(index);
    setPlaying(false);
    onIndexChange?.(index);
  };

  const togglePlay = () => {
    if (player.playing) {
      player.pause();
      setPlaying(false);
    } else {
      player.play();
      setPlaying(true);
    }
  };

  useEffect(() => {
    const sub = player.addListener("statusChange", (status: any) => {
      if (status.status === "loading") setLoading(true);
      if (status.status === "ready") setLoading(false);
      if (status.status === "ended") setPlaying(false);
    });

    return () => sub.remove();
  }, [player]);

  return (
    <View style={styles.container}>
      {/* ── Player Area ─────────────────────────────── */}
      <View style={isYT ? styles.playerWrapperYT : styles.playerWrapper}>
        {isYT && youtubeId ? (
          <YoutubePlayer
            height={PLAYER_HEIGHT}
            width={width}
            videoId={youtubeId}
            play={playing}
            onChangeState={(state: string) => {
              if (state === "ended") setPlaying(false);
              if (state === "buffering") setLoading(true);
              else setLoading(false);
            }}
          />
        ) : (
          <VideoView player={player} style={styles.nativeVideo} nativeControls={false} />
        )}

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color="#fff" size="large" />
          </View>
        )}

        {!isYT && (
          <TouchableOpacity
            style={styles.playOverlay}
            onPress={togglePlay}
            activeOpacity={0.8}
          >
            {!playing && (
              <View style={styles.playIconCircle}>
                <Ionicons name="play" size={32} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* ── Controls Bar ────────────────────────────── */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlBtn, currentIndex === 0 && styles.controlBtnDisabled]}
          onPress={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          <Ionicons
            name="play-skip-back"
            size={20}
            color={currentIndex === 0 ? "#ccc" : "#fff"}
          />
        </TouchableOpacity>

        {!isYT && (
          <TouchableOpacity style={styles.mainPlayBtn} onPress={togglePlay}>
            <Ionicons name={playing ? "pause" : "play"} size={22} color="#fff" />
          </TouchableOpacity>
        )}

        <Text style={styles.titleText} numberOfLines={1}>
          {current.title}
        </Text>

        <TouchableOpacity
          style={[
            styles.controlBtn,
            currentIndex === playlist.length - 1 && styles.controlBtnDisabled,
          ]}
          onPress={() => goTo(currentIndex + 1)}
          disabled={currentIndex === playlist.length - 1}
        >
          <Ionicons
            name="play-skip-forward"
            size={20}
            color={currentIndex === playlist.length - 1 ? "#ccc" : "#fff"}
          />
        </TouchableOpacity>
      </View>

      {/* ── Playlist Indicator ──────────────────────── */}
      <View style={styles.dots}>
        {playlist.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => goTo(i)}>
            <View style={[styles.dot, i === currentIndex && styles.dotActive]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#111",
  },

  playerWrapper: {
    width: width,
    height: PLAYER_HEIGHT,
    backgroundColor: "#000",
  },

  playerWrapperYT: {
    width: width,
    backgroundColor: "#000",
  },

  nativeVideo: {
    width: "100%",
    height: "100%",
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },

  playIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },

  controls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },

  controlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },

  controlBtnDisabled: {
    backgroundColor: "#222",
  },

  mainPlayBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D32F2F",
    alignItems: "center",
    justifyContent: "center",
  },

  titleText: {
    flex: 1,
    color: "#eee",
    fontSize: 13,
    fontWeight: "600",
  },

  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    backgroundColor: "#1a1a1a",
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#555",
  },

  dotActive: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D32F2F",
  },
});