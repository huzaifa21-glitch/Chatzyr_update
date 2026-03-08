import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    StyleSheet,
    StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppDrawer from "../../../Drawer/AppDrawer";

const CLUBS = [
    {
        id: "1",
        name: "General Chat Room",
        members: 8,
        maxMembers: 35,
        image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80",
    },
    {
        id: "2",
        name: "USA (Live)",
        members: 3,
        maxMembers: 35,
        image: "https://minutemirror.com.pk/wp-content/uploads/2024/11/statue-liberty-usa.jpg",
    },
    {
        id: "3",
        name: "Pakistani Club",
        members: 20,
        maxMembers: 35,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
    },
    {
        id: "4",
        name: "Music Club",
        members: 25,
        maxMembers: 35,
        image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
    },
    {
        id: "5",
        name: "Tech Talks",
        members: 12,
        maxMembers: 35,
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80",
    },
    {
        id: "6",
        name: "Sports Arena",
        members: 35,
        maxMembers: 35,
        image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80",
    },
];

export default function ClubsScreen({ navigation }) {
    const [search, setSearch] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const filtered = CLUBS.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const renderClub = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => navigation?.navigate("ClubChat")}
        >
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.cardContent}>
                <Text style={styles.clubName}>{item.name}</Text>
                <Text style={styles.membersText}>
                    Members: {item.members}/{item.maxMembers}
                </Text>

                {/* Member count bar */}
                <View style={styles.progressBarBg}>
                    <View
                        style={[
                            styles.progressBarFill,
                            { width: `${(item.members / item.maxMembers) * 100}%` },
                        ]}
                    />
                </View>
            </View>

            {/* Arrow */}
            <View style={styles.arrowButton}>
                <Ionicons name="arrow-forward" size={18} color="#D32F2F" />
            </View>
        </TouchableOpacity>
    );

    return (
        <>
            {/* <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" /> */}
            <AppDrawer
                visible={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                navigation={navigation}
                activeRoute="Home"
                user={{ name: "John Doe", avatar: "https://i0.wp.com/www.photographers.ch/wp/wp-content/uploads/2016/01/PW_151015_001-sw.jpg?resize=825%2C1100&ssl=1", tag: "Admin" }}
                onLogout={() => {
                    // clear zustand store, navigate to login
                    navigation.replace("Login");
                }}
            />
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setDrawerOpen(true)} style={styles.menuButton}>
                    <Ionicons name="menu" size={26} color="#222" />
                </TouchableOpacity>

                <Image
                    source={require("../../../assets/Logos/logo-color.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <TouchableOpacity style={styles.notifButton}>
                    <Ionicons name="notifications-outline" size={24} color="#D32F2F" />
                    {/* <View style={styles.badge}>
                        <Text style={styles.badgeText}></Text>
                    </View> */}
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchWrapper}>
                <Ionicons name="search-outline" size={20} color="#aaa" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search clubs..."
                    placeholderTextColor="#aaa"
                    value={search}
                    onChangeText={setSearch}
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch("")}>
                        <Ionicons name="close-circle" size={18} color="#ccc" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Club List */}
            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                renderItem={renderClub}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={48} color="#ddd" />
                        <Text style={styles.emptyText}>No clubs found</Text>
                    </View>
                }
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },

    // ── Header ──────────────────────────────────────────
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: "#f5f5f5",
    },
    menuButton: {
        padding: 6,
    },
    logo: {
        width: 140,
        height: 44,
    },
    notifButton: {
        padding: 6,
        position: "relative",
    },
    badge: {
        position: "absolute",
        top: 2,
        right: 2,
        backgroundColor: "#D32F2F",
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 3,
    },
    badgeText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "700",
    },

    // ── Search ───────────────────────────────────────────
    searchWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 50,
        marginHorizontal: 16,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 50,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: "#222",
        height: "100%",
    },

    // ── List ─────────────────────────────────────────────
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
        gap: 14,
    },

    // ── Card ─────────────────────────────────────────────
    card: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 20,
        overflow: "hidden",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 4,
    },
    cardImage: {
        width: 110,
        height: 110,
    },
    cardContent: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    clubName: {
        fontSize: 16,
        fontWeight: "800",
        color: "#111",
        marginBottom: 4,
    },
    membersText: {
        fontSize: 13,
        color: "#D32F2F",
        fontWeight: "600",
        marginBottom: 10,
    },
    progressBarBg: {
        height: 4,
        backgroundColor: "#f0e0e0",
        borderRadius: 4,
        width: "85%",
    },
    progressBarFill: {
        height: 4,
        backgroundColor: "#D32F2F",
        borderRadius: 4,
    },

    // ── Arrow ────────────────────────────────────────────
    arrowButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: "#D32F2F",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },

    // ── Empty ────────────────────────────────────────────
    emptyState: {
        alignItems: "center",
        marginTop: 80,
        gap: 12,
    },
    emptyText: {
        fontSize: 15,
        color: "#bbb",
    },
});