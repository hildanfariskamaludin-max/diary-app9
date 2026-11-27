import { Stack } from "expo-router";
import { Provider } from "react-redux";
import "react-native-reanimated";

import { store } from "../src/store";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="detail/[id]" options={{ title: "Detail Diary" }} />
        <Stack.Screen name="edit/[id]" options={{ title: "Edit Diary" }} />
      </Stack>
    </Provider>
  );
}
