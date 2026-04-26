import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { usePathname } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { BottomNav } from '../components/BottomNav';

// Componente para os Cards de Alerta
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
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [uvThreshold, setUvThreshold] = useState(8);
  const [uvbAlerts, setUvbAlerts] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        {/* Header Azul */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Alertas</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>2</Text></View>
          </View>
          <Text style={styles.headerSubtitle}>Notificações e configurações</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Seção de Alertas Recentes */}
        <View style={styles.sectionHeader}>
          <Ionicons name="notifications-outline" size={20} color="#333" />
          <Text style={styles.sectionTitleText}>Alertas Recentes</Text>
        </View>

        <AlertCard 
          icon="warning-outline" 
          title="UV alto às 12:30 – risco ao cultivo" 
          time="12:30" 
          color="#D32F2F" 
          bgColor="#FFEBEE"
          isNew={true}
        />
        <AlertCard 
          icon="sunny-outline" 
          title="Nível UV-B elevado detectado" 
          time="14:15" 
          color="#F57C00" 
          bgColor="#FFF3E0"
          isNew={true}
        />
        <AlertCard 
          icon="information-circle-outline" 
          title="Condições favoráveis para cultivo" 
          time="10:00" 
          color="#1976D2" 
          bgColor="#E3F2FD"
        />

        {/* Configuração de Alertas */}
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
            <Switch value={alertsEnabled} onValueChange={setAlertsEnabled} trackColor={{ true: '#2563EB' }} />
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
                minimumTrackTintColor="#2563EB"
                maximumTrackTintColor="#D1D5DB"
                thumbTintColor="#2563EB"
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
            <Switch value={uvbAlerts} onValueChange={setUvbAlerts} trackColor={{ true: '#2563EB' }} />
          </View>
        </View>

        {/* Nota Importante */}
        <View style={styles.noteCard}>
          <Text style={styles.noteText}>
            <Ionicons name="flash" size={14} color="#F57C00" /> 
            <Text style={{ fontWeight: 'bold' }}> Importante: </Text>
            A radiação UV-B é particularmente prejudicial às plantas, podendo causar estresse celular...
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
  header: { backgroundColor: '#1E40AF', padding: 25, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  badge: { backgroundColor: '#EF4444', borderRadius: 10, paddingHorizontal: 6, height: 20, justifyContent: 'center' },
  badgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  headerSubtitle: { color: '#BFDBFE', marginTop: 5 },
  scrollContent: { padding: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
  sectionTitleText: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  alertCard: { borderRadius: 12, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  alertContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  alertTextContainer: { flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: '500' },
  alertTime: { fontSize: 12, color: '#64748B', marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563EB' },
  configCard: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginTop: 10, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 },
  label: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  subLabel: { fontSize: 12, color: '#64748B' },
  sliderSection: { marginVertical: 15 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  uvValueBox: { backgroundColor: '#DBEafe', padding: 8, borderRadius: 8, width: 40, alignItems: 'center' },
  uvValueText: { color: '#1E40AF', fontWeight: 'bold' },
  infoText: { fontSize: 12, color: '#64748B', marginTop: 5 },
  noteCard: { backgroundColor: '#FFF7ED', padding: 15, borderRadius: 12, marginTop: 20, borderLeftWidth: 4, borderLeftColor: '#F57C00' },
  noteText: { fontSize: 13, color: '#9A3412', lineHeight: 18 }
});
