import { Platform, StyleSheet, Text, View } from 'react-native';
import { HistoryStats } from './types';

type HistoryStatsProps = {
  stats: HistoryStats;
  isDesktopLayout: boolean;
};

export function HistoryStatsCards({ stats, isDesktopLayout }: HistoryStatsProps) {
  return (
    <View style={[styles.statsRow, isDesktopLayout && styles.statsRowDesktop]}>
      <View style={[styles.statCard, styles.statCardSuccess, isDesktopLayout && styles.statCardDesktop]}>
        <Text style={styles.statTitle}>Média do período</Text>
        <Text style={styles.statValue}>{stats.average}</Text>
        <Text style={styles.statSub}>Índice UV</Text>
      </View>
      <View style={[styles.statCard, styles.statCardDanger, isDesktopLayout && styles.statCardDesktop]}>
        <Text style={[styles.statTitle, styles.statTitleDanger]}>Pico registrado</Text>
        <Text style={[styles.statValue, styles.statValueDanger]}>{stats.peak}</Text>
        <Text style={[styles.statSub, styles.statSubDanger]}>Crítico</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  statsRowDesktop: {
    flexDirection: 'row',
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    ...(Platform.OS === 'android'
      ? { elevation: 2 }
      : { shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } }),
  },
  statCardDesktop: {
    minHeight: 120,
  },
  statCardSuccess: {
    backgroundColor: '#E9FFF1',
    borderColor: '#C7F3D6',
  },
  statCardDanger: {
    backgroundColor: '#FFEFF3',
    borderColor: '#FFD0D9',
  },
  statTitle: {
    color: '#14532D',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  statTitleDanger: {
    color: '#9F1239',
  },
  statValue: {
    color: '#0F7A3A',
    fontSize: 36,
    fontWeight: '800',
  },
  statValueDanger: {
    color: '#9F1239',
  },
  statSub: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  statSubDanger: {
    color: '#E11D48',
  },
});
