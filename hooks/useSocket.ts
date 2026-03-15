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

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const email = user?.email;

  const {
    setSocket,
    setConnected,
    setConnecting,
    setMessages,
    addMessage,
    setOnlineUsers,
    addOnlineUser,
    removeOnlineUser,
    addTypingUser,
    removeTypingUser,
    setCurrentRoom,
    resetChat,
  } = useChatStore();

  // ── Connect ──────────────────────────────────────
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;
    if (isConnectingRef.current) return;
    if (hasConnectedRef.current) return; // ← ADD this check

    isConnectingRef.current = true;
    hasConnectedRef.current = true; // ← set immediately

    const socket = io(ipv4.replace(/\/$/, ""), {
      // ← remove trailing slash
      transports: ["websocket"],
      auth: { token },
      reconnection: false, // ← we handle reconnection manually
    });

    socketRef.current = socket;
    setSocket(socket);

    // ── Connection events ───────────────────────
    socket.on("connect", () => {
      isConnectingRef.current = false; // ← reset on connect
      setConnected(true);
      setConnecting(false);
      socket.emit("join_room", { roomId, email });
      setCurrentRoom(roomId);
    });

    socket.on("disconnect", (reason) => {
      isConnectingRef.current = false;
      console.log("🔴 Socket disconnected:", reason);
      setConnected(false);

      // Auto reconnect after 3 seconds unless we left intentionally
      if (reason !== "io client disconnect") {
        reconnectTimer.current = setTimeout(() => {
          console.log("🔄 Attempting reconnect...");
          connect();
        }, 3000);
      }
    });

    socket.on("connect_error", (err) => {
      isConnectingRef.current = false;
      console.log("❌ Connection error:", err.message);
      setConnecting(false);
      setConnected(false);

      // Retry after 3 seconds
      reconnectTimer.current = setTimeout(() => {
        console.log("🔄 Retrying connection...");
        connect();
      }, 3000);
    });

    // ── Chat events ─────────────────────────────
    socket.on("message_history", (messages: any[]) => {
      console.log("📜 History received:", messages.length, "messages");
      setMessages(messages);
    });

    socket.on("new_message", (message: any) => {
      addMessage(message);
    });

    // ── Online users ────────────────────────────
    socket.on("online_users", (users: any[]) => {
      setOnlineUsers(users);
    });

    socket.on("online_users_updated", (users: any[]) => {
      setOnlineUsers(users);
    });

    socket.on("user_joined", (user: any) => {
      addOnlineUser(user);
    });

    socket.on("user_left", ({ email }: { email: string }) => {
      removeOnlineUser(email);
    });

    // ── Typing ──────────────────────────────────
    socket.on("user_typing", ({ email }: { email: string }) => {
      addTypingUser(email);
    });

    socket.on("user_stop_typing", ({ email }: { email: string }) => {
      removeTypingUser(email);
    });

    // ── Moderation ──────────────────────────────
    socket.on("you_were_muted", () => {
      console.log("🔇 You were muted");
    });

    socket.on("you_were_blocked", () => {
      console.log("🚫 You were blocked");
      disconnect();
    });

    socket.on("blocked", ({ message }: { message: string }) => {
      console.log("🚫 Blocked:", message);
    });

    socket.on("muted", ({ message }: { message: string }) => {
      console.log("🔇 Muted:", message);
    });

    socket.on("error", ({ message }: { message: string }) => {
      console.log("❌ Socket error:", message);
    });
  }, [roomId, email, token]);

  // ── Disconnect ───────────────────────────────────
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

  // ── Send Message ─────────────────────────────────
  const sendMessage = useCallback(
    (content: string) => {
      if (!socketRef.current?.connected || !content.trim()) return;
      socketRef.current.emit("send_message", { roomId, email, content });
    },
    [roomId, email],
  );

  // ── Typing ───────────────────────────────────────
  const startTyping = useCallback(() => {
    socketRef.current?.emit("typing_start", { roomId, email });
  }, [roomId, email]);

  const stopTyping = useCallback(() => {
    socketRef.current?.emit("typing_stop", { roomId, email });
  }, [roomId, email]);

  // ── App State (background/foreground) ────────────
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextState === "active"
        ) {
          // App came to foreground — reconnect if needed
          console.log("📱 App foregrounded — checking socket...");
          if (!socketRef.current?.connected) {
            connect();
          }
        }
        if (nextState.match(/inactive|background/)) {
          // App went to background — disconnect to save battery
          console.log("📱 App backgrounded — disconnecting socket...");
          if (socketRef.current?.connected) {
            socketRef.current.emit("leave_room", { roomId, email });
            socketRef.current.disconnect();
            setConnected(false);
          }
        }
        appState.current = nextState;
      },
    );
    return () => subscription.remove();
  }, [connect, roomId, email]);

  // ── Mount/Unmount ────────────────────────────────
  useEffect(() => {
    connect();
    return () => {
      hasConnectedRef.current = false; // ← reset on unmount
      isConnectingRef.current = false;
      disconnect();
    };
  }, []);
  return { sendMessage, startTyping, stopTyping, disconnect };
}
