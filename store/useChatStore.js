import { create } from 'zustand'

const useChatStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  isConnecting: false,
  currentRoomId: null,
  allMessages: [],       // ← stores ALL messages
  messages: [],          // ← stores only VISIBLE messages (paginated)
  onlineUsers: [],
  typingUsers: [],
  page: 1,
  pageSize: 15,          // ← show 15 messages at a time
  hasMore: false,

  setSocket: (socket) => set({ socket }),
  setConnected: (val) => set({ isConnected: val }),
  setConnecting: (val) => set({ isConnecting: val }),
  setCurrentRoom: (roomId) => set({ currentRoomId: roomId }),

  // Called when history arrives — load last 15 only
  setMessages: (allMessages) => {
    const pageSize = get().pageSize
    const visible = allMessages.slice(-pageSize)  // ← last 15
    set({
      allMessages,
      messages: visible,
      page: 1,
      hasMore: allMessages.length > pageSize,
    })
  },

  // Load older messages when user scrolls up
  loadMore: () => {
    const { allMessages, messages, pageSize, hasMore } = get()
    if (!hasMore) return

    const currentCount = messages.length
    const nextBatch = allMessages.slice(
      Math.max(0, allMessages.length - currentCount - pageSize),
      allMessages.length - currentCount
    )

    if (nextBatch.length === 0) return

    set({
      messages: [...nextBatch, ...messages],  // ← prepend older messages
      hasMore: currentCount + nextBatch.length < allMessages.length,
    })
  },

  // New incoming message
  addMessage: (message) => set((state) => ({
    allMessages: [...state.allMessages, message],
    messages: [...state.messages, message],
  })),

  setOnlineUsers: (users) => set({ onlineUsers: users }),
  addOnlineUser: (user) => set((state) => {
    const exists = state.onlineUsers.find(u => u.email === user.email)
    if (exists) return state
    return { onlineUsers: [...state.onlineUsers, user] }
  }),
  removeOnlineUser: (email) => set((state) => ({
    onlineUsers: state.onlineUsers.filter(u => u.email !== email)
  })),
  addTypingUser: (email) => set((state) => ({
    typingUsers: [...new Set([...state.typingUsers, email])]
  })),
  removeTypingUser: (email) => set((state) => ({
    typingUsers: state.typingUsers.filter(e => e !== email)
  })),

  resetChat: () => set({
    messages: [],
    allMessages: [],
    onlineUsers: [],
    typingUsers: [],
    currentRoomId: null,
    isConnected: false,
    isConnecting: false,
    page: 1,
    hasMore: false,
  }),
}))

export default useChatStore