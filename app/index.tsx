import { Feather } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import React, { useState } from 'react'; // Adicionado useState
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BottomNav } from '../components/BottomNav';
import { HistoryChartCard } from '../components/history/HistoryChartCard';
import { TODAY_DATA } from '../components/history/data';

export default function HomeScreen() {
  const pathname = usePathname();
  
  // ESTADO: Controla qual ponto do gráfico está selecionado (padrão é o último)
  const [selectedIndex, setSelectedIndex] = useState(TODAY_DATA.length - 1);

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

            {/* Ajuste no app/index.tsx */}
            <View style={styles.infoRow}>
              <View style={{ width: '100%' }}>
                <Text style={styles.label}>Alta incidência de UV-B</Text>
                {/* Removido o fontWeight: 'bold' e colocado em uma nova linha */}
                <Text style={[styles.impactValue, { fontWeight: 'normal', marginTop: 4 }]}>
                Impacto no cultivo: <Text style={{ color: '#F1C40F' }}>Moderado</Text>
                </Text>
              </View>
            </View>

            {/* Área do Gráfico - Ajustada para aceitar cliques no mesmo */}
            <View 
              style={{ width: '100%', marginTop: 10, zIndex: 10 }} 
              pointerEvents="box-none"
            >
              <View style={{ height: 1, backgroundColor: '#E0E0E0', marginVertical: 15 }} />
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                 <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Feather name="map-pin" size={12} color="#7F8C8D" />
                    <Text style={{ color: '#7F8C8D', fontSize: 11, marginLeft: 4 }}>Leitura local</Text>
                 </View>
                 <Text style={{ color: '#7F8C8D', fontSize: 11 }}>
                   {/* Mostra o horário do ponto selecionado ou o atual */}
                   Atualizado: {TODAY_DATA[selectedIndex]?.label || '16:10'}
                 </Text>
              </View>

              <HistoryChartCard
                selectedPeriod="today"
                data={TODAY_DATA}
                selectedPointIndex={selectedIndex}
                onSelectPointIndex={(index) => setSelectedIndex(index)} // Atualiza o estado ao clicar
                chartWidth={290} 
                chartHeight={100} 
                maxDataValue={12}
                hideHeader={true}
                lineColor="#F1C40F"
                hideCard={true}
              />
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
        <BottomNav currentRoute={pathname} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  contentWrapper: { flex: 1, flexDirection: 'column' },
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

  mainCard: { 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 20, 
    alignItems: 'center', 
    elevation: 3, 
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 10 
  },
  mainCardHeader: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  uvValue: { fontSize: 64, fontWeight: 'bold', color: '#2C3E50' },
  badgeAtencao: { backgroundColor: '#FEF9E7', paddingHorizontal: 20, paddingVertical: 5, borderRadius: 15, marginBottom: 15 },
  badgeText: { color: '#F1C40F', fontWeight: 'bold' },
infoRow: { 
  width: '100%', 
  marginTop: 10, 
  flexDirection: 'column', // Força os textos a ficarem um embaixo do outro
  alignItems: 'flex-start' // Alinha os textos à esquerda
},
label: { 
  color: '#7F8C8D', 
  fontSize: 13 
},
impactValue: { 
  color: '#2C3E50', 
  fontSize: 13 
  // Removido o fontWeight: '600' daqui para tirar o negrito global
},
  
  row: { flexDirection: 'row', marginTop: 20 },
  smallCard: { flex: 1, backgroundColor: 'white', padding: 15, borderRadius: 20, elevation: 2 },
  smallCardTitle: { fontSize: 12, color: '#7F8C8D', marginTop: 5 },
  smallCardValue: { fontSize: 20, fontWeight: 'bold', marginVertical: 2 },
  smallCardSub: { fontSize: 10, color: '#95A5A6' },

  recommendationCard: { backgroundColor: '#EBF5FB', padding: 20, borderRadius: 15, marginTop: 20, flexDirection: 'row' },
  blueBar: { width: 4, backgroundColor: '#3498DB', borderRadius: 2, marginRight: 15 },
  recommendationTitle: { fontWeight: 'bold', color: '#2980B9', marginBottom: 5 },
  recommendationText: { color: '#5D6D7E', fontSize: 13, lineHeight: 18 },
});