import { Stack } from "expo-router";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsProvider } from './context/SettingsContext';

export default function RootLayout() {
  return (
    <SettingsProvider>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </SettingsProvider>
  );
}
