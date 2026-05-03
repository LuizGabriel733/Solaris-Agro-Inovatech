import { Ionicons } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { BottomNav } from '../components/BottomNav';
import { useSettings } from './context/SettingsContext';

export default function SettingsScreen() {
  const pathname = usePathname();
  const { settings, updateSettings } = useSettings();

  const Section = ({ title, icon, children }: any) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={20} color="#0056D2" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Configurações</Text>
            <Text style={styles.headerSubtitle}>Personalize seu aplicativo</Text>
          </View>

          <Section title="Notificações e Alertas" icon="notifications-outline">
            <View style={styles.row}>
              <View>
                <Text style={styles.rowLabel}>Notificações</Text>
                <Text style={styles.rowSub}>Receber notificações push</Text>
              </View>
              <Switch 
                value={settings.notifications} 
                onValueChange={(v) => updateSettings({ notifications: v })} 
                trackColor={{ true: '#4A9943' }}
              />
            </View>
            <View style={[styles.row, { borderTopWidth: 1, borderColor: '#f0f0f0' }]}>
              <View>
                <Text style={styles.rowLabel}>Sons de alerta</Text>
                <Text style={styles.rowSub}>Reproduzir som ao receber alertas</Text>
              </View>
              <Switch 
                value={settings.alertSounds} 
                onValueChange={(v) => updateSettings({ alertSounds: v })} 
                trackColor={{ true: '#4A9943' }}
              />
            </View>
          </Section>

          <Section title="Dados e Atualização" icon="sync-outline">
            <View style={styles.row}>
              <View>
                <Text style={styles.rowLabel}>Atualização automática</Text>
                <Text style={styles.rowSub}>Sincronizar dados automaticamente</Text>
              </View>
              <Switch 
                value={settings.autoUpdate} 
                onValueChange={(v) => updateSettings({ autoUpdate: v })} 
                trackColor={{ true: '#4A9943' }}
              />
            </View>
          </Section>

          <Section title="Informações" icon="information-circle-outline">
            <TouchableOpacity style={styles.infoRow}>
              <Text style={styles.infoText}>Sobre o Solaris Agro</Text>
              <Ionicons name="chevron-forward" size={20} color="#9AA7B7" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.infoRow}>
              <Text style={styles.infoText}>Termos de uso</Text>
              <Ionicons name="chevron-forward" size={20} color="#9AA7B7" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.infoRow}>
              <Text style={styles.infoText}>Política de privacidade</Text>
              <Ionicons name="chevron-forward" size={20} color="#9AA7B7" />
            </TouchableOpacity>
            <Text style={styles.versionText}>Versão 1.0.0</Text>
          </Section>
        </ScrollView>
        <BottomNav currentRoute={pathname} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  contentWrapper: { flex: 1 },
  scrollView: { flex: 1 },
  header: { backgroundColor: '#4A9943', padding: 30, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { color: '#F5F5DC', fontSize: 14 },
  section: { backgroundColor: 'white', margin: 15, borderRadius: 15, padding: 15, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#4A9943' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  rowSub: { fontSize: 12, color: '#666' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderColor: '#EEF2F7' },
  infoText: { fontSize: 15, color: '#111827' },
  versionText: { marginTop: 20, color: '#6B7280', fontSize: 13, textAlign: 'center' },
  radioGroup: { marginTop: 15 },
  groupLabel: { fontWeight: 'bold', marginBottom: 5 },
  radioOption: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, marginTop: 8 },
  radioActive: { borderColor: '#4A9943', backgroundColor: '#F5F5DC' }
});
