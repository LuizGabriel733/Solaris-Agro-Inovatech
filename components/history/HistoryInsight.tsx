import { Feather } from '@expo/vector-icons';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { PeriodFilter, UVPoint } from './types';

type HistoryInsightProps = {
  statsCriticalCount: number;
  selectedPeriod: PeriodFilter;
  selectedPoint: UVPoint;
  data: UVPoint[];
};

export function HistoryInsightCard({ statsCriticalCount, selectedPeriod, selectedPoint, data }: HistoryInsightProps) {
  const peakPoint = data.reduce((best, current) => (current.value > best.value ? current : best), data[0] ?? selectedPoint);
  const isCritical = peakPoint.value >= 8;
  const title = selectedPeriod === '7d' ? 'Destaques da Semana' : selectedPeriod === '30d' ? 'Destaques do Mês' : 'Dica';

  return (
    <View style={styles.wrapper}>
      {selectedPeriod === 'today' ? (
        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Feather name="info" size={14} color="#1D4ED8" />
          </View>
          <Text style={styles.tipText}>
            Dica: Períodos de UV elevado (acima de 8) indicam maior risco de estresse nas plantas. Considere ajustar o manejo
            do cultivo nesses horários.
          </Text>
        </View>
      ) : (
        <View style={styles.highlightsCard}>
          <View style={styles.highlightsHeader}>
            <View style={styles.highlightsTitleRow}>
              <Feather name="trending-up" size={16} color="#0F172A" />
              <Text style={styles.highlightsTitle}>{title}</Text>
            </View>
          </View>

          <View style={[styles.highlightBox, isCritical ? styles.highlightBoxCritical : styles.highlightBoxNeutral]}>
            <View style={[styles.highlightIconWrap, isCritical ? styles.highlightIconCritical : styles.highlightIconNeutral]}>
              <Feather name={isCritical ? 'alert-circle' : 'check-circle'} size={16} color={isCritical ? '#E11D48' : '#16A34A'} />
            </View>
            <View style={styles.highlightTextWrap}>
              <Text style={[styles.highlightTitle, isCritical ? styles.highlightTitleCritical : styles.highlightTitleNeutral]}>
                {peakPoint.label} - {isCritical ? 'Pico de UV crítico' : 'Pico do período'}
              </Text>
              <Text style={[styles.highlightSub, isCritical ? styles.highlightSubCritical : styles.highlightSubNeutral]}>
                Índice UV {Math.round(peakPoint.value)}{isCritical ? ' - Alto risco ao cultivo' : ' - Dentro do esperado'}
              </Text>
            </View>
          </View>

          <Text style={styles.highlightsFooter}>
            {statsCriticalCount > 0 ? `${statsCriticalCount} ocorrência(s) acima de 8 no período.` : 'Nenhuma ocorrência crítica (>= 8) no período.'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 18,
  },
  tipCard: {
    backgroundColor: '#F5F5DC',
    borderColor: '#FDB813',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    ...(Platform.OS === 'android'
      ? { elevation: 2 }
      : { shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } }),
  },
  tipIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#66B032',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    color: '#4A9943',
    lineHeight: 18,
    fontSize: 13,
    fontWeight: '600',
  },
  highlightsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    ...(Platform.OS === 'android'
      ? { elevation: 4 }
      : { shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } }),
  },
  highlightsHeader: {
    marginBottom: 12,
  },
  highlightsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  highlightsTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },
  highlightBox: {
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
  },
  highlightBoxCritical: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FDA4AF',
  },
  highlightBoxNeutral: {
    backgroundColor: '#EAF6E5',
    borderColor: '#66B032',
  },
  highlightIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  highlightIconCritical: {
    backgroundColor: '#FFE4E6',
    borderColor: '#FDA4AF',
  },
  highlightIconNeutral: {
    backgroundColor: '#D6F1D3',
    borderColor: '#66B032',
  },
  highlightTextWrap: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  highlightTitleCritical: {
    color: '#9F1239',
  },
  highlightTitleNeutral: {
    color: '#4A9943',
  },
  highlightSub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '700',
  },
  highlightSubCritical: {
    color: '#E11D48',
  },
  highlightSubNeutral: {
    color: '#66B032',
  },
  highlightsFooter: {
    marginTop: 10,
    color: '#4A9943',
    fontSize: 12,
    fontWeight: '600',
  },
});
