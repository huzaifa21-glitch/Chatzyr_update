import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import useChatStore from "../../../store/useChatStore";
import useAuthStore from "../../../store/useAuthStore";
import { ipv4 } from "../../../src/utils/config";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import Loader from "../Loader/Loader";
interface RoomInfoSheetProps {
  room?: any;
  onClose?: () => void;
  mod?: boolean;
}

export default function RoomInfoSheet({
  room,
  onClose,
  mod,
}: RoomInfoSheetProps) {
  const onlineUsers = useChatStore((state) => state.onlineUsers);
  const token = useAuthStore((state) => state.token);
  const socket = useChatStore((state) => state.socket)

  // ── Editable state ──────────────────────────────
  const [name, setName] = useState(room?.name || "");
  const [badgeurl, setBadgeurl] = useState(room?.badgeurl || "");
  const [videoUrls, setVideoUrls] = useState<string[]>(room?.videourl || []);
  const [isPublic, setIsPublic] = useState(room?.public ?? true);
  const [password, setPassword] = useState(room?.password || "");
  const [saving, setSaving] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [bio, setBio] = useState(room?.bio || "");

  const pickAndUploadImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow access to your photo library",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    uploadToCloudinary(uri);
  };

  const uploadToCloudinary = async (uri: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri,
        type: "image/jpeg",
        name: "room_image.jpg",
      } as any);
      formData.append("upload_preset", "profilepics");
      formData.append("cloud_name", "di01hbrje"); // ← your cloudinary preset

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/di01hbrje/image/upload",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await res.json();
      if (data.secure_url) {
        setBadgeurl(data.secure_url); // ← save cloudinary URL to state
      } else {
       Toast.show({ type: "error", text1: "Upload failed", text2: "Please try again" });
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Error", text2: "Image upload failed" });
    } finally {
      setUploading(false);
    }
  };

  if (!room) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Room info unavailable</Text>
        </View>
      </SafeAreaView>
    );
  }

  const fillPercent = Math.min(
    Math.round((onlineUsers.length / 100) * 100),
    100,
  );

  // ── Save changes ────────────────────────────────

const handleSave = async () => {
  if (!name.trim()) return  Toast.show({ type: "error", text1: 'Room name cannot be empty' })
  if (!bio.trim()) return  Toast.show({ type: "error", text1: 'Bio cannot be empty' })
  if (!isPublic && !password.trim()) return  Toast.show({ type: "error", text1: 'Password required for private rooms' })

  setSaving(true)
  try {
    const updates = {
      name: name.trim(),
      bio: bio.trim(),
      badgeurl: badgeurl.trim(),
      videourl: videoUrls,
      public: isPublic,
      password: isPublic ? '' : password.trim(),
    }

    // ← emit to socket — updates DB and broadcasts to all users in room
    socket?.emit('room_updated', { roomId: room.roomId, updates })

    Toast.show({ type: "success", text1: 'Room updated!' })
    onClose?.()
  } catch (err) {
    Toast.show({ type: "error", text1: 'Failed to update room' })
  } finally {
    setSaving(false)
  }
}

  // ── Video URL helpers ───────────────────────────
  const addVideoUrl = () => {
    if (!newVideoUrl.trim()) return;
    setVideoUrls([...videoUrls, newVideoUrl.trim()]);
    setNewVideoUrl("");
  };

  const removeVideoUrl = (index: number) => {
    setVideoUrls(videoUrls.filter((_, i) => i !== index));
  };

  const updateVideoUrl = (index: number, value: string) => {
    const updated = [...videoUrls];
    updated[index] = value;
    setVideoUrls(updated);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Room Image ─────────────────────────── */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: badgeurl || room.badgeurl }}
            style={styles.roomImage}
          />
          <View style={styles.imageOverlay} />
          <Text style={styles.roomNameOverlay}>{name || room.name}</Text>
        </View>

        {/* ── Stats Row ──────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={18} color="#D32F2F" />
            <Text style={styles.statValue}>{onlineUsers.length}/100</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="heart" size={18} color="#D32F2F" />
            <Text style={styles.statValue}>{room.likes}</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{fillPercent}%</Text>
            <Text style={styles.statLabel}>Full</Text>
          </View>
        </View>

        {/* ── Capacity bar ───────────────────────── */}
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${fillPercent}%` }]} />
        </View>

        {/* ── About ──────────────────────────────── */}
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{room.bio}</Text>

        {/* ── Owner ──────────────────────────────── */}
        <Text style={styles.sectionTitle}>Owner</Text>
        <View style={styles.ownerRow}>
          <Text style={styles.ownerName}>{room.roomOwner}</Text>
          <View style={styles.ownerPill}>
            <Text style={styles.ownerPillText}>Owner</Text>
          </View>
        </View>

        {/* ── MOD ONLY SECTION ───────────────────── */}
        {mod && (
          <View style={styles.modSection}>
            <View style={styles.modHeader}>
              <Ionicons name="shield-checkmark" size={16} color="#D32F2F" />
              <Text style={styles.modHeaderText}>Mod Controls</Text>
            </View>

            {/* Room Name */}
            <Text style={styles.fieldLabel}>Room Name</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Room name"
                placeholderTextColor="#ccc"
              />
            </View>

            {/* Bio */}
            <Text style={styles.fieldLabel}>Bio</Text>
            <View style={[styles.inputWrapper, styles.bioWrapper]}>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Room description..."
                placeholderTextColor="#ccc"
                multiline
                maxLength={500}
              />
              <Text style={styles.charCount}>{bio.length}/500</Text>
            </View>

            <Text style={styles.fieldLabel}>Room Image</Text>
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={pickAndUploadImage}
              disabled={uploading}
              activeOpacity={0.8}
            >
              {badgeurl ? (
                // ← show current image with edit overlay
                <View style={styles.imagePickerPreview}>
                  <Image
                    source={{ uri: badgeurl }}
                    style={styles.imagePickerImg}
                    resizeMode="cover"
                  />
                  <View style={styles.imagePickerOverlay}>
                    {uploading ? (
                      <Loader size="small" color="#fff" message="Updating" />
                    ) : (
                      <Ionicons name="camera" size={22} color="#fff" />
                    )}
                  </View>
                </View>
              ) : (
                // ← empty state
                <View style={styles.imagePickerEmpty}>
                  {uploading ? (
                    <Loader
                      size="small"
                      color="#D32F2F"
                      message="uploading image"
                    />
                  ) : (
                    <>
                      <Ionicons name="image-outline" size={32} color="#ccc" />
                      <Text style={styles.imagePickerText}>
                        Tap to upload image
                      </Text>
                    </>
                  )}
                </View>
              )}
            </TouchableOpacity>

            {/* Public / Private toggle */}
            <Text style={styles.fieldLabel}>Room Visibility</Text>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Ionicons
                  name={isPublic ? "globe-outline" : "lock-closed-outline"}
                  size={18}
                  color={isPublic ? "#2E7D32" : "#D32F2F"}
                />
                <Text
                  style={[
                    styles.toggleLabel,
                    { color: isPublic ? "#2E7D32" : "#D32F2F" },
                  ]}
                >
                  {isPublic
                    ? "Public — Anyone can join"
                    : "Private — Password required"}
                </Text>
              </View>
              <Switch
                value={isPublic}
                onValueChange={setIsPublic}
                trackColor={{ false: "#ffcdd2", true: "#c8e6c9" }}
                thumbColor={isPublic ? "#2E7D32" : "#D32F2F"}
              />
            </View>

            {/* Password — only shown when private */}
            {!isPublic && (
              <>
                <Text style={styles.fieldLabel}>Room Password</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Set a password..."
                    placeholderTextColor="#ccc"
                    secureTextEntry
                  />
                </View>
              </>
            )}

            {/* Video URLs */}
            <Text style={styles.fieldLabel}>Video URLs</Text>
            {videoUrls.map((url, index) => (
              <View key={index} style={styles.videoUrlRow}>
                <TextInput
                  style={[styles.input, styles.videoInput]}
                  value={url}
                  onChangeText={(val) => updateVideoUrl(index, val)}
                  placeholder="https://youtube.com/..."
                  placeholderTextColor="#ccc"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeVideoUrl(index)}
                >
                  <Ionicons name="trash-outline" size={18} color="#D32F2F" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add new video URL */}
            <View style={styles.videoUrlRow}>
              <TextInput
                style={[styles.input, styles.videoInput]}
                value={newVideoUrl}
                onChangeText={setNewVideoUrl}
                placeholder="Add video URL..."
                placeholderTextColor="#ccc"
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.addBtn} onPress={addVideoUrl}>
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              <Text style={styles.saveBtnText}>
                {saving ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 32 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: { fontSize: 16, color: "#555" },

  // ── Image ─────────────────────────────────────────────
  imageWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    height: 200,
    position: "relative",
  },
  roomImage: { width: "100%", height: "100%" },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  roomNameOverlay: {
    position: "absolute",
    bottom: 12,
    left: 14,
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  imagePicker: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  imagePickerPreview: {
    width: "100%",
    height: 140,
    position: "relative",
  },
  imagePickerImg: {
    width: "100%",
    height: "100%",
  },
  imagePickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePickerEmpty: {
    width: "100%",
    height: 120,
    backgroundColor: "#fafafa",
    borderWidth: 1.5,
    borderColor: "#eee",
    borderRadius: 12,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  imagePickerText: {
    fontSize: 13,
    color: "#ccc",
    fontWeight: "600",
  },

  bioWrapper: {
    height: 120,
    alignItems: "flex-start",
    paddingTop: 10,
    paddingBottom: 24, // ← space for char count
  },
  bioInput: {
    flex: 1,
    textAlignVertical: "top",
  },
  charCount: {
    position: "absolute",
    bottom: 8,
    right: 12,
    fontSize: 10,
    color: "#ccc",
  },
  // ── Stats ─────────────────────────────────────────────
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 12,
  },
  statItem: { alignItems: "center", gap: 3 },
  statValue: { fontSize: 16, fontWeight: "800", color: "#111" },
  statLabel: { fontSize: 11, color: "#aaa", fontWeight: "500" },
  statDivider: { width: 1, height: 36, backgroundColor: "#eee" },

  // ── Progress ──────────────────────────────────────────
  progressBg: {
    height: 5,
    backgroundColor: "#f0e0e0",
    borderRadius: 4,
    marginBottom: 20,
  },
  progressFill: { height: 5, backgroundColor: "#D32F2F", borderRadius: 4 },

  // ── Text ──────────────────────────────────────────────
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#aaa",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#444",
    lineHeight: 22,
    marginBottom: 20,
  },

  // ── Owner ─────────────────────────────────────────────
  ownerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  ownerName: { flex: 1, fontSize: 15, fontWeight: "700", color: "#111" },
  ownerPill: {
    backgroundColor: "#fff0f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D32F2F",
  },
  ownerPillText: { fontSize: 11, color: "#D32F2F", fontWeight: "700" },

  // ── Mod Section ───────────────────────────────────────
  modSection: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 20,
    marginTop: 4,
  },
  modHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  modHeaderText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#D32F2F",
    letterSpacing: 0.3,
  },

  // ── Fields ────────────────────────────────────────────
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderColor: "#eee",
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    justifyContent: "center",
    marginBottom: 16,
    backgroundColor: "#fafafa",
  },
  input: { fontSize: 14, color: "#111" },

  // ── Image preview ─────────────────────────────────────
  imagePreview: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    marginBottom: 16,
  },

  // ── Toggle ────────────────────────────────────────────
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fafafa",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#eee",
  },
  toggleInfo: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  toggleLabel: { fontSize: 13, fontWeight: "600" },

  // ── Video URLs ────────────────────────────────────────
  videoUrlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  videoInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#eee",
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    backgroundColor: "#fafafa",
  },
  removeBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#fff0f0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#ffcdd2",
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#D32F2F",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Save ──────────────────────────────────────────────
  saveBtn: {
    height: 52,
    backgroundColor: "#D32F2F",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#D32F2F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: {
    backgroundColor: "#e08080",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
