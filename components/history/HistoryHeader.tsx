import { Platform, StyleSheet, Text, View } from 'react-native';

export function HistoryHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>Histórico de Dados</Text>
      </View>
      <Text style={styles.headerSubtitle}>Análise de padrões de radiação UV</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#4A9943',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    ...(Platform.OS === 'android'
      ? { elevation: 3 }
      : { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }),
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 },
  headerTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  headerSubtitle: { color: '#F5F5DC', fontSize: 13, fontWeight: '500' },
});
