import { Stack } from "expo-router";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SensorProvider } from './context/SensorContext';
import { SettingsProvider } from './context/SettingsContext';

export default function RootLayout() {
  return (
    <SettingsProvider>
      <SensorProvider>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaProvider>
      </SensorProvider>
    </SettingsProvider>
  );
}
