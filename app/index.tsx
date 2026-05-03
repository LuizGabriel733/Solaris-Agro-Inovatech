import { Feather } from '@expo/vector-icons'; // Ícones inclusos no Expo
import { usePathname } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BottomNav } from '../components/BottomNav';

export default function HomeScreen() {
  const pathname = usePathname();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header Azul */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Solaris Agro</Text>
            <View style={styles.statusBadge}>
              <View style={styles.dot} />
              <Text style={styles.statusText}>Sensor conectado</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.syncButton}>
            <Feather name="refresh-cw" size={16} color="white" />
            <Text style={styles.syncText}>Sincronizar</Text>
          </TouchableOpacity>
        </View>

        {/* Alerta de Radiação */}
        <View style={styles.alertCard}>
          <Feather name="alert-triangle" size={20} color="#FDB813" />
          <Text style={styles.alertText}>
            Radiação UV alta pode prejudicar o cultivo neste horário
          </Text>
        </View>

        {/* Card Principal - Índice UV */}
        <View style={styles.mainCard}>
          <View style={styles.mainCardHeader}>
            <Text style={styles.cardTitle}>Índice UV Atual</Text>
            <Feather name="sun" size={24} color="#00CED1" />
          </View>
          
          <Text style={styles.uvValue}>7</Text>
          <View style={styles.badgeAtencao}>
            <Text style={styles.badgeText}>Atenção</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Alta incidência de UV-B</Text>
            <Text style={styles.impactValue}>Impacto no cultivo: <Text style={{color: '#E67E22'}}>Moderado</Text></Text>
          </View>

          {/* Espaço para o Gráfico (Placeholder) */}
          <View style={styles.chartPlaceholder}>
             <Text style={styles.placeholderText}>[ Gráfico de Linha aqui ]</Text>
          </View>
        </View>

        {/* Grid de Cards Menores */}
        <View style={styles.row}>
          <View style={[styles.smallCard, { marginRight: 10 }]}>
            <Feather name="sun" size={20} color="#E67E22" />
            <Text style={styles.smallCardTitle}>Exposição UV</Text>
            <Text style={styles.smallCardValue}>4.5h</Text>
            <Text style={styles.smallCardSub}>Alta radiação</Text>
          </View>
          <View style={styles.smallCard}>
            <Feather name="trending-up" size={20} color="#00CED1" />
            <Text style={styles.smallCardTitle}>Média semanal</Text>
            <Text style={styles.smallCardValue}>6.2</Text>
            <Text style={styles.smallCardSub}>Índice UV</Text>
          </View>
        </View>

        {/* Recomendação Agrícola */}
        <View style={styles.recommendationCard}>
          <View style={styles.blueBar} />
          <View>
            <Text style={styles.recommendationTitle}>Recomendação Agrícola</Text>
            <Text style={styles.recommendationText}>
              Monitorar o cultivo. Considere sombreamento parcial durante picos de UV.
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  contentWrapper: { flex: 1, flexDirection: 'column' },
  scrollContent: { padding: 20 },
  header: { 
    backgroundColor: '#4A9943', 
    padding: 20, 
    borderRadius: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 20 
  },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00CED1', marginRight: 6 },
  statusText: { color: 'white', fontSize: 12, opacity: 0.9 },
  syncButton: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 15, alignItems: 'center' },
  syncText: { color: 'white', marginLeft: 5, fontSize: 12 },
  
  alertCard: { backgroundColor: '#F5F5DC', padding: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#FDB813' },
  alertText: { color: '#4A9943', fontSize: 13, marginLeft: 10, flex: 1 },

  mainCard: { backgroundColor: 'white', padding: 20, borderRadius: 20, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  mainCardHeader: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  uvValue: { fontSize: 64, fontWeight: 'bold', color: '#2C3E50' },
  badgeAtencao: { backgroundColor: '#FDB813', paddingHorizontal: 20, paddingVertical: 5, borderRadius: 15, marginBottom: 15 },
  badgeText: { color: '#FFFFFF', fontWeight: 'bold' },
  infoRow: { width: '100%', marginTop: 10 },
  label: { color: '#7F8C8D', fontSize: 13, marginBottom: 8 },
  impactValue: { color: '#2C3E50', fontSize: 13, fontWeight: '600' },
  
  row: { flexDirection: 'row', marginTop: 20 },
  smallCard: { flex: 1, backgroundColor: 'white', padding: 15, borderRadius: 20, elevation: 2 },
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
