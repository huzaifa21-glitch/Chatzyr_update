import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function InputBar({ inputText, setInputText, sendMessage }) {
  // the component needs to return the JSX for the input bar
  return (
    <View style={styles.inputBar}>
      {/* <TouchableOpacity style={styles.attachBtn}>
        <Ionicons name="add" size={24} color="#888" />
      </TouchableOpacity> */}

      <TextInput
        style={styles.input}
        placeholder="Write a message..."
        placeholderTextColor="#aaa"
        value={inputText}
        onChangeText={setInputText}
        multiline
        maxLength={500}
        onSubmitEditing={sendMessage}
      />

      <TouchableOpacity
        style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
        onPress={sendMessage}
        disabled={!inputText.trim()}
        activeOpacity={0.8}
      >
        <Ionicons name="send" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Input Bar ────────────────────────────────────────
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 8,
    marginBottom: Platform.OS === "ios" ? 20 : 10,
  },
  attachBtn: {
    padding: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#222",
    maxHeight: 100,
    paddingVertical: Platform.OS === "ios" ? 8 : 4,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#D32F2F",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: "#f0a0a0",
  },
});