import { useEffect, useRef, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";
import { io, Socket } from "socket.io-client";
import { ipv4 } from "../src/utils/config";
import useAuthStore from "../store/useAuthStore";
import useChatStore from "../store/useChatStore";

export default function useSocket(roomId: string) {
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimer = useRef<any>(null);
  const appState = useRef(AppState.currentState);
  const isConnectingRef = useRef(false);
  const hasConnectedRef = useRef(false);
  const isBackgroundedRef = useRef(false);   // ← NEW

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const email = user?.email;

  const {
    setSocket, setConnected, setConnecting,
    setMessages, addMessage, setOnlineUsers,
    addOnlineUser, removeOnlineUser,
    addTypingUser, removeTypingUser,
    setCurrentRoom, resetChat,
  } = useChatStore();

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;
    if (isConnectingRef.current) return;
    if (hasConnectedRef.current) return;

    isConnectingRef.current = true;
    hasConnectedRef.current = true;

    console.log('🔌 Connecting socket...')

    const socket = io(ipv4.replace(/\/$/, ""), {
      transports: ["websocket"],
      auth: { token },
      reconnection: false,
    });

    socketRef.current = socket;
    setSocket(socket);

    socket.once("connect", () => {
      console.log('🟢 Socket connected:', socket.id)
      isConnectingRef.current = false;
      setConnected(true);
      setConnecting(false);
      socket.emit("join_room", { roomId, email });
      setCurrentRoom(roomId);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
      isConnectingRef.current = false;
      setConnected(false);

      // ← Only auto-reconnect if not intentionally backgrounded
      if (reason !== "io client disconnect" && !isBackgroundedRef.current) {
        reconnectTimer.current = setTimeout(() => {
          console.log("🔄 Attempting reconnect...");
          hasConnectedRef.current = false  // ← reset guard
          isConnectingRef.current = false
          connect();
        }, 3000);
      }
    });

    socket.on("connect_error", (err) => {
      console.log("❌ Connection error:", err.message);
      isConnectingRef.current = false;
      hasConnectedRef.current = false;  // ← reset so retry works
      setConnecting(false);
      setConnected(false);

      reconnectTimer.current = setTimeout(() => {
        console.log("🔄 Retrying connection...");
        connect();
      }, 3000);
    });

    socket.on("message_history", (messages: any[]) => {
      console.log("📜 History received:", messages.length, "messages");
      setMessages(messages);
    });

    socket.on("new_message", (message: any) => addMessage(message));
    socket.on("online_users", (users: any[]) => setOnlineUsers(users));
    socket.on("online_users_updated", (users: any[]) => setOnlineUsers(users));
    socket.on("user_joined", (user: any) => addOnlineUser(user));
    socket.on("user_left", ({ email }: { email: string }) => removeOnlineUser(email));
    socket.on("user_typing", ({ email }: { email: string }) => addTypingUser(email));
    socket.on("user_stop_typing", ({ email }: { email: string }) => removeTypingUser(email));
    socket.on("you_were_muted", () => console.log("🔇 You were muted"));
    socket.on("you_were_blocked", () => { console.log("🚫 Blocked"); disconnect(); });
    socket.on("blocked", ({ message }: any) => console.log("🚫", message));
    socket.on("muted", ({ message }: any) => console.log("🔇", message));
    socket.on("error", ({ message }: any) => console.log("❌", message));

  }, [roomId, email, token]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    if (socketRef.current) {
      socketRef.current.emit("leave_room", { roomId, email });
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setSocket(null);
    resetChat();
  }, [roomId, email]);

  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current?.connected || !content.trim()) return;
    socketRef.current.emit("send_message", { roomId, email, content });
  }, [roomId, email]);

  const startTyping = useCallback(() => {
    socketRef.current?.emit("typing_start", { roomId, email });
  }, [roomId, email]);

  const stopTyping = useCallback(() => {
    socketRef.current?.emit("typing_stop", { roomId, email });
  }, [roomId, email]);

  // ── App State ────────────────────────────────────
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {

      if (appState.current.match(/inactive|background/) && nextState === "active") {
        console.log("📱 App foregrounded — reconnecting...");
        isBackgroundedRef.current = false   // ← clear flag

        // Reset guards so connect can run
        hasConnectedRef.current = false
        isConnectingRef.current = false

        // Wait for network to stabilize
        setTimeout(() => {
          if (!socketRef.current?.connected) {
            connect()
          }
        }, 1000)
      }

      if (nextState.match(/inactive|background/)) {
        console.log("📱 App backgrounded — disconnecting...");
        isBackgroundedRef.current = true    // ← set flag

        // Cancel pending reconnect
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current)
          reconnectTimer.current = null
        }

        if (socketRef.current) {
          socketRef.current.emit("leave_room", { roomId, email });
          socketRef.current.disconnect();
          socketRef.current = null          // ← clear ref
          setConnected(false);
        }
      }

      appState.current = nextState;
    });
    return () => subscription.remove();
  }, [connect, roomId, email]);

  // ── Mount/Unmount ────────────────────────────────
  useEffect(() => {
    connect();
    return () => {
      hasConnectedRef.current = false;
      isConnectingRef.current = false;
      disconnect();
    };
  }, []);

  return { sendMessage, startTyping, stopTyping, disconnect };
}