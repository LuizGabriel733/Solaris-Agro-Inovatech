import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, Text } from 'react-native';

export function HistoryHeader() {
  return (
    <LinearGradient colors={['#1A5AD7', '#0E4ACB']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.header}>
      <Text style={styles.headerTitle}>Histórico de Dados</Text>
      <Text style={styles.headerSubtitle}>Análise de padrões de radiação UV</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 20,
    ...(Platform.OS === 'android'
      ? { elevation: 8 }
      : { shadowColor: '#0B2B66', shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } }),
  },
  headerTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', letterSpacing: 0.2 },
  headerSubtitle: { color: '#DBE7FF', fontSize: 13, marginTop: 4, fontWeight: '500' },
});
