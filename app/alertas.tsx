import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { usePathname } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { BottomNav } from '../components/BottomNav';

// Tipos para alertas e histórico
interface UVDataPoint {
  value: number;
  timestamp: number;
}

interface Alert {
  id: string;
  icon: string;
  title: string;
  time: string;
  color: string;
  bgColor: string;
  isNew: boolean;
}

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

  // Estados para monitoramento UV
  const [uvHistory, setUvHistory] = useState<UVDataPoint[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [lastAlertTimes, setLastAlertTimes] = useState<{ [key: string]: number }>({});
  const [notificationsModule, setNotificationsModule] = useState<any>(null);
  const debounceTimer = useRef<any>(null);

  // Estados para rastrear condições
  const [highRadiationPeriod, setHighRadiationPeriod] = useState(false);
  const [recoveryStartTime, setRecoveryStartTime] = useState<number | null>(null);

  // Configurar notificações dinamicamente se disponível
  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      try {
        const Notifications = await import('expo-notifications');
        if (!active) return;

        setNotificationsModule(Notifications);
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });

        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Permissões de notificação não concedidas');
        }
      } catch (error) {
        console.warn('expo-notifications não disponível ou módulo nativo ausente:', error);
      }
    };

    loadNotifications();

    return () => {
      active = false;
    };
  }, []);

  // Função auxiliar para verificar alertas após debounce
  const checkAlerts = useCallback((value: number, history: UVDataPoint[], now: number) => {
    const newAlerts: Alert[] = [];

    // 1. Gatilho de Limite de Segurança
    if (value >= uvThreshold) {
      const alertKey = 'threshold';
      if (!lastAlertTimes[alertKey] || now - lastAlertTimes[alertKey] > 60000) { // Evitar repetição imediata
        newAlerts.push({
          id: `${alertKey}-${now}`,
          icon: 'warning-outline',
          title: `UV alto às ${new Date(now).toLocaleTimeString()} – risco ao cultivo`,
          time: new Date(now).toLocaleTimeString(),
          color: '#FDB813',
          bgColor: '#F5F5DC',
          isNew: true,
        });
        setLastAlertTimes(prev => ({ ...prev, [alertKey]: now }));
      }
    }

    // 2. Gatilho de Acúmulo de Radiação
    const last180Min = history.filter(p => now - p.timestamp <= 180 * 60 * 1000);
    const avg = last180Min.reduce((sum, p) => sum + p.value, 0) / last180Min.length;
    if (avg > 5 && last180Min.length >= 18) { // Pelo menos 18 pontos em 180 min (1 por 10 min)
      const alertKey = 'accumulation';
      if (!lastAlertTimes[alertKey] || now - lastAlertTimes[alertKey] > 3600000) { // Cooldown 1h
        newAlerts.push({
          id: `${alertKey}-${now}`,
          icon: 'leaf-outline',
          title: 'Saúde do Solo: Exposição prolongada detectada',
          time: new Date(now).toLocaleTimeString(),
          color: '#4A9943',
          bgColor: '#F5F5DC',
          isNew: true,
        });
        setLastAlertTimes(prev => ({ ...prev, [alertKey]: now }));
        setHighRadiationPeriod(true);
      }
    }

    // 3. Gatilho de Pico de Intensidade (Escala OMS)
    let peakAlert = null;
    if (value >= 11) {
      peakAlert = {
        id: `peak-extreme-${now}`,
        icon: 'flash-outline',
        title: 'UV Extremo: Interrupção de fotossíntese e dano celular',
        time: new Date(now).toLocaleTimeString(),
        color: '#FDB813',
        bgColor: '#F5F5DC',
        isNew: true,
      };
    } else if (value >= 8) {
      peakAlert = {
        id: `peak-high-${now}`,
        icon: 'sunny-outline',
        title: 'UV Muito Alto: Necessidade de cobertura/sombreamento',
        time: new Date(now).toLocaleTimeString(),
        color: '#00CED1',
        bgColor: '#F5F5DC',
        isNew: true,
      };
    }
    if (peakAlert) {
      const alertKey = 'peak';
      if (!lastAlertTimes[alertKey] || now - lastAlertTimes[alertKey] > 3600000 || value >= 11) {
        newAlerts.push(peakAlert);
        setLastAlertTimes(prev => ({ ...prev, [alertKey]: now }));
      }
    }

    // 4. Gatilho de Recuperação
    if (highRadiationPeriod && value < 3) {
      if (!recoveryStartTime) {
        setRecoveryStartTime(now);
      } else if (now - recoveryStartTime >= 20 * 60 * 1000) {
        const alertKey = 'recovery';
        if (!lastAlertTimes[alertKey] || now - lastAlertTimes[alertKey] > 3600000) {
          newAlerts.push({
            id: `${alertKey}-${now}`,
            icon: 'checkmark-circle-outline',
            title: 'Condições favoráveis: Seguro para aplicação de insumos',
            time: new Date(now).toLocaleTimeString(),
            color: '#4A9943',
            bgColor: '#F5F5DC',
            isNew: true,
          });
          setLastAlertTimes(prev => ({ ...prev, [alertKey]: now }));
          setHighRadiationPeriod(false);
          setRecoveryStartTime(null);
        }
      }
    } else {
      setRecoveryStartTime(null);
    }

    // Adicionar novos alertas à lista
    if (newAlerts.length > 0) {
      setActiveAlerts(prev => [...newAlerts, ...prev].slice(0, 10)); // Manter apenas os 10 mais recentes

      // Enviar notificações push e vibração para novos alertas
      newAlerts.forEach(async (alert) => {
        try {
          if (notificationsModule?.scheduleNotificationAsync) {
            await notificationsModule.scheduleNotificationAsync({
              content: {
                title: 'Alerta UV - Solaris Agro',
                body: alert.title,
                sound: 'default',
                priority: notificationsModule.AndroidNotificationPriority?.HIGH,
              },
              trigger: null,
            });
          }

          // Vibração
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch (error) {
          console.warn('Erro ao enviar notificação:', error);
        }
      });
    }
  }, [uvThreshold, lastAlertTimes, highRadiationPeriod, recoveryStartTime, notificationsModule]);

  // Função para avaliar dados UV e disparar alertas
  const evaluateUVData = useCallback((value: number) => {
    if (!alertsEnabled) return;

    const now = Date.now();
    setUvHistory(prev => {
      const newHistory = [...prev, { value, timestamp: now }];
      // Debounce: aguardar 30 segundos de leitura estável
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        checkAlerts(value, newHistory, now);
      }, 30000);
      return newHistory.slice(-1000);
    });
  }, [alertsEnabled, checkAlerts]);

  // Simulação de dados do sensor (substituir por dados reais)
  useEffect(() => {
    const interval = setInterval(() => {
      const newValue = Math.random() * 12; // Simular valor UV entre 0-12
      evaluateUVData(newValue);
    }, 60000); // Atualizar a cada 1 minuto

    return () => clearInterval(interval);
  }, [evaluateUVData]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        {/* Header Azul */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Alertas</Text>
            {activeAlerts.length > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{activeAlerts.length}</Text></View>
            )}
          </View>
          <Text style={styles.headerSubtitle}>Notificações e configurações</Text>
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

        {/* Nota Importante */}
        <View style={styles.noteCard}>
          <Text style={styles.noteText}>
            <Ionicons name="flash" size={14} color="#FDB813" /> 
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
  header: { backgroundColor: '#4A9943', padding: 25, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  badge: { backgroundColor: '#EF4444', borderRadius: 10, paddingHorizontal: 6, height: 20, justifyContent: 'center' },
  badgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  headerSubtitle: { color: '#F5F5DC', marginTop: 5 },
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
