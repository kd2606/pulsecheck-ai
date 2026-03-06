import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Switch,
    Alert,
    Modal,
    Pressable,
    FlatList,
    NativeSyntheticEvent,
    NativeScrollEvent,
    Platform,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    Timestamp,
    updateDoc,
} from "firebase/firestore";
import { db } from "../../src/firebase/firebaseConfig";
import { useAuthContext } from "../../src/context/AuthProvider";
import * as Notifications from "expo-notifications";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Notifications ─────────────────────────────────────────────────────────
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// ─── Types ─────────────────────────────────────────────────────────────────
type ReminderType = "Medication" | "Appointment" | "Other";
type Reminder = {
    id: string;
    title: string;
    notes: string;
    type: ReminderType;
    date: Date;
    time: string;
    active: boolean;
};

// ─── Constants ──────────────────────────────────────────────────────────────
const TYPES = [
    { label: "Medication", value: "Medication" as ReminderType, icon: "medical-outline", color: "#A78BFA", bg: "rgba(167,139,250,0.12)" },
    { label: "Appointment", value: "Appointment" as ReminderType, icon: "calendar-outline", color: "#34D399", bg: "rgba(52,211,153,0.12)" },
    { label: "Other", value: "Other" as ReminderType, icon: "notifications-outline", color: "#60A5FA", bg: "rgba(96,165,250,0.12)" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const ITEM_HEIGHT = 52;
const VISIBLE_ITEMS = 5;

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ─── Helpers ────────────────────────────────────────────────────────────────
const padded = (n: number) => String(n).padStart(2, "0");
const formatDateKey = (d: Date) => `${d.getFullYear()}-${padded(d.getMonth() + 1)}-${padded(d.getDate())}`;
const formatDisplayDate = (d: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (formatDateKey(d) === formatDateKey(today)) return "Today";
    if (formatDateKey(d) === formatDateKey(tomorrow)) return "Tomorrow";
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
};
const isPast = (date: Date, time: string) => {
    const dt = new Date(date);
    const [h, m] = time.split(":").map(Number);
    dt.setHours(h, m, 0, 0);
    return dt < new Date();
};
const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const getFirstDay = (y: number, m: number) => new Date(y, m, 1).getDay();

// ─── Drum-Roll Picker ────────────────────────────────────────────────────────
function DrumPicker({
    items,
    selectedIndex,
    onIndexChange,
}: {
    items: string[];
    selectedIndex: number;
    onIndexChange: (i: number) => void;
}) {
    const listRef = useRef<FlatList>(null);
    const paddedItems = ["", "", ...items, "", ""];

    useEffect(() => {
        listRef.current?.scrollToIndex({ index: selectedIndex, animated: false, viewPosition: 0.5 });
    }, []);

    const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offset = e.nativeEvent.contentOffset.y;
        const idx = Math.round(offset / ITEM_HEIGHT);
        if (idx >= 0 && idx < items.length) onIndexChange(idx);
    };

    const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offset = e.nativeEvent.contentOffset.y;
        const idx = Math.round(offset / ITEM_HEIGHT);
        if (idx >= 0 && idx < items.length) onIndexChange(idx);
    };

    return (
        <View style={drum.wrapper}>
            <View style={drum.selector} pointerEvents="none" />
            <FlatList
                ref={listRef}
                data={paddedItems}
                keyExtractor={(_, i) => String(i)}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
                initialScrollIndex={selectedIndex}
                onScrollEndDrag={onScrollEnd}
                onMomentumScrollEnd={onMomentumEnd}
                renderItem={({ item, index }) => {
                    const realIndex = index - 2;
                    const isSelected = realIndex === selectedIndex;
                    const distance = Math.abs(realIndex - selectedIndex);
                    const opacity = distance === 0 ? 1 : distance === 1 ? 0.55 : 0.2;
                    const scale = distance === 0 ? 1 : 0.85;
                    return (
                        <View style={[drum.item, { opacity, transform: [{ scale }] }]}>
                            <Text style={[drum.text, isSelected && drum.textSelected]}>{item}</Text>
                        </View>
                    );
                }}
                style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
            />
        </View>
    );
}

const drum = StyleSheet.create({
    wrapper: { flex: 1, alignItems: "center", position: "relative" },
    selector: {
        position: "absolute",
        top: ITEM_HEIGHT * 2,
        left: 0,
        right: 0,
        height: ITEM_HEIGHT,
        borderRadius: 12,
        backgroundColor: "rgba(167,139,250,0.1)",
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "rgba(167,139,250,0.3)",
        zIndex: 1,
    },
    item: { height: ITEM_HEIGHT, justifyContent: "center", alignItems: "center" },
    text: { fontSize: 22, color: "rgba(255,255,255,0.3)", fontWeight: "500", letterSpacing: 1 },
    textSelected: { fontSize: 26, color: "#F8FAFC", fontWeight: "700" },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function RemindersScreen() {
    const { user } = useAuthContext();

    // Form
    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");
    const [type, setType] = useState<ReminderType>("Medication");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [hourIndex, setHourIndex] = useState(8);
    const [minuteIndex, setMinuteIndex] = useState(0);

    // Data
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterType, setFilterType] = useState<ReminderType | "All">("All");

    // Modals
    const [showForm, setShowForm] = useState(false);
    const [showDateModal, setShowDateModal] = useState(false);
    const [showTimeModal, setShowTimeModal] = useState(false);

    // Calendar nav
    const today = new Date();
    const [calYear, setCalYear] = useState(today.getFullYear());
    const [calMonth, setCalMonth] = useState(today.getMonth());

    // ── Permissions ──────────────────────────────────────────────────────────
    useEffect(() => {
        Notifications.requestPermissionsAsync().then(({ status }) => {
            if (status !== "granted") Alert.alert("Notifications", "Enable notifications for reminders.");
        });
    }, []);

    // ── Firestore ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!user) { setReminders([]); return; }
        const q = query(collection(db, `users/${user.uid}/reminders`), orderBy("date", "asc"));
        return onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data(), date: (d.data().date as any).toDate() } as Reminder));
            setReminders(data);
            scheduleAll(data);
        }, console.error);
    }, [user]);

    const scheduleAll = async (list: Reminder[]) => {
        await Notifications.cancelAllScheduledNotificationsAsync();
        for (const r of list) {
            if (!r.active) continue;
            const dt = new Date(r.date);
            const [h, m] = r.time.split(":").map(Number);
            dt.setHours(h, m, 0, 0);
            if (dt > new Date()) {
                await Notifications.scheduleNotificationAsync({
                    content: { title: `⏰ ${r.title}`, body: r.notes || `Time for your ${r.type.toLowerCase()}.`, sound: true },
                    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: dt },
                });
            }
        }
    };

    // ── CRUD ─────────────────────────────────────────────────────────────────
    const handleAdd = async () => {
        if (!user) { Alert.alert("Sign in required", "Please log in to manage reminders."); return; }
        if (!title.trim()) { Alert.alert("Missing", "Please add a title."); return; }
        const timeStr = `${HOURS[hourIndex]}:${MINUTES[minuteIndex]}`;
        const remDate = new Date(selectedDate);
        remDate.setHours(Number(HOURS[hourIndex]), Number(MINUTES[minuteIndex]), 0, 0);
        setLoading(true);
        try {
            await addDoc(collection(db, `users/${user.uid}/reminders`), {
                title: title.trim(),
                notes: notes.trim(),
                type,
                date: Timestamp.fromDate(remDate),
                time: timeStr,
                active: true,
                createdAt: Timestamp.now(),
            });
            setTitle(""); setNotes(""); setType("Medication"); setSelectedDate(new Date()); setHourIndex(8); setMinuteIndex(0);
            setShowForm(false);
        } catch (e) { Alert.alert("Error", "Could not save reminder."); }
        finally { setLoading(false); }
    };

    const toggleActive = async (id: string, active: boolean) => {
        if (!user) return;
        await updateDoc(doc(db, `users/${user.uid}/reminders`, id), { active }).catch(console.error);
    };

    const handleDelete = (id: string) => {
        Alert.alert("Delete", "Remove this reminder?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => deleteDoc(doc(db, `users/${user!.uid}/reminders`, id)) },
        ]);
    };

    const filteredReminders = filterType === "All" ? reminders : reminders.filter(r => r.type === filterType);
    const getType = (v: ReminderType) => TYPES.find(t => t.value === v)!;

    const upcoming = reminders.filter(r => r.active && !isPast(r.date, r.time)).length;
    const timeStr = `${HOURS[hourIndex]}:${MINUTES[minuteIndex]}`;
    const hour24 = Number(HOURS[hourIndex]);
    const ampm = hour24 < 12 ? "AM" : "PM";
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;

    return (
        <SafeAreaView style={s.root}>
            {/* ══ HEADER ══ */}
            <View style={s.header}>
                <View>
                    <Text style={s.screenTitle}>Reminders</Text>
                    <Text style={s.screenSub}>{upcoming > 0 ? `${upcoming} upcoming` : "No upcoming reminders"}</Text>
                </View>
                <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(true)} activeOpacity={0.8}>
                    <Ionicons name="add" size={20} color="#FFF" />
                    <Text style={s.addBtnText}>New</Text>
                </TouchableOpacity>
            </View>

            {/* ══ FILTER PILLS ══ */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
                {(["All", ...TYPES.map(t => t.value)] as (ReminderType | "All")[]).map(f => {
                    const typeData = f !== "All" ? getType(f as ReminderType) : null;
                    const active = filterType === f;
                    return (
                        <TouchableOpacity
                            key={f}
                            style={[s.pill, active && { backgroundColor: typeData?.color ?? "#6366F1", borderColor: "transparent" }]}
                            onPress={() => setFilterType(f)}
                            activeOpacity={0.7}
                        >
                            {typeData && <Ionicons name={typeData.icon as any} size={13} color={active ? "#FFF" : "#64748B"} style={{ marginRight: 4 }} />}
                            <Text style={[s.pillText, active && { color: "#FFF", fontWeight: "700" }]}>{f}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* ══ LIST ══ */}
            <ScrollView style={s.list} contentContainerStyle={{ paddingBottom: 120, paddingTop: 4 }} showsVerticalScrollIndicator={false}>
                {!user ? (
                    <EmptyState icon="lock-closed-outline" title="Not signed in" sub="Sign in to view your reminders." />
                ) : filteredReminders.length === 0 ? (
                    <EmptyState icon="notifications-off-outline" title="No reminders" sub="Tap '+ New' to schedule one." />
                ) : (
                    filteredReminders.map(r => {
                        const cfg = getType(r.type);
                        const past = isPast(r.date, r.time);
                        return (
                            <View key={r.id} style={s.card}>
                                <View style={[s.cardBar, { backgroundColor: cfg.color }]} />
                                <View style={[s.cardIconWrap, { backgroundColor: cfg.bg }]}>
                                    <Ionicons name={cfg.icon as any} size={22} color={cfg.color} />
                                </View>
                                <View style={s.cardContent}>
                                    <Text style={[s.cardTitle, !r.active && s.dimmed, past && r.active && s.pastText]} numberOfLines={1}>{r.title}</Text>
                                    {r.notes ? <Text style={s.cardNotes} numberOfLines={1}>{r.notes}</Text> : null}
                                    <View style={s.cardMeta}>
                                        <Ionicons name="calendar-outline" size={11} color="#475569" />
                                        <Text style={s.cardMetaTxt}>{formatDisplayDate(r.date)}</Text>
                                        <View style={s.dot} />
                                        <Ionicons name="time-outline" size={11} color="#475569" />
                                        <Text style={s.cardMetaTxt}>{r.time}</Text>
                                        {past && r.active && <View style={s.pastPill}><Text style={s.pastPillTxt}>Past</Text></View>}
                                    </View>
                                </View>
                                <View style={s.cardRight}>
                                    <Switch
                                        value={r.active}
                                        onValueChange={v => toggleActive(r.id, v)}
                                        trackColor={{ false: "#1E293B", true: cfg.color + "55" }}
                                        thumbColor={r.active ? cfg.color : "#334155"}
                                        style={{ transform: [{ scaleX: 0.78 }, { scaleY: 0.78 }] }}
                                    />
                                    <TouchableOpacity onPress={() => handleDelete(r.id)} style={s.trashBtn}>
                                        <Ionicons name="trash-outline" size={17} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* ══════════════════════════════════════════════════════════════
                  MODAL — NEW REMINDER
            ══════════════════════════════════════════════════════════════ */}
            <Modal visible={showForm} animationType="slide" transparent statusBarTranslucent>
                <View style={s.overlay}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowForm(false)} />
                    <View style={s.sheet}>
                        <View style={s.sheetHandle} />
                        <Text style={s.sheetTitle}>New Reminder</Text>

                        {/* Type */}
                        <Text style={s.label}>TYPE</Text>
                        <View style={s.typeRow}>
                            {TYPES.map(t => (
                                <TouchableOpacity
                                    key={t.value}
                                    style={[s.typeBtn, type === t.value && { borderColor: t.color, backgroundColor: t.bg }]}
                                    onPress={() => setType(t.value)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name={t.icon as any} size={18} color={type === t.value ? t.color : "#475569"} />
                                    <Text style={[s.typeBtnTxt, type === t.value && { color: t.color }]}>{t.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Title */}
                        <Text style={s.label}>TITLE</Text>
                        <TextInput
                            style={s.input}
                            placeholder="e.g. Paracetamol 500mg"
                            placeholderTextColor="#334155"
                            value={title}
                            onChangeText={setTitle}
                            returnKeyType="next"
                        />

                        {/* Notes */}
                        <Text style={s.label}>NOTES</Text>
                        <TextInput
                            style={[s.input, s.inputMulti]}
                            placeholder="Optional details..."
                            placeholderTextColor="#334155"
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                        />

                        {/* Date & Time */}
                        <View style={s.rowBtns}>
                            <TouchableOpacity style={[s.rowBtn, { flex: 1.3 }]} onPress={() => setShowDateModal(true)} activeOpacity={0.7}>
                                <Ionicons name="calendar-outline" size={16} color="#34D399" />
                                <Text style={s.rowBtnTxt}>{formatDisplayDate(selectedDate)}</Text>
                                <Ionicons name="chevron-forward" size={14} color="#475569" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[s.rowBtn, { flex: 1 }]} onPress={() => setShowTimeModal(true)} activeOpacity={0.7}>
                                <Ionicons name="time-outline" size={16} color="#A78BFA" />
                                <Text style={s.rowBtnTxt}>{timeStr}</Text>
                                <Ionicons name="chevron-forward" size={14} color="#475569" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={[s.saveBtn, loading && { opacity: 0.5 }]} onPress={handleAdd} disabled={loading} activeOpacity={0.8}>
                            <Text style={s.saveBtnTxt}>{loading ? "Saving…" : "Save Reminder"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ══════════════════════════════════════════════════════════════
                  MODAL — DATE PICKER (Calendar)
            ══════════════════════════════════════════════════════════════ */}
            <Modal visible={showDateModal} animationType="fade" transparent statusBarTranslucent>
                <View style={s.overlay}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowDateModal(false)} />
                    <View style={[s.sheet, { maxHeight: 450 }]}>
                        <View style={s.sheetHandle} />
                        {/* Month Nav */}
                        <View style={cal.nav}>
                            <TouchableOpacity onPress={() => { const d = new Date(calYear, calMonth - 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); }} style={cal.navBtn}>
                                <Ionicons name="chevron-back" size={20} color="#94A3B8" />
                            </TouchableOpacity>
                            <Text style={cal.navTitle}>{MONTH_NAMES[calMonth]} {calYear}</Text>
                            <TouchableOpacity onPress={() => { const d = new Date(calYear, calMonth + 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); }} style={cal.navBtn}>
                                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>
                        {/* Day labels */}
                        <View style={cal.row}>
                            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <Text key={i} style={cal.dayLabel}>{d}</Text>)}
                        </View>
                        {/* Days */}
                        <View style={cal.grid}>
                            {Array.from({ length: getFirstDay(calYear, calMonth) }).map((_, i) => <View key={`e${i}`} style={cal.cell} />)}
                            {Array.from({ length: getDaysInMonth(calYear, calMonth) }, (_, i) => i + 1).map(day => {
                                const d = new Date(calYear, calMonth, day);
                                const todayKey = formatDateKey(new Date());
                                const isToday = formatDateKey(d) === todayKey;
                                const isSel = formatDateKey(d) === formatDateKey(selectedDate);
                                const pastDay = d < new Date(new Date().setHours(0, 0, 0, 0));
                                return (
                                    <TouchableOpacity
                                        key={day}
                                        style={[cal.cell, isSel && cal.selCell, isToday && !isSel && cal.todayCell]}
                                        disabled={pastDay}
                                        onPress={() => { setSelectedDate(d); setShowDateModal(false); }}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[cal.dayNum, isSel && cal.selNum, pastDay && cal.pastNum, isToday && !isSel && { color: "#34D399" }]}>{day}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <TouchableOpacity style={[s.saveBtn, { marginTop: 8 }]} onPress={() => setShowDateModal(false)}>
                            <Text style={s.saveBtnTxt}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ══════════════════════════════════════════════════════════════
                  MODAL — TIME PICKER (Drum Roll)
            ══════════════════════════════════════════════════════════════ */}
            <Modal visible={showTimeModal} animationType="fade" transparent statusBarTranslucent>
                <View style={s.overlay}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowTimeModal(false)} />
                    <View style={[s.sheet, { paddingBottom: 32 }]}>
                        <View style={s.sheetHandle} />
                        <Text style={s.sheetTitle}>Select Time</Text>

                        {/* Big time display */}
                        <View style={tp.display}>
                            <Text style={tp.timeBig}>{String(hour12).padStart(2, "0")}:{MINUTES[minuteIndex]}</Text>
                            <Text style={tp.ampm}>{ampm}</Text>
                        </View>

                        {/* Drum pickers */}
                        <View style={tp.pickersRow}>
                            <View style={{ flex: 1, alignItems: "center" }}>
                                <Text style={tp.pickerLabel}>Hour</Text>
                                <DrumPicker
                                    items={HOURS}
                                    selectedIndex={hourIndex}
                                    onIndexChange={setHourIndex}
                                />
                            </View>
                            <Text style={tp.colon}>:</Text>
                            <View style={{ flex: 1, alignItems: "center" }}>
                                <Text style={tp.pickerLabel}>Minute</Text>
                                <DrumPicker
                                    items={MINUTES}
                                    selectedIndex={minuteIndex}
                                    onIndexChange={setMinuteIndex}
                                />
                            </View>
                        </View>

                        <TouchableOpacity style={[s.saveBtn, { marginTop: 20 }]} onPress={() => setShowTimeModal(false)} activeOpacity={0.8}>
                            <Text style={s.saveBtnTxt}>Confirm {String(hour12).padStart(2, "0")}:{MINUTES[minuteIndex]} {ampm}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState({ icon, title, sub }: { icon: string; title: string; sub: string }) {
    return (
        <View style={es.wrap}>
            <View style={es.iconWrap}><Ionicons name={icon as any} size={34} color="#334155" /></View>
            <Text style={es.title}>{title}</Text>
            <Text style={es.sub}>{sub}</Text>
        </View>
    );
}
const es = StyleSheet.create({
    wrap: { alignItems: "center", paddingVertical: 70 },
    iconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#1E293B", justifyContent: "center", alignItems: "center", marginBottom: 18 },
    title: { fontSize: 18, fontWeight: "700", color: "#475569", marginBottom: 8 },
    sub: { fontSize: 14, color: "#334155", textAlign: "center", paddingHorizontal: 40 },
});

// ─── Calendar Styles ─────────────────────────────────────────────────────────
const cal = StyleSheet.create({
    nav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    navTitle: { fontSize: 17, fontWeight: "700", color: "#F8FAFC" },
    navBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#1E293B", justifyContent: "center", alignItems: "center" },
    row: { flexDirection: "row", marginBottom: 10 },
    dayLabel: { width: `${100 / 7}%`, textAlign: "center", fontSize: 12, fontWeight: "600", color: "#475569", textTransform: "uppercase" },
    grid: { flexDirection: "row", flexWrap: "wrap" },
    cell: { width: `${100 / 7}%`, aspectRatio: 1, justifyContent: "center", alignItems: "center" },
    selCell: { backgroundColor: "#A78BFA", borderRadius: 50 },
    todayCell: { borderWidth: 1.5, borderColor: "#34D399", borderRadius: 50 },
    dayNum: { fontSize: 14, color: "#CBD5E1" },
    selNum: { color: "#FFF", fontWeight: "800" },
    pastNum: { color: "#1E293B" },
});

// ─── Time Picker Styles ───────────────────────────────────────────────────────
const tp = StyleSheet.create({
    display: { flexDirection: "row", alignItems: "flex-end", justifyContent: "center", marginBottom: 24 },
    timeBig: { fontSize: 52, fontWeight: "800", color: "#F8FAFC", letterSpacing: 2 },
    ampm: { fontSize: 20, fontWeight: "600", color: "#A78BFA", marginLeft: 8, marginBottom: 10 },
    pickersRow: { flexDirection: "row", alignItems: "center", height: ITEM_HEIGHT * VISIBLE_ITEMS },
    pickerLabel: { fontSize: 11, fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, textAlign: "center" },
    colon: { fontSize: 32, fontWeight: "800", color: "#475569", marginHorizontal: 4, alignSelf: "center", lineHeight: 36 },
});

// ─── Main Styles ──────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#060E1E" },

    // Header
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 22, paddingTop: 6, paddingBottom: 18 },
    screenTitle: { fontSize: 32, fontWeight: "800", color: "#F8FAFC", letterSpacing: -0.5 },
    screenSub: { fontSize: 13, color: "#475569", marginTop: 3 },
    addBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#6366F1", paddingHorizontal: 18, paddingVertical: 11, borderRadius: 28, gap: 6, shadowColor: "#6366F1", shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
    addBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },

    // Filter
    filterScroll: { maxHeight: 48, marginBottom: 12 },
    filterContent: { paddingHorizontal: 22, gap: 8 },
    pill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 24, borderWidth: 1, borderColor: "#1E293B", backgroundColor: "#0F172A" },
    pillText: { fontSize: 13, color: "#64748B", fontWeight: "500" },

    // List
    list: { flex: 1, paddingHorizontal: 16 },
    card: { flexDirection: "row", alignItems: "center", backgroundColor: "#0F1929", borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: "#1E293B", overflow: "hidden", paddingVertical: 14, paddingRight: 12 },
    cardBar: { width: 3, alignSelf: "stretch", borderRadius: 3, marginRight: 14 },
    cardIconWrap: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center", marginRight: 14 },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 15, fontWeight: "700", color: "#F1F5F9", marginBottom: 4 },
    cardNotes: { fontSize: 12, color: "#475569", marginBottom: 6 },
    cardMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
    cardMetaTxt: { fontSize: 12, color: "#475569" },
    dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: "#1E293B", marginHorizontal: 2 },
    cardRight: { alignItems: "center", gap: 2 },
    trashBtn: { padding: 6 },
    dimmed: { color: "#334155", textDecorationLine: "line-through" },
    pastText: { color: "#F87171" },
    pastPill: { backgroundColor: "rgba(248,113,113,0.12)", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1, marginLeft: 4 },
    pastPillTxt: { fontSize: 10, color: "#F87171", fontWeight: "700" },

    // Modals
    overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.7)" },
    sheet: { backgroundColor: "#0F172A", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, borderTopWidth: 1, borderColor: "#1E293B" },
    sheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: "#1E293B", alignSelf: "center", marginBottom: 22 },
    sheetTitle: { fontSize: 22, fontWeight: "800", color: "#F8FAFC", marginBottom: 22 },

    // Form
    label: { fontSize: 11, fontWeight: "700", color: "#475569", letterSpacing: 1.2, marginBottom: 10, textTransform: "uppercase" },
    typeRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
    typeBtn: { flex: 1, alignItems: "center", paddingVertical: 14, borderRadius: 16, borderWidth: 1.5, borderColor: "#1E293B", backgroundColor: "#0F172A", gap: 6 },
    typeBtnTxt: { fontSize: 12, fontWeight: "600", color: "#475569" },
    input: { backgroundColor: "#070E1A", borderWidth: 1, borderColor: "#1E293B", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: "#F1F5F9", marginBottom: 16 },
    inputMulti: { height: 60, textAlignVertical: "top" },
    rowBtns: { flexDirection: "row", gap: 12, marginBottom: 20 },
    rowBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#070E1A", borderWidth: 1, borderColor: "#1E293B", borderRadius: 14, padding: 14, gap: 8 },
    rowBtnTxt: { flex: 1, fontSize: 14, color: "#CBD5E1", fontWeight: "600" },
    saveBtn: { backgroundColor: "#6366F1", borderRadius: 16, paddingVertical: 17, alignItems: "center", shadowColor: "#6366F1", shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 },
    saveBtnTxt: { color: "#FFF", fontSize: 16, fontWeight: "800", letterSpacing: 0.3 },
});
