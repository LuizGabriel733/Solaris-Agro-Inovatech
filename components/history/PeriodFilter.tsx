import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getPeriodLabel } from './data';
import { PeriodFilter } from './types';

type PeriodFilterProps = {
  selectedPeriod: PeriodFilter;
  onSelectPeriod: (period: PeriodFilter) => void;
};

export function PeriodFilterSelector({ selectedPeriod, onSelectPeriod }: PeriodFilterProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.filterRow}>
        {(['today', '7d', '30d'] as PeriodFilter[]).map((period) => {
          const active = selectedPeriod === period;
          return (
            <TouchableOpacity
              key={period}
              style={[styles.filterButton, active && styles.filterButtonActive]}
              onPress={() => onSelectPeriod(period)}
              activeOpacity={0.9}
            >
              <Text style={[styles.filterButtonText, active && styles.filterButtonTextActive]}>
                {getPeriodLabel(period)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginBottom: 14,
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 6,
    width: '100%',
    maxWidth: 420,
    ...(Platform.OS === 'android'
      ? { elevation: 3 }
      : { shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } }),
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#4A9943',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
});
