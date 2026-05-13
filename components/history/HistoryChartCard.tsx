import { Feather } from '@expo/vector-icons';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { LineUVChart } from './charts/LineUVChart';
import { PeriodFilter, UVPoint } from './types';

type HistoryChartCardProps = {
  selectedPeriod: PeriodFilter;
  data: UVPoint[];
  selectedPointIndex: number;
  onSelectPointIndex: (index: number) => void;
  chartWidth: number;
  chartHeight: number;
  maxDataValue: number;
  hideHeader?: boolean;
  hideCard?: boolean;
  lineColor?: string;
};

export function HistoryChartCard({
  selectedPeriod,
  data,
  selectedPointIndex,
  onSelectPointIndex,
  chartWidth,
  chartHeight,
  maxDataValue,
  hideHeader = false,
  hideCard = false,
  lineColor,
}: HistoryChartCardProps) {
  const selectedPoint = data[selectedPointIndex] ?? data[0];
  const title =
    selectedPeriod === 'today'
      ? 'UV ao longo do dia'
      : selectedPeriod === '7d'
      ? 'UV médio semanal'
      : 'UV médio mensal';

  return (
    <View style={hideCard ? null : styles.chartCard}>
      
      {/* Só mostra o título se hideHeader for false */}
      {!hideHeader && (
        <View style={styles.chartTitleRow}>
          <Text style={styles.cardTitle}>{title}</Text>
          <View style={styles.iconWrap}>
            <Feather name="calendar" size={16} color="#6B7280" />
          </View>
        </View>
      )}

      <LineUVChart
        data={data}
        selectedIndex={selectedPointIndex}
        onSelectIndex={onSelectPointIndex}
        chartWidth={chartWidth}
        chartHeight={chartHeight}
        maxDataValue={maxDataValue}
        lineColor={lineColor}
      />

      {/* Na Home (Figma), geralmente não tem esse caption embaixo, você pode esconder se quiser */}
      {!hideHeader && (
        <Text style={styles.selectionCaption}>
          {selectedPoint?.label}: {selectedPoint?.valor.toFixed(1)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    ...(Platform.OS === 'android'
      ? { elevation: 4 }
      : { shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } }),
  },
  chartTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 16,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  selectionCaption: {
    marginTop: 12,
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
});