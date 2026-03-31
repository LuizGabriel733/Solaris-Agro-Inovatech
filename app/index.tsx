import { Feather } from '@expo/vector-icons'; // Ícones inclusos no Expo
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header Azul */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Uvision</Text>
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
          <Feather name="alert-triangle" size={20} color="#E67E22" />
          <Text style={styles.alertText}>
            Radiação UV alta pode prejudicar o cultivo neste horário
          </Text>
        </View>

        {/* Card Principal - Índice UV */}
        <View style={styles.mainCard}>
          <View style={styles.mainCardHeader}>
            <Text style={styles.cardTitle}>Índice UV Atual</Text>
            <Feather name="sun" size={24} color="#F1C40F" />
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
            <Feather name="trending-up" size={20} color="#3498DB" />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  scrollContent: { padding: 20 },
  header: { 
    backgroundColor: '#1A5AD7', 
    padding: 20, 
    borderRadius: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 20 
  },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2ECC71', marginRight: 6 },
  statusText: { color: 'white', fontSize: 12, opacity: 0.9 },
  syncButton: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 15, alignItems: 'center' },
  syncText: { color: 'white', marginLeft: 5, fontSize: 12 },
  
  alertCard: { backgroundColor: '#FFF3E0', padding: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#FFE0B2' },
  alertText: { color: '#E67E22', fontSize: 13, marginLeft: 10, flex: 1 },

  mainCard: { backgroundColor: 'white', padding: 20, borderRadius: 20, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  mainCardHeader: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  uvValue: { fontSize: 64, fontWeight: 'bold', color: '#2C3E50' },
  badgeAtencao: { backgroundColor: '#FEF9E7', paddingHorizontal: 20, paddingVertical: 5, borderRadius: 15, marginBottom: 15 },
  badgeText: { color: '#F1C40F', fontWeight: 'bold' },
  
  infoRow: { width: '100%', marginTop: 15 },
  label: { color: '#7F8C8D', fontSize: 13, marginBottom: 8 },
  impactValue: { color: '#333', fontSize: 13, fontWeight: '500' },
  
  row: { flexDirection: 'row', marginTop: 20 },
  smallCard: { flex: 1, backgroundColor: 'white', padding: 15, borderRadius: 20, elevation: 2 },
  smallCardTitle: { fontSize: 12, color: '#7F8C8D', marginTop: 5 },
  smallCardValue: { fontSize: 20, fontWeight: 'bold', marginVertical: 2 },
  smallCardSub: { fontSize: 10, color: '#95A5A6' },

  recommendationCard: { backgroundColor: '#EBF5FB', padding: 20, borderRadius: 15, marginTop: 20, flexDirection: 'row' },
  blueBar: { width: 4, backgroundColor: '#3498DB', borderRadius: 2, marginRight: 15 },
  recommendationTitle: { fontWeight: 'bold', color: '#2980B9', marginBottom: 5 },
  recommendationText: { color: '#5D6D7E', fontSize: 13, lineHeight: 18 },
  
  chartPlaceholder: { width: '100%', height: 100, backgroundColor: '#f9f9f9', marginTop: 20, justifyContent: 'center', alignItems: 'center', borderRadius: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc' },
  placeholderText: { color: '#999', fontSize: 14 },
});
