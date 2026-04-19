import { Feather } from '@expo/vector-icons';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function HistoryBottomNav() {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem}>
        <Feather name="home" size={18} color="#9AA7B7" />
        <Text style={styles.navText}>Início</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Feather name="bar-chart-2" size={18} color="#1A5AD7" />
        <Text style={[styles.navText, styles.navTextActive]}>Histórico</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Feather name="alert-circle" size={18} color="#9AA7B7" />
        <Text style={styles.navText}>Alertas</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Feather name="settings" size={18} color="#9AA7B7" />
        <Text style={styles.navText}>Config.</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 8,
    ...(Platform.OS === 'android'
      ? { elevation: 12 }
      : { shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: -6 } }),
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 68,
    gap: 2,
  },
  navText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  navTextActive: {
    color: '#1A5AD7',
  },
});
