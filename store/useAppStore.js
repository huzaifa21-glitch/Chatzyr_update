// store/useAppStore.js
import { create } from "zustand";
import { ipv4 } from "../src/utils/config";

const useAppStore = create((set, get) => ({
  // ← add get here
  badgesFree: [], // ← split into two
  badgesVip: [],
  colors: [],
  rooms: [],
  mods: [],
  packages: [],
  isLoading: false,
  isInitialized: false,
  error: null,
  autoJoinOnLogin: false,
  setAutoJoinOnLogin: (value) => set({ autoJoinOnLogin: value }),

  initializeApp: async (token, userEmail) => {
    if (!token || !userEmail) {
      set({ isInitialized: true, isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });

    const headers = {
      "Content-Type": "application/json",
      Authorization: `${token}`,
    };

    console.log("🚀 initializeApp started");
    console.log("📧 userEmail:", userEmail);
    // console.log("🔑 token:", token);

    try {
      const [badgesRes, colorsRes, roomsRes] = await Promise.all([
        fetch(`${ipv4}loadbages`, { method: "POST", headers }),
        fetch(`${ipv4}fetchcolors`, {
          method: "POST",
          headers,
          body: JSON.stringify({ a: userEmail }),
        }),
        fetch(`${ipv4}fetchData`, { method: "GET", headers }),
      ]);

      console.log("📡 badges status:", badgesRes.status);
      console.log("📡 colors status:", colorsRes.status);
      console.log("📡 rooms status:", roomsRes.status);

      const badgesText = await badgesRes.text();
      const colorsText = await colorsRes.text();
      const roomsText = await roomsRes.text();

      //   console.log('📦 raw badges response:', badgesText)
      // console.log('🎨 raw colors response:', colorsText)
      // console.log('📦 raw packages response:', packagesText)
      // console.log('📡 raw rooms response:', roomsText)

      const badges = JSON.parse(badgesText);
      const colors = JSON.parse(colorsText);
      const rooms = JSON.parse(roomsText);

      //   console.log("✅ badges parsed:", badges);
      // console.log('✅ colors parsed:', colors)
      //   console.log('✅ packages parsed:', packages)
      // console.log('✅ rooms parsed:', rooms.packages)

      const roomList = rooms.documents || [];
      // console.log(roomList);

      set({
        badgesFree: badges.free || [], // ← array of URLs
        badgesVip: badges.vip || [], // ← array of URLs
        colors: colors.allcolors?.[0] || {},
        packages: rooms.packages || [],
        mods: rooms.mymods[0].mod1 || {},
        rooms: roomList,
        isLoading: false,
        isInitialized: true,
      });
      return roomList;
    } catch (error) {
      console.error("App initialization failed:", error);
      set({ error: error.message, isLoading: false, isInitialized: true });
    }
  },

  resetApp: () =>
    set({
      badgesFree: [],
      badgesVip: [],
      colors: [],
      rooms: [],
      packages: [],
      mods: [],
      autoJoinOnLogin: false,
      isInitialized: true,
      isLoading: false,
      error: null,
    }),
  updateRoom: (updatedRoom) =>
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.roomId === updatedRoom.roomId ? { ...room, ...updatedRoom } : room,
      ),
    })),
}));

export default useAppStore;
