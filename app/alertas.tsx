import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { usePathname } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../components/BottomNav';
import { useSensor } from './context/SensorContext';

interface Alert {
  id: string;
  icon: string;
  title: string;
  time: string;
  color: string;
  bgColor: string;
  isNew: boolean;
}

const AlertCard = ({ icon, title, time, color, bgColor, isNew }: any) => (
  <View style={[styles.alertCard, { backgroundColor: bgColor }]}>
    <View style={styles.alertContent}>
      <Ionicons name={icon} size={20} color={color} />
      <View style={styles.alertTextContainer}>
        <Text style={[styles.alertTitle, { color: color }]}>{title}</Text>
        <Text style={styles.alertTime}>{time}</Text>
      </View>
      {isNew && <View style={styles.dot} />}
    </View>
  </View>
);

export default function AlertsScreen() {
  const pathname = usePathname();
  const {
    currentUV,
    sensorData,
    sensorLoading,
    sensorConnected,
    activeAlerts,
    uvThreshold,
    setUvThreshold,
    uvbAlerts,
    setUvbAlerts,
    alertsEnabled,
    setAlertsEnabled,
    clearAlerts,
    loadSensor,
  } = useSensor();

  const uvDisplay = sensorConnected ? currentUV.toFixed(1) : '--';
  const lastUpdated = sensorData?.atualizadoEm
    ? new Date(sensorData.atualizadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '--';
  const statusText = sensorLoading
    ? 'Verificando sensor...'
    : sensorConnected
    ? 'Sensor conectado'
    : 'Sensor desconectado';

  const alertMessage = currentUV >= uvThreshold
    ? 'UV alto no momento — verifique os alertas.'
    : 'UV dentro do limite configurado.';

  const handleClearAlerts = () => {
    clearAlerts();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Alertas</Text>
            <View style={styles.headerBadgeGroup}>
              <View style={styles.badge}><Text style={styles.badgeText}>{activeAlerts.length}</Text></View>
              <TouchableOpacity style={styles.refreshButton} onPress={loadSensor}>
                <Ionicons name="refresh" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>Notificações e configurações</Text>
          <Text style={styles.sensorStatus}>{statusText}</Text>
          <Text style={styles.updateText}>Última atualização: {lastUpdated}</Text>
          <View style={styles.sensorSummary}>
            <Text style={styles.sensorSummaryLabel}>Último UV</Text>
            <Text style={styles.sensorSummaryValue}>{uvDisplay}</Text>
            <Text style={styles.sensorSummaryNote}>{alertMessage}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Seção de Alertas Recentes */}
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications-outline" size={20} color="#333" />
            <Text style={styles.sectionTitleText}>Alertas Recentes</Text>
          </View>

          {activeAlerts.length === 0 ? (
            <Text style={styles.noAlertsText}>Nenhum alerta ativo no momento.</Text>
          ) : (
            activeAlerts.map(alert => (
              <AlertCard
                key={alert.id}
                icon={alert.icon}
                title={alert.title}
                time={alert.time}
                color={alert.color}
                bgColor={alert.bgColor}
                isNew={alert.isNew}
              />
            ))
          )}

          <TouchableOpacity style={styles.clearButton} onPress={handleClearAlerts}>
            <Text style={styles.clearButtonText}>Limpar alertas</Text>
          </TouchableOpacity>

          <View style={styles.configCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="settings-outline" size={20} color="#333" />
              <Text style={styles.sectionTitleText}>Configuração de Alertas</Text>
            </View>

            <View style={styles.row}>
              <View>
                <Text style={styles.label}>Alertas ativos</Text>
                <Text style={styles.subLabel}>Receber notificações</Text>
              </View>
              <Switch value={alertsEnabled} onValueChange={setAlertsEnabled} trackColor={{ true: '#4A9943' }} />
            </View>

            <View style={styles.sliderSection}>
              <Text style={styles.label}>Alertar quando UV maior que:</Text>
              <View style={styles.sliderRow}>
                <Slider
                  style={{ flex: 1, height: 40 }}
                  minimumValue={0}
                  maximumValue={11}
                  step={1}
                  value={uvThreshold}
                  onValueChange={setUvThreshold}
                  minimumTrackTintColor="#4A9943"
                  maximumTrackTintColor="#F5F5DC"
                  thumbTintColor="#66B032"
                />
                <View style={styles.uvValueBox}>
                  <Text style={styles.uvValueText}>{uvThreshold}</Text>
                </View>
              </View>
              <Text style={styles.infoText}>Você será alertado quando o índice UV ultrapassar {uvThreshold}</Text>
            </View>

            <View style={styles.row}>
              <View>
                <Text style={styles.label}>Alertas UV-B específicos</Text>
                <Text style={styles.subLabel}>Notificar sobre radiação UV-B elevada</Text>
              </View>
              <Switch value={uvbAlerts} onValueChange={setUvbAlerts} trackColor={{ true: '#4A9943' }} />
            </View>
          </View>

          <View style={styles.noteCard}>
            <Text style={styles.noteText}>
              <Ionicons name="flash" size={14} color="#FDB813" /> 
              <Text style={{ fontWeight: 'bold' }}> Importante: </Text>
              A radiação UV-B é particularmente prejudicial às plantas, podendo causar estresse celular. Ajuste seu plano de aplicação conforme os alertas.
            </Text>
          </View>
        </ScrollView>
        <BottomNav currentRoute={pathname} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  contentWrapper: { flex: 1 },
  header: { backgroundColor: '#4A9943', padding: 25, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'space-between' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  headerBadgeGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { backgroundColor: '#EF4444', borderRadius: 10, paddingHorizontal: 6, height: 20, justifyContent: 'center' },
  badgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  refreshButton: { backgroundColor: 'rgba(255,255,255,0.18)', padding: 8, borderRadius: 12 },
  headerSubtitle: { color: '#F5F5DC', marginTop: 5 },
  sensorStatus: { color: '#DDE9D9', marginTop: 8, fontSize: 13 },
  updateText: { color: '#DDE9D9', marginTop: 6, fontSize: 12 },
  sensorSummary: { marginTop: 12, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 15 },
  sensorSummaryLabel: { color: '#DDE9D9', fontSize: 12, marginBottom: 4 },
  sensorSummaryValue: { color: 'white', fontSize: 32, fontWeight: 'bold' },
  sensorSummaryNote: { color: '#E8F6EF', fontSize: 13, marginTop: 6, lineHeight: 18 },
  clearButton: { marginTop: 12, alignSelf: 'stretch', backgroundColor: '#4A9943', paddingVertical: 12, borderRadius: 16, alignItems: 'center' },
  clearButtonText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
  sectionTitleText: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  alertCard: { borderRadius: 12, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  alertContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  alertTextContainer: { flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: '500' },
  alertTime: { fontSize: 12, color: '#64748B', marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#66B032' },
  configCard: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginTop: 10, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 },
  label: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  subLabel: { fontSize: 12, color: '#64748B' },
  sliderSection: { marginVertical: 15 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  uvValueBox: { backgroundColor: '#DBEafe', padding: 8, borderRadius: 8, width: 40, alignItems: 'center' },
  uvValueText: { color: '#4A9943', fontWeight: 'bold' },
  infoText: { fontSize: 12, color: '#64748B', marginTop: 5 },
  noteCard: { backgroundColor: '#F5F5DC', padding: 15, borderRadius: 12, marginTop: 20, borderLeftWidth: 4, borderLeftColor: '#FDB813' },
  noteText: { fontSize: 13, color: '#9A3412', lineHeight: 18 },
  noAlertsText: { fontSize: 14, color: '#64748B', textAlign: 'center', marginVertical: 20 }
});
