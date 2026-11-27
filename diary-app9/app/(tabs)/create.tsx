import { useRouter } from "expo-router";
import { useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";

import { addDiary } from "../../src/diarySlice";
import { useAppDispatch } from "../../src/hooks";

const MOODS = ["😀", "🙂", "😐", "😔", "😠"];

export default function CreateScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mood, setMood] = useState(" ");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (saving) return;

    if (!title.trim() || !body.trim()) {
      Alert.alert("Validasi", "Judul dan isi wajib diisi");
      return;
    }

    setSaving(true);

    try {
      await dispatch(
        addDiary({
          title: title.trim(),
          diary_date: new Date().toISOString().slice(0, 10),
          body: body.trim(),
          mood,
        })
      ).unwrap();

      setTitle("");
      setBody("");
      setMood(" ");

      router.replace("/");
    } catch {
      Alert.alert("Error", "Diary gagal disimpan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.header}>Tambah Diary</Text>
          <Text style={styles.subtitle}>
            Tulis kejadian hari ini, lalu simpan.
          </Text>

          <Text style={styles.label}>Judul</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Judul diary"
            style={styles.input}
          />

          <Text style={styles.label}>Isi diary</Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Ceritakan harimu..."
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

          <TextInput
            value={mood}
            onChangeText={setMood}
            placeholder="Atau tulis mood sendiri"
            style={styles.input}
          />

          <Pressable
            style={[styles.button, saving && styles.buttonDisabled]}
            onPress={save}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.white}>Simpan</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  flex: {
    flex: 1,
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
});
