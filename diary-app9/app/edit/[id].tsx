import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { editDiary, fetchDiaries } from "../../src/diarySlice";
import { formatDate } from "../../src/format";
import { useAppDispatch, useAppSelector } from "../../src/hooks";

const MOODS = ["😀", "🙂", "😐", "😔", "😠"];

export default function EditScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { id } = useLocalSearchParams<{ id: string }>();

  const entry = useAppSelector((state) =>
    state.diary.entries.find((item) => item.id === Number(id))
  );
  const loading = useAppSelector((state) => state.diary.loading);

  const [title, setTitle] = useState(entry?.title ?? "");
  const [body, setBody] = useState(entry?.body ?? "");
  const [mood, setMood] = useState(entry?.mood ?? " ");
  const [saving, setSaving] = useState(false);

  // Isi form begitu data diary tersedia (misal baru di-fetch dari API).
  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setBody(entry.body);
      setMood(entry.mood);
    }
  }, [entry]);

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

  const save = async () => {
    if (saving) return;

    if (!title.trim() || !body.trim()) {
      Alert.alert("Validasi", "Judul dan isi wajib diisi");
      return;
    }

    setSaving(true);

    try {
      await dispatch(
        editDiary({
          id: entry.id,
          data: {
            title: title.trim(),
            diary_date: entry.diary_date,
            body: body.trim(),
            mood,
          },
        })
      ).unwrap();

      router.replace({
        pathname: "/detail/[id]",
        params: { id: String(entry.id) },
      });
    } catch {
      Alert.alert("Error", "Gagal mengubah diary");
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Edit Diary</Text>
        <Text style={styles.subtitle}>{formatDate(entry.diary_date)}</Text>

        <Text style={styles.label}>Judul</Text>
        <TextInput value={title} onChangeText={setTitle} style={styles.input} />

        <Text style={styles.label}>Isi diary</Text>
        <TextInput
          value={body}
          onChangeText={setBody}
          multiline
          style={[styles.input, styles.body]}
        />

        <Text style={styles.label}>Mood</Text>
        <View style={styles.moodRow}>
          {MOODS.map((item) => {
            const active = mood.trim() === item;

            return (
              <Pressable
                key={item}
                onPress={() => setMood(active ? " " : item)}
                style={[styles.moodChip, active && styles.moodChipActive]}
              >
                <Text style={styles.moodText}>{item}</Text>
              </Pressable>
            );
          })}
        </View>

        <TextInput value={mood} onChangeText={setMood} style={styles.input} />

        <Pressable
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={save}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.white}>Simpan Perubahan</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 16,
    gap: 10,
    paddingBottom: 32,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    color: "#64748B",
    marginBottom: 4,
  },
  label: {
    fontWeight: "600",
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
  },
  body: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  moodRow: {
    flexDirection: "row",
    gap: 10,
  },
  moodChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  moodChipActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  moodText: {
    fontSize: 22,
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
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
