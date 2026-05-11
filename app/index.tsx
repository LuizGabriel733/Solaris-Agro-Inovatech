import { Feather } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../components/BottomNav';
import { useSensor } from './context/SensorContext';



export default function HomeScreen() {
  const pathname = usePathname();
  const {
    currentUV,
    sensorData,
    historico,
    sensorLoading,
    sensorConnected,
    loadSensor,
  } = useSensor();

  const sensorConectado = sensorConnected;
  const uvAtual = sensorLoading || !sensorConectado ? '--' : currentUV.toFixed(1);

  const alertaTexto =
    sensorConectado && currentUV >= 7
      ? 'Radiação UV alta pode prejudicar o cultivo neste horário'
      : 'Níveis de UV seguros no momento';

  const statusUv =
    sensorLoading
      ? 'Verificando sensor...'
      : sensorConectado
      ? 'Sensor conectado'
      : 'Sensor desconectado';

  const exposicaoUv = sensorLoading
    ? 'Verificando...'
    : !sensorConnected
    ? 'Indisponível'
    : currentUV >= 9
    ? 'Alta exposição'
    : currentUV >= 6
    ? 'Exposição moderada'
    : 'Baixa exposição';

  const exposureHours = useMemo(() => {
    const hours = historico.filter(item => item.uv >= 6).length;
    return hours > 0 ? `${hours}h` : '--';
  }, [historico]);

  const monthlyAverage = useMemo(() => {
    const lastMonth = historico.slice(-30);
    if (lastMonth.length === 0) return '--';
    const avg = lastMonth.reduce((sum, item) => sum + (item.uv ?? 0), 0) / lastMonth.length;
    return avg.toFixed(1);
  }, [historico]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Índice UV Atual</Text>
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
                  : sensorConectado
                  ? '#2ECC71'
                  : '#E74C3C',
              },
            ]}
          />
          <Text style={styles.headerSubtitle}>
            {sensorLoading
              ? 'Verificando sensor...'
              : sensorConectado
              ? 'Sensor conectado'
              : 'Sensor desconectado'}
          </Text>
        </View>
      </View>

      <View style={styles.contentWrapper}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.alertCard}>
            <Feather name="alert-triangle" size={20} color="#FDB813" />
            <Text style={styles.alertText}>{alertaTexto}</Text>
          </View>

          <View style={styles.mainCard}>
            <View style={styles.mainCardHeader}>
              <Text style={styles.cardTitle}>Índice UV Atual</Text>
              <Feather name="sun" size={24} color="#00CED1" />
            </View>
            
            <Text style={styles.uvValue}>{uvAtual}</Text>
            <View style={styles.badgeAtencao}>
              <Text style={styles.badgeText}>{statusUv}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Análise diária de UV das 06h às 18h</Text>

              <Text style={styles.impactValue}>
                Exposição ao UV:{' '}
                <Text
                  style={{
                    color:
                      currentUV !== undefined && currentUV >= 7
                        ? '#E67E22'
                        : '#2ECC71',
                  }}
                >
                  {exposicaoUv}
                </Text>
              </Text>
            </View>

            <View style={styles.chartPlaceholder}>
              <Text style={styles.placeholderText}>Gráfico de UV (06h-18h)</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.smallCard, styles.smallCardLeft]}>
              <Feather name="sun" size={20} color="#F59E0B" />
              <Text style={styles.smallCardTitle}>Exposição UV</Text>
              <Text style={styles.smallCardValue}>{exposureHours}</Text>
              <Text style={styles.smallCardSub}>{exposicaoUv}</Text>
            </View>
            <View style={[styles.smallCard, styles.smallCardSecondary, styles.smallCardRight]}>
              <Feather name="calendar" size={20} color="#4A9943" />
              <Text style={styles.smallCardTitle}>Média mensal</Text>
              <Text style={styles.smallCardValue}>{monthlyAverage}</Text>
              <Text style={styles.smallCardSub}>UV médio</Text>
            </View>
          </View>

          <View style={styles.recommendationCard}>
            <View style={styles.blueBar} />

            <View style={{ flex: 1 }}>
              <Text style={styles.recommendationTitle}>
                Recomendação Agrícola
              </Text>

              <Text style={styles.recommendationText}>
                Monitorar o cultivo entre 10h e 14h, pois normalmente é o período
                com maior incidência de radiação UV. Considere sombreamento parcial
                durante os picos de UV.
              </Text>
            </View>
          </View>
        </ScrollView>

        <BottomNav currentRoute={pathname} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    backgroundColor: '#4A9943', 
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 25, 
    borderBottomRightRadius: 25
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { color: '#F5F5DC', fontSize: 13, fontWeight: '500' },
  statusBadge: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00CED1', marginRight: 6 },
  syncButton: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 15, alignItems: 'center' },
  contentWrapper: { flex: 1, flexDirection: 'column' },
  scrollContent: { padding: 20 },
  
  alertCard: { backgroundColor: '#F5F5DC', padding: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#FDB813' },
  alertText: { color: '#4A9943', fontSize: 13, marginLeft: 10, flex: 1 },

  mainCard: { backgroundColor: 'white', padding: 20, borderRadius: 20, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, marginBottom: 20 },
  mainCardHeader: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  uvValue: { fontSize: 64, fontWeight: 'bold', color: '#2C3E50' },
  badgeAtencao: { backgroundColor: '#FDB813', paddingHorizontal: 20, paddingVertical: 5, borderRadius: 15, marginBottom: 15 },
  badgeText: { color: '#FFFFFF', fontWeight: 'bold' },
  infoRow: { width: '100%', marginTop: 10 },
  label: { color: '#7F8C8D', fontSize: 13, marginBottom: 8 },
  impactValue: { color: '#2C3E50', fontSize: 13, fontWeight: '600' },
  
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  row: { flexDirection: 'row', marginTop: 20 },
  smallCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 20,
    elevation: 2,
    marginBottom: 20,
  },
  smallCardLeft: {
    marginRight: 12,
  },
  smallCardRight: {
    marginLeft: 0,
  },
  smallCardSecondary: {
    backgroundColor: '#ECFDF5',
  },
  smallCardTitle: { fontSize: 12, color: '#7F8C8D', marginTop: 5 },
  smallCardValue: { fontSize: 20, fontWeight: 'bold', marginVertical: 2 },
  smallCardSub: { fontSize: 10, color: '#95A5A6' },

  recommendationCard: { backgroundColor: '#F5F5DC', padding: 20, borderRadius: 15, marginTop: 20, flexDirection: 'row' },
  blueBar: { width: 4, backgroundColor: '#00CED1', borderRadius: 2, marginRight: 15 },
  recommendationTitle: { fontWeight: 'bold', color: '#4A9943', marginBottom: 5 },
  recommendationText: { color: '#4A9943', fontSize: 13, lineHeight: 18 },
  
  chartPlaceholder: { width: '100%', height: 100, backgroundColor: '#F5F5DC', marginTop: 20, justifyContent: 'center', alignItems: 'center', borderRadius: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: '#FDB813' },
  placeholderText: { color: '#BDC3C7', fontSize: 13 },
});
