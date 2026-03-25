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
    Modal,
    Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppDrawer from "../../../Drawer/AppDrawer";
import useAuthStore from '../../../store/useAuthStore'
import useAppStore from '../../../store/useAppStore'
import { getTag } from "../../utils/formatter";

export default function ClubsScreen({ navigation }) {
    const clearAuth = useAuthStore((state) => state.clearAuth)
    const resetApp = useAppStore((state) => state.resetApp)
    const CLUBS = useAppStore((state) => state.rooms);
    // console.log(CLUBS);

    const user = useAuthStore((state) => state.user)
    const [search, setSearch] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);

    const autoJoinOnLogin = useAppStore((state) => state.autoJoinOnLogin);
    const setAutoJoinOnLogin = useAppStore((state) => state.setAutoJoinOnLogin);

    const filtered = CLUBS.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );
    const [passwordModal, setPasswordModal] = useState(false)
    const [passwordInput, setPasswordInput] = useState('')
    const [selectedRoom, setSelectedRoom] = useState(null)
    const [passwordError, setPasswordError] = useState('')


    const handleRoomPress = (item) => {
        if (!item.public && item.password) {
            // ← locked room — show password modal
            setSelectedRoom(item)
            setPasswordInput('')
            setPasswordError('')
            setPasswordModal(true)
        } else {
            // ← public room — go straight in
            navigation?.navigate("ClubChat", { room: item })
        }
    }

    // ── Verify password ───────────────────────────
    const handlePasswordSubmit = () => {
        if (passwordInput.trim() === selectedRoom?.password) {
            setPasswordModal(false)
            setPasswordInput('')
            setPasswordError('')
            navigation?.navigate("ClubChat", { room: selectedRoom })
        } else {
            setPasswordError('Incorrect password. Try again.')
        }
    }


    // One-time auto join after fresh login sign-in
    React.useEffect(() => {
        if (!autoJoinOnLogin) return;
        if (!CLUBS || CLUBS.length === 0) return;

        const topRoom = CLUBS.reduce((best, current) => {
            const bestCount = Number(best?.onlineCount ?? 0);
            const currentCount = Number(current?.onlineCount ?? 0);
            return currentCount > bestCount ? current : best;
        }, CLUBS[0]);

        if (topRoom?.roomId) {
            setAutoJoinOnLogin(false);
            navigation.navigate("ClubChat", { room: topRoom });
        }
    }, [autoJoinOnLogin, CLUBS, navigation, setAutoJoinOnLogin]);


    const handleLogout = async () => {
        await clearAuth()  // clears token from AsyncStorage + Zustand
        resetApp()         // clears badges, colors, packages
        // ✅ token becomes null → AppNavigator auto-switches to Login stack
    }


    const renderClub = ({ item }) => {
        const isLocked = !item.public && item.password

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => handleRoomPress(item)}  // ← use handleRoomPress
            >
                <Image source={{ uri: item.badgeurl }} style={styles.cardImage} />
                <View style={styles.cardContent}>
                    <View style={styles.clubNameRow}>
                        <Text style={styles.clubName}>{item.name}</Text>
                        {/* {isLocked && (
                            <Ionicons name="lock-closed" size={14} color="#D32F2F" style={{ marginLeft: 6 }} />
                        )} */}
                    </View>
                    <Text style={styles.membersText}>
                        Members: {item.onlineCount}/{100}
                    </Text>
                    <View style={styles.progressBarBg}>
                        <View
                            style={[
                                styles.progressBarFill,
                                { width: `${Math.min((item.onlineCount / 100) * 100, 100)}%` },
                            ]}
                        />
                    </View>
                </View>
                <View style={styles.arrowButton}>
                    <Ionicons
                        name={isLocked ? "lock-closed" : "arrow-forward"}  // ← lock icon for locked rooms
                        size={18}
                        color="#D32F2F"
                    />
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <>

            <AppDrawer
                visible={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                navigation={navigation}
                activeRoute="Home"
                user={{
                    name: user?.username || 'User',   // ← from your login response
                    avatar: user?.pic,                // ← profile picture
                    tag: getTag(user),      // ← vip2, etc.
                }}
                onLogout={handleLogout}
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
                keyExtractor={(item) => item.roomId}
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
            <Modal
                visible={passwordModal}
                transparent
                animationType="fade"
                onRequestClose={() => setPasswordModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setPasswordModal(false)}
                >
                    <TouchableOpacity
                        style={styles.modalCard}
                        activeOpacity={1}
                        onPress={() => { }}  // ← prevent close when tapping inside
                    >
                        {/* Lock icon */}
                        <View style={styles.modalIconWrapper}>
                            <Ionicons name="lock-closed" size={28} color="#D32F2F" />
                        </View>

                        <Text style={styles.modalTitle}>{selectedRoom?.name}</Text>
                        <Text style={styles.modalSubtitle}>
                            This room is private. Enter the password to join.
                        </Text>

                        {/* Password input */}
                        <View style={styles.modalInputWrapper}>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Enter password..."
                                placeholderTextColor="#bbb"
                                value={passwordInput}
                                onChangeText={(t) => {
                                    setPasswordInput(t)
                                    setPasswordError('')
                                }}
                                secureTextEntry
                                autoFocus
                            />
                        </View>

                        {/* Error */}
                        {passwordError ? (
                            <Text style={styles.errorText}>{passwordError}</Text>
                        ) : null}

                        {/* Buttons */}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setPasswordModal(false)}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.joinBtn}
                                onPress={handlePasswordSubmit}
                            >
                                <Text style={styles.joinBtnText}>Join</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

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
    // ── Club name row ────────────────────────────────
    clubNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },

    // ── Modal ────────────────────────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalCard: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    modalIconWrapper: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: '#fff5f5',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18, fontWeight: '800',
        color: '#111', marginBottom: 8, textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 13, color: '#888',
        textAlign: 'center', marginBottom: 20,
        lineHeight: 20,
    },
    modalInputWrapper: {
        width: '100%',
        borderWidth: 1.5, borderColor: '#eee',
        borderRadius: 50, height: 52,
        paddingHorizontal: 20,
        justifyContent: 'center',
        marginBottom: 8,
        backgroundColor: '#fafafa',
    },
    modalInput: {
        fontSize: 15, color: '#111',
    },
    errorText: {
        fontSize: 12, color: '#D32F2F',
        marginBottom: 12, alignSelf: 'flex-start',
        marginLeft: 8,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12, marginTop: 16, width: '100%',
    },
    cancelBtn: {
        flex: 1, height: 52, borderRadius: 14,
        borderWidth: 1.5, borderColor: '#eee',
        alignItems: 'center', justifyContent: 'center',
    },
    cancelBtnText: {
        fontSize: 15, fontWeight: '700', color: '#888',
    },
    joinBtn: {
        flex: 1, height: 52, borderRadius: 14,
        backgroundColor: '#D32F2F',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#D32F2F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    joinBtnText: {
        fontSize: 15, fontWeight: '700', color: '#fff',
    },
});