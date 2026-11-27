import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchDiaries } from "../../src/diarySlice";
import { formatDate } from "../../src/format";
import { useAppDispatch, useAppSelector } from "../../src/hooks";

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { entries, loading, error } = useAppSelector((state) => state.diary);
  const [query, setQuery] = useState("");

  useEffect(() => {
    dispatch(fetchDiaries());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) return entries;

    return entries.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        item.body.toLowerCase().includes(keyword) ||
        (item.mood ?? "").toLowerCase().includes(keyword)
    );
  }, [entries, query]);

  if (loading && entries.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Mengambil data...</Text>
      </View>
    );
  }

  if (error && entries.length === 0) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
        <Pressable style={styles.retry} onPress={() => dispatch(fetchDiaries())}>
          <Text style={styles.white}>Coba Lagi</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Buku Harian</Text>
        <Text style={styles.count}>{entries.length} catatan</Text>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Cari judul atau isi diary..."
        autoCorrect={false}
        style={styles.search}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.listContent,
          filtered.length === 0 && styles.emptyContainer,
        ]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              dispatch(fetchDiaries());
            }}
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {entries.length === 0
              ? "Belum ada diary. Tambahkan lewat tab Tambah."
              : `Tidak ada diary yang cocok dengan "${query}".`}
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/detail/[id]",
                params: { id: String(item.id) },
              })
            }
          >
            <View style={styles.moodBox}>
              <Text style={styles.mood}>
                {item.mood?.trim() ? item.mood : "📝"}
              </Text>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.date}>{formatDate(item.diary_date)}</Text>
              <Text numberOfLines={2}>{item.body}</Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#F8FAFC",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  header: {
    fontSize: 26,
    fontWeight: "700",
  },
  count: {
    color: "#64748B",
    fontSize: 13,
  },
  search: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  moodBox: {
    width: 42,
    alignItems: "center",
  },
  mood: {
    fontSize: 28,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
  },
  date: {
    color: "#64748B",
    fontSize: 12,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 16,
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    color: "#64748B",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  retry: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  white: {
    color: "#fff",
    fontWeight: "700",
  },
});
