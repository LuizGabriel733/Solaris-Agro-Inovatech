import { Ionicons } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../components/BottomNav';
import { useSettings } from './context/SettingsContext';

export default function SettingsScreen() {
  const pathname = usePathname();
  const { settings, updateSettings } = useSettings();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const Section = ({ title, icon, children }: any) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={20} color="#0056D2" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Configurações</Text>
          </View>
          <Text style={styles.headerSubtitle}>Personalize seu aplicativo</Text>
        </View>

        <ScrollView style={styles.scrollView}>

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
            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => toggleSection('about')}
            >
              <Text style={styles.infoText}>Sobre o Solaris Agro</Text>
              <Ionicons name={expandedSection === 'about' ? 'chevron-up' : 'chevron-forward'} size={20} color="#9AA7B7" />
            </TouchableOpacity>
            {expandedSection === 'about' && (
              <Text style={styles.expandedContent}>
                O Solaris Agro é uma solução de monitoramento climático em tempo real. Através de um sensor de precisão conectado ao seu celular, medimos a intensidade da radiação ultravioleta (Índice UV) diretamente no cultivo, entregando dados críticos para um manejo mais inteligente e seguro do plantio.
              </Text>
            )}

            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => toggleSection('terms')}
            >
              <Text style={styles.infoText}>Termos de uso</Text>
              <Ionicons name={expandedSection === 'terms' ? 'chevron-up' : 'chevron-forward'} size={20} color="#9AA7B7" />
            </TouchableOpacity>
            {expandedSection === 'terms' && (
              <Text style={styles.expandedContent}>
                Ao utilizar o Solaris Agro, você concorda que:{'\n'}• O app fornece dados de monitoramento baseados no sensor conectado{'\n'}• As informações são ferramentas de apoio à decisão, não substituindo a consultoria agronômica técnica{'\n'}• O uso adequado do hardware (sensor) é de responsabilidade do usuário para garantir a precisão dos dados.
              </Text>
            )}

            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => toggleSection('privacy')}
            >
              <Text style={styles.infoText}>Política de privacidade</Text>
              <Ionicons name={expandedSection === 'privacy' ? 'chevron-up' : 'chevron-forward'} size={20} color="#9AA7B7" />
            </TouchableOpacity>
            {expandedSection === 'privacy' && (
              <Text style={styles.expandedContent}>
                Sua privacidade é importante para nós:{'\n'}• Os dados de monitoramento UV são armazenados localmente no seu dispositivo{'\n'}• Informações de sensor não são compartilhadas com terceiros sem sua permissão{'\n'}• Você tem controle total sobre quais dados são sincronizados ou compartilhados{'\n'}• Não vendemos ou utilizamos seus dados para fins comerciais.
              </Text>
            )}
            <Text style={styles.versionText}>Versão 2.0.0</Text>
          </Section>
        </ScrollView>
        <BottomNav currentRoute={pathname} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  contentWrapper: { flex: 1 },
  scrollView: { flex: 1 },
  header: { backgroundColor: '#4A9943', padding: 25, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { color: '#F5F5DC', fontSize: 13, fontWeight: '500' },
  section: { backgroundColor: 'white', margin: 15, borderRadius: 15, padding: 15, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#4A9943' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  rowSub: { fontSize: 12, color: '#666' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderColor: '#EEF2F7' },
  infoText: { fontSize: 15, color: '#111827' },
  expandedContent: { paddingVertical: 12, paddingHorizontal: 8, backgroundColor: '#F5F5DC', borderRadius: 8, marginVertical: 10, fontSize: 13, color: '#4A9943', lineHeight: 20 },
  versionText: { marginTop: 20, color: '#6B7280', fontSize: 13, textAlign: 'center' },
  radioGroup: { marginTop: 15 },
  groupLabel: { fontWeight: 'bold', marginBottom: 5 },
  radioOption: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, marginTop: 8 },
  radioActive: { borderColor: '#4A9943', backgroundColor: '#F5F5DC' }
});
