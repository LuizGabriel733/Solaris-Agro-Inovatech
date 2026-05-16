import { Feather } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../components/BottomNav';
import { HistoryChartCard } from '../components/history/HistoryChartCard';
import { HistoryStatsCards } from '../components/history/HistoryStats';
import { PeriodFilterSelector } from '../components/history/PeriodFilter';
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
  const { historico, sensorLoading, sensorConnected, loadSensor } = useSensor();

  const currentData = useMemo(() => {
    // 1. Filtrar dados pelo período selecionado
    const now = new Date();
    const periodData = historico.filter((item) => {
      const itemDate = new Date(item.atualizadoEm);
      const diffMs = now.getTime() - itemDate.getTime();
      
      if (selectedPeriod === 'today') {
        return diffMs <= 24 * 60 * 60 * 1000;
      } else if (selectedPeriod === '7d') {
        return diffMs <= 7 * 24 * 60 * 60 * 1000;
      } else { // 30d
        return diffMs <= 30 * 24 * 60 * 60 * 1000;
      }
    });

    // Se não tem dados no período, retorna array vazio
    if (periodData.length === 0) {
      return [];
    }

    // 2. Agrupar dados conforme o período
    const groupedData: Record<string, { sum: number; count: number }> = {};
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    periodData.forEach((item) => {
      const date = new Date(item.atualizadoEm);
      const valor = item.valor ?? item.uv ?? 0;
      let label: string;

      if (selectedPeriod === 'today') {
        // Agrupar por hora para hoje, apenas entre 6h e 18h
        const hour = date.getHours();
        if (hour < 6 || hour > 18) return;
        label = `${String(hour).padStart(2, '0')}:00`;
      } else if (selectedPeriod === '7d') {
        // Agrupar por dia da semana
        label = dayNames[date.getDay()];
      } else { // 30d
        // Agrupar por dia do mês
        label = `D${date.getDate()}`;
      }

      if (!groupedData[label]) {
        groupedData[label] = { sum: 0, count: 0 };
      }
      groupedData[label].sum += valor;
      groupedData[label].count += 1;
    });

    // 3. Converter para array de dados e calcular média
    let aggregated = Object.entries(groupedData).map(([label, values]) => ({
      label,
      valor: values.sum / values.count,
      isCritical: (values.sum / values.count) >= 8,
    }));

    // 4. Ordenar os dados cronologicamente
    if (selectedPeriod === 'today') {
      aggregated.sort((a, b) => parseInt(a.label) - parseInt(b.label));
    } else if (selectedPeriod === '7d') {
      const dayOrder = { 'Dom': 0, 'Seg': 1, 'Ter': 2, 'Qua': 3, 'Qui': 4, 'Sex': 5, 'Sáb': 6 };
      aggregated.sort((a, b) => (dayOrder[a.label as keyof typeof dayOrder] ?? 0) - (dayOrder[b.label as keyof typeof dayOrder] ?? 0));
    } else { // 30d
      aggregated.sort((a, b) => parseInt(a.label.substring(1)) - parseInt(b.label.substring(1)));
    }

    return aggregated;
  }, [historico, selectedPeriod]);

  const maxDataValue = useMemo(() => 
    currentData.length > 0 ? Math.max(...currentData.map((item) => item.valor), 12) : 12, 
  [currentData]);
  const stats = useMemo(() => 
    currentData.length > 0 ? calculateStats(currentData) : { average: '--', peak: '--', criticalCount: 0 }, 
  [currentData]);

  const hasData = currentData.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.screen}>
        {/* Header similar à página inicial */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Histórico UV</Text>
            <TouchableOpacity style={styles.syncButton} onPress={loadSensor}>
              <Feather name="refresh-cw" size={16} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: sensorLoading
                    ? '#F1C40F'
                    : sensorConnected
                    ? '#2ECC71'
                    : '#E74C3C',
                },
              ]}
            />
            <Text style={styles.headerSubtitle}>
              {sensorLoading
                ? 'Verificando dados de histórico do sensor...'
                : sensorConnected
                ? historico.length > 0
                  ? `${historico.length} registros de histórico`
                  : 'Sensor conectado - nenhum dado de histórico registrado'
                : 'Sensor desconectado'}
            </Text>
          </View>
        </View>

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

          {sensorLoading ? (
            // Estado de carregamento
            <View style={styles.placeholderCard}>
              <Feather name="loader" size={32} color="#9CA3AF" />
              <Text style={styles.placeholderText}>Carregando histórico...</Text>
            </View>
          ) : !sensorConnected ? (
            // Sensor desconectado
            <View style={styles.placeholderCard}>
              <Feather name="wifi-off" size={32} color="#9CA3AF" />
              <Text style={styles.placeholderText}>Sensor desconectado</Text>
              <Text style={styles.placeholderSubtext}>Conecte o sensor para visualizar o histórico</Text>
            </View>
          ) : !hasData ? (
            // Sem dados no período selecionado
            <View style={styles.placeholderCard}>
              <Feather name="calendar" size={32} color="#9CA3AF" />
              <Text style={styles.placeholderText}>Nenhum dado de histórico para este período</Text>
              <Text style={styles.placeholderSubtext}>
                {selectedPeriod === 'today' ? 'Aguardando novos registros' :
                 selectedPeriod === '7d' ? 'Tente selecionar um período menor' :
                 'Verifique se há dados registrados'}
              </Text>
            </View>
          ) : (
            // Dados disponíveis
            <>
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
            </>
          )}
        </ScrollView>
        <BottomNav currentRoute={pathname} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  screen: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  // Estilos do header similar à página inicial
  header: { 
    backgroundColor: '#4A9943', 
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 25, 
    borderBottomRightRadius: 25
  },
  headerTop: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    gap: 10, 
    marginBottom: 8 
  },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { color: '#F5F5DC', fontSize: 13, fontWeight: '500' },
  statusBadge: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00CED1', marginRight: 6 },
  syncButton: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 15, alignItems: 'center' },
  // Estilos do placeholder card
  placeholderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12,
  },
  placeholderText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  placeholderSubtext: {
    color: '#9CA3AF',
    fontSize: 13,
    textAlign: 'center',
  },
});
