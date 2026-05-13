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

  // Verificação de dados recentes
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
    // 1. Processamento e Normalização
    const sensorHistory = historico
      .map((item: any) => {
        const dataLocal = new Date(item.atualizadoEm);
        return {
          label: dataLocal.getHours().toString().padStart(2, '0') + ':00',
          valor: item.valor,
          isCritical: item.valor >= 8,
          timestamp: dataLocal.getTime(),
        };
      })
      // Filtro para o horário de operação do gráfico (06h às 18h)
      .filter(point => {
        const hora = parseInt(point.label.split(':')[0]);
        return hora >= 6 && hora <= 18;
      })
      .sort((a, b) => a.timestamp - b.timestamp);

    if (sensorHistory.length === 0) {
      return getDataByPeriod(selectedPeriod);
    }

    if (selectedPeriod === 'today') {
      return sensorHistory.slice(-15);
    }

    // 2. Agregação para 7d e 30d (Usando a variável correta: grouped)
    const grouped = sensorHistory.reduce<Record<string, { sum: number; count: number }>>((acc, point) => {
      acc[point.label] = acc[point.label] || { sum: 0, count: 0 };
      acc[point.label].sum += point.valor;
      acc[point.label].count += 1;
      return acc;
    }, {});

    const aggregated = Object.entries(grouped).map(([label, values]) => ({
      label,
      valor: values.sum / values.count,
      isCritical: (values.sum / values.count) >= 8,
    }));

    // 3. Ordenação Cronológica Final
    if (selectedPeriod === '7d') {
      const dayOrder = { 'Dom': 0, 'Seg': 1, 'Ter': 2, 'Qua': 3, 'Qui': 4, 'Sex': 5, 'Sáb': 6 };
      aggregated.sort((a, b) => (dayOrder[a.label as keyof typeof dayOrder] ?? 0) - (dayOrder[b.label as keyof typeof dayOrder] ?? 0));
    } else {
      // Para hoje ou 30d (baseado em números/strings)
      aggregated.sort((a, b) => a.label.localeCompare(b.label));
    }

    return aggregated.length > 0 ? aggregated : getDataByPeriod(selectedPeriod);
  }, [historico, selectedPeriod]);

  const maxDataValue = useMemo(() => Math.max(...currentData.map((item) => item.valor), 12), [currentData]);
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
          <View style={styles.infoCard}>
            <Text style={styles.infoCardText}>
              {hasRecentData 
                ? `📊 ${historico.length} pontos de dados | Período: ${selectedPeriod === 'today' ? 'Últimas 24h' : selectedPeriod === '7d' ? 'Últimos 7 dias' : 'Últimos 30 dias'}`
                : `ℹ️ Sem dados reais recentes. Exibindo exemplos.`
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