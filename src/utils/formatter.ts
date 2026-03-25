export const formatTime = (isoString: string) => {
  try {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

  export const getTag = (user: { email: string; premium: string; }) => {
        if (user?.email?.toLowerCase() === 'leohax@gmail.com') return 'Admin'
        if (user?.premium === 'vip1' || user?.premium === 'vip2' || user?.premium === 'vip3') return 'VIP Member'
        return 'Member'
    }

    export const getPremiumColor = (premium: string) => {
  if (premium === 'vip2' || premium === 'vip1' || premium === 'vip3') return '#E6A817'  // ← warm rich gold for both
  return null
}

export const getTagBackgroundColor = (tag: string) => {
  switch (tag) {
    case 'Admin': return '#D32F2F'  // Red for admin
    case 'VIP Member': return '#FFF3CD'  // Light gold for VIP
    default: return '#E0E0E0'  // Gray for regular member
  }
}

 export const getTagTextColor = (tag: string) => {
  switch (tag) {
    case 'Admin': return '#FFFFFF'  // White text on red
    case 'VIP Member': return '#E6A817'  // Gold text on light gold
    default: return '#666666'  // Dark gray text on light gray
  }
}

 export const chatGetTag = (item: any,  mods:any) => {
    const email = item.user_id;
    const tags = [];

    // Owner
    if (email === "Leohax@gmail.com") {
      tags.push({ label: "Admin", bg: "#D32F2F", color: "#fff" });
    }

    // Mod — just check if email exists in flat array
    if (mods?.includes(email)) {
      tags.push({ label: "Mod", bg: "#1565C0", color: "#fff" });
    }

    // VIP
    if (
      item.premium === "vip1" ||
      item.premium === "vip2" ||
      item.premium === "vip3"
    ) {
      tags.push({ label: "VIP", bg: "#FFF3CD", color: "#E6A817" });
    }

    return tags;
  };
