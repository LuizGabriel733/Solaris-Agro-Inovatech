import { usePathname } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
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

  // Check if we have sufficient real data
  const now = Date.now();
  const periodMs = selectedPeriod === '7d' 
    ? 7 * 24 * 60 * 60 * 1000 
    : selectedPeriod === '30d' 
    ? 30 * 24 * 60 * 60 * 1000 
    : 24 * 60 * 60 * 1000;
  
  const hasRecentData = historico.some(item => 
    (now - new Date(item.atualizadoEm).getTime()) <= periodMs
  ) && historico.length >= 2;

  const currentData = useMemo(() => {
    const now = Date.now();
    
    // Determine period range in milliseconds
    let periodMs = 24 * 60 * 60 * 1000; // Default: 1 day
    if (selectedPeriod === '7d') periodMs = 7 * 24 * 60 * 60 * 1000;
    if (selectedPeriod === '30d') periodMs = 30 * 24 * 60 * 60 * 1000;
    
    const startTime = now - periodMs;
    
    // Filter data within period
    const periodData = historico.filter(item => {
      const itemTime = new Date(item.atualizadoEm).getTime();
      return itemTime >= startTime;
    });

    // If not enough real data, use mock data
    if (periodData.length < 2) {
      return getDataByPeriod(selectedPeriod);
    }

    // Aggregate based on period
    let groupedData: Record<string, { sum: number; count: number }> = {};

    if (selectedPeriod === 'today') {
      // Group by hour for today
      periodData.forEach(item => {
        const date = new Date(item.atualizadoEm);
        const hour = date.getHours();
        const label = `${String(hour).padStart(2, '0')}:00`;
        if (!groupedData[label]) groupedData[label] = { sum: 0, count: 0 };
        groupedData[label].sum += item.uv;
        groupedData[label].count += 1;
      });
    } else if (selectedPeriod === '7d') {
      // Group by day of week
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      periodData.forEach(item => {
        const date = new Date(item.atualizadoEm);
        const label = dayNames[date.getDay()];
        if (!groupedData[label]) groupedData[label] = { sum: 0, count: 0 };
        groupedData[label].sum += item.uv;
        groupedData[label].count += 1;
      });
    } else {
      // Group by day of month for 30d
      periodData.forEach(item => {
        const date = new Date(item.atualizadoEm);
        const day = date.getDate();
        const label = `D${day}`;
        if (!groupedData[label]) groupedData[label] = { sum: 0, count: 0 };
        groupedData[label].sum += item.uv;
        groupedData[label].count += 1;
      });
    }

    const aggregated = Object.entries(groupedData).map(([label, values]) => ({
      label,
      value: Math.round((values.sum / values.count) * 10) / 10,
      isCritical: values.sum / values.count >= 8,
    }));

    // Sort data chronologically
    if (selectedPeriod === 'today') {
      aggregated.sort((a, b) => parseInt(a.label) - parseInt(b.label));
    } else if (selectedPeriod === '7d') {
      const dayOrder = { 'Dom': 0, 'Seg': 1, 'Ter': 2, 'Qua': 3, 'Qui': 4, 'Sex': 5, 'Sáb': 6 };
      aggregated.sort((a, b) => (dayOrder[a.label as keyof typeof dayOrder] ?? 0) - (dayOrder[b.label as keyof typeof dayOrder] ?? 0));
    } else {
      aggregated.sort((a, b) => parseInt(a.label.substring(1)) - parseInt(b.label.substring(1)));
    }

    return aggregated.length > 0 ? aggregated : getDataByPeriod(selectedPeriod);
  }, [historico, selectedPeriod]);

  const maxDataValue = useMemo(() => Math.max(...currentData.map((item) => item.value), 10), [currentData]);
  const stats = useMemo(() => calculateStats(currentData), [currentData]);

  const selectedPoint = currentData[selectedPointIndex] ?? currentData[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.screen}>
        <HistoryHeader isUsingMockData={!hasRecentData} />

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { width: contentWidth, alignSelf: 'center' }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Data info card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardText}>
              {hasRecentData 
                ? `📊 ${historico.length} pontos de dados | Período: ${selectedPeriod === 'today' ? 'Últimas 24h' : selectedPeriod === '7d' ? 'Últimos 7 dias' : 'Últimos 30 dias'}`
                : `ℹ️ Sem dados reais. Exibindo dados de exemplo para ${selectedPeriod === 'today' ? 'hoje' : selectedPeriod === '7d' ? '7 dias' : '30 dias'}`
              }
            </Text>
          </View>

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
  infoCard: { backgroundColor: '#E8F5E9', borderRadius: 12, padding: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#4A9943' },
  infoCardText: { fontSize: 13, color: '#2E7D32', fontWeight: '500' },
});
