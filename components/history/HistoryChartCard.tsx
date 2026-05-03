import { Feather } from '@expo/vector-icons';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { BarUVChart } from './charts/BarUVChart';
import { LineUVChart } from './charts/LineUVChart';
import { PeriodFilter, UVPoint } from './types';

// Adicionamos as novas props opcionais (?) aqui
type HistoryChartCardProps = {
  selectedPeriod: PeriodFilter;
  data: UVPoint[];
  selectedPointIndex: number;
  onSelectPointIndex: (index: number) => void;
  chartWidth: number;
  chartHeight: number;
  maxDataValue: number;
  hideHeader?: boolean; // Opcional
  hideCard?: boolean;   // Opcional
  lineColor?: string;   // Opcional
};

export function HistoryChartCard({
  selectedPeriod,
  data,
  selectedPointIndex,
  onSelectPointIndex,
  chartWidth,
  chartHeight,
  maxDataValue,
  hideHeader = false, // Valor padrão
  hideCard = false,   // Valor padrão
  lineColor,          // Se vier, passamos para o gráfico
}: HistoryChartCardProps) {
  const selectedPoint = data[selectedPointIndex] ?? data[0];

  return (
    // Se hideCard for true, removemos o estilo de card (sombra e fundo branco)
    <View style={hideCard ? null : styles.chartCard}>
      
      {/* Só mostra o título se hideHeader for false */}
      {!hideHeader && (
        <View style={styles.chartTitleRow}>
          <Text style={styles.cardTitle}>
            {selectedPeriod === 'today' ? 'UV ao longo do dia' : `Índice UV médio`}
          </Text>
          <View style={styles.iconWrap}>
            <Feather name="calendar" size={16} color="#6B7280" />
          </View>
        </View>
      )}

      {selectedPeriod === 'today' ? (
        <LineUVChart
          data={data}
          selectedIndex={selectedPointIndex}
          onSelectIndex={onSelectPointIndex}
          chartWidth={chartWidth}
          chartHeight={chartHeight}
          maxDataValue={maxDataValue}
          // Verifique se o LineUVChart aceita a prop 'color' ou 'stroke'
        />
      ) : (
        <BarUVChart
          data={data}
          selectedIndex={selectedPointIndex}
          onSelectIndex={onSelectPointIndex}
          maxDataValue={maxDataValue}
          chartWidth={chartWidth}
          chartHeight={chartHeight}
        />
      )}

      {/* Na Home (Figma), geralmente não tem esse caption embaixo, você pode esconder se quiser */}
      {!hideHeader && (
        <Text style={styles.selectionCaption}>
          {selectedPoint?.label}: {selectedPoint?.value.toFixed(1)}
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