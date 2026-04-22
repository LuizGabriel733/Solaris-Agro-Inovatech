import { usePathname } from 'expo-router';
import { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { BottomNav } from '../components/BottomNav';
import { HistoryChartCard } from '../components/history/HistoryChartCard';
import { HistoryHeader } from '../components/history/HistoryHeader';
import { HistoryInsightCard } from '../components/history/HistoryInsight';
import { HistoryStatsCards } from '../components/history/HistoryStats';
import { PeriodFilterSelector } from '../components/history/PeriodFilter';
import { getDataByPeriod } from '../components/history/data';
import { PeriodFilter } from '../components/history/types';
import { calculateStats } from '../components/history/utils';

export default function HistoryScreen() {
  // [Implementacao por Arthur Junior] Estado global da tela para periodo e ponto selecionado.
  const pathname = usePathname();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('today');
  const [selectedPointIndex, setSelectedPointIndex] = useState<number>(0);
  const { width } = useWindowDimensions();

  const isDesktopLayout = width >= 860;
  const contentWidth = Math.min(width - 32, 1040);
  const chartHeight = 190;
  const currentData = useMemo(() => getDataByPeriod(selectedPeriod), [selectedPeriod]);
  const maxDataValue = useMemo(() => Math.max(...currentData.map((item) => item.value), 10), [currentData]);
  const stats = useMemo(() => calculateStats(currentData), [currentData]);

  const selectedPoint = currentData[selectedPointIndex] ?? currentData[0];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screen}>
        <HistoryHeader />

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { width: contentWidth, alignSelf: 'center' }]}
          showsVerticalScrollIndicator={false}
        >
          {/* [Implementacao por Arthur Junior] Filtro desacoplado para evolucao de periodos/custom date range. */}
          <PeriodFilterSelector
            selectedPeriod={selectedPeriod}
            onSelectPeriod={(period) => {
              setSelectedPeriod(period);
              setSelectedPointIndex(0);
            }}
          />

          {/* [Implementacao por Arthur Junior] Card de visualizacao com troca transparente entre linha e barras. */}
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
