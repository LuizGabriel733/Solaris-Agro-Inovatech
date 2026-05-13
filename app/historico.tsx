import { usePathname } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../components/BottomNav';
import { HistoryChartCard } from '../components/history/HistoryChartCard';
import { HistoryHeader } from '../components/history/HistoryHeader';
import { HistoryInsightCard } from '../components/history/HistoryInsight';
import { HistoryStatsCards } from '../components/history/HistoryStats';
import { PeriodFilterSelector } from '../components/history/PeriodFilter';
import { getDataByPeriod } from '../components/history/data';
import { PeriodFilter } from '../components/history/types';
import { calculateStats } from '../components/history/utils';
import { useSensor } from './context/SensorContext';

export default function HistoryScreen() {
  const pathname = usePathname();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('today');
  const [selectedPointIndex, setSelectedPointIndex] = useState<number>(0);
  const { width } = useWindowDimensions();

  const isDesktopLayout = width >= 860;
  const contentWidth = Math.min(width - 32, 1040);
  const chartHeight = 190;
  const { historico } = useSensor();

  const currentData = useMemo(() => {
    // 1. Processamento e Normalização com correção de fuso para Manaus
    const sensorHistory = historico
      .map((item: any) => {
        const dataLocal = new Date(item.atualizadoEm);
        return {
          // Garante o formato HH:00 para o gráfico identificar os eixos
          label: dataLocal.getHours().toString().padStart(2, '0') + ':00',
          valor: item.valor,
          isCritical: item.valor >= 8,
          timestamp: dataLocal.getTime(),
        };
      })
      // 2. Filtro de segurança: Garante que os pontos apareçam no intervalo visível do gráfico
      .filter(point => {
        const hora = parseInt(point.label.split(':')[0]);
        return hora >= 6 && hora <= 18;
      })
      .sort((a, b) => a.timestamp - b.timestamp) // Garante ordem cronológica
      .slice(-15); // Aumentado um pouco o limite para preencher o gráfico

    if (sensorHistory.length === 0) {
      return getDataByPeriod(selectedPeriod);
    }

    if (selectedPeriod === 'today') {
      return sensorHistory;
    }

    // 3. Agregação para períodos maiores (7d, 30d)
    const grouped = sensorHistory.reduce<Record<string, { sum: number; count: number }>>((acc, point) => {
      acc[point.label] = acc[point.label] || { sum: 0, count: 0 };
      acc[point.label].sum += point.valor;
      acc[point.label].count += 1;
      return acc;
    }, {});

    const aggregated = Object.entries(grouped).map(([label, values]) => ({
      label,
      valor: values.sum / values.count,
      isCritical: values.sum / values.count >= 8,
    }));

    return aggregated.length > 0 ? aggregated : getDataByPeriod(selectedPeriod);
  }, [historico, selectedPeriod]);

  const maxDataValue = useMemo(() => Math.max(...currentData.map((item) => item.valor), 12), [currentData]);
  const stats = useMemo(() => calculateStats(currentData), [currentData]);

  const selectedPoint = currentData[selectedPointIndex] ?? currentData[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.screen}>
        <HistoryHeader />

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { width: contentWidth, alignSelf: 'center' }]}
          showsVerticalScrollIndicator={false}
        >
          <PeriodFilterSelector
            selectedPeriod={selectedPeriod}
            onSelectPeriod={(period) => {
              setSelectedPeriod(period);
              setSelectedPointIndex(0);
            }}
          />

          <HistoryChartCard
            selectedPeriod={selectedPeriod}
            data={currentData}
            selectedPointIndex={selectedPointIndex}
            onSelectPointIndex={setSelectedPointIndex}
            chartWidth={Math.max(contentWidth - 72, 260)}
            chartHeight={chartHeight}
            maxDataValue={maxDataValue}
          />

          <HistoryStatsCards stats={stats} isDesktopLayout={isDesktopLayout} />

          <HistoryInsightCard
            statsCriticalCount={stats.criticalCount}
            selectedPeriod={selectedPeriod}
            selectedPoint={selectedPoint}
            data={currentData}
          />
        </ScrollView>
        <BottomNav currentRoute={pathname} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  screen: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});