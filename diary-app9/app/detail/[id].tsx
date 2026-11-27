import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { fetchDiaries, removeDiary } from "../../src/diarySlice";
import { formatDate } from "../../src/format";
import { useAppDispatch, useAppSelector } from "../../src/hooks";

export default function DetailScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { id } = useLocalSearchParams<{ id: string }>();

  const entry = useAppSelector((state) =>
    state.diary.entries.find((item) => item.id === Number(id))
  );
  const loading = useAppSelector((state) => state.diary.loading);
  const [deleting, setDeleting] = useState(false);

  // Kalau halaman dibuka langsung (misal refresh di web), entries masih kosong.
  const requested = useRef(false);
  useEffect(() => {
    if (!entry && !requested.current) {
      requested.current = true;
      dispatch(fetchDiaries());
    }
  }, [entry, dispatch]);

  if (!entry) {
    return (
      <View style={styles.center}>
        {loading || !requested.current ? (
          <ActivityIndicator size="large" />
        ) : (
          <Text>Diary tidak ditemukan.</Text>
        )}
      </View>
    );
  }

  const remove = async () => {
    if (deleting) return;

    setDeleting(true);

    try {
      await dispatch(removeDiary(entry.id)).unwrap();
      router.replace("/");
    } catch {
      Alert.alert("Error", "Gagal menghapus diary");
      setDeleting(false);
    }
  };

  const confirmRemove = () => {
    Alert.alert("Hapus Diary", "Yakin ingin menghapus diary ini?", [
      { text: "Batal", style: "cancel" },
      { text: "Hapus", style: "destructive", onPress: remove },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.mood}>{entry.mood?.trim() ? entry.mood : "📝"}</Text>
      <Text style={styles.title}>{entry.title}</Text>
      <Text style={styles.date}>{formatDate(entry.diary_date)}</Text>
      <Text style={styles.body}>{entry.body}</Text>

      <Pressable
        style={styles.edit}
        onPress={() =>
          router.push({
            pathname: "/edit/[id]",
            params: { id: String(entry.id) },
          })
        }
      >
        <Text style={styles.white}>Edit</Text>
      </Pressable>

      <Pressable
        style={[styles.delete, deleting && styles.disabled]}
        onPress={confirmRemove}
        disabled={deleting}
      >
        {deleting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.white}>Hapus</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  mood: {
    fontSize: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
  },
  date: {
    color: "#64748B",
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  edit: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  delete: {
    backgroundColor: "#EF4444",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  disabled: {
    opacity: 0.6,
  },
  white: {
    color: "#fff",
    fontWeight: "700",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
});
