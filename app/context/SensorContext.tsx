import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

// 1. Definição clara do ponto de dados para o gráfico
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

// 2. Interface do Sensor aceitando as variações de nome do backend
interface SensorData {
  uv: number;
  valor?: number; 
  valor_uv?: number;
  saude_solo?: string;
  impacto_plantas?: string;
  atualizadoEm?: string;
}

// 3. Interface do Histórico: Garantindo que o campo 'valor' exista para o LineUVChart
interface HistoricoItem {
  sensorConectado: boolean;
  temperatura: number;
  umidade: number;
  valor: number; 
  uv: number;    
  atualizadoEm: string;
}

interface SensorContextValue {
  currentUV: number;
  sensorData: SensorData | null;
  historico: HistoricoItem[];
  activeAlerts: Alert[];
  uvThreshold: number;
  setUvThreshold: (value: number) => void;
  uvbAlerts: boolean;
  setUvbAlerts: (value: boolean) => void;
  alertsEnabled: boolean;
  setAlertsEnabled: (value: boolean) => void;
  clearOldAlert: (alertId: string) => void;
  clearAlerts: () => void;
  sensorLoading: boolean;
  sensorConnected: boolean;
  loadSensor: () => Promise<void>;
}

const SensorContext = createContext<SensorContextValue | null>(null);

// Alterado para exportação nomeada (será exportado como default no final)
export function SensorProvider({ children }: { children: React.ReactNode }) {
  const [currentUV, setCurrentUV] = useState(0);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [uvThreshold, setUvThreshold] = useState(8);
  const [uvbAlerts, setUvbAlerts] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [sensorLoading, setSensorLoading] = useState(true);
  const [sensorConnected, setSensorConnected] = useState(false);
  const [uvHistory, setUvHistory] = useState<UVDataPoint[]>([]);
  const [lastAlertTimes, setLastAlertTimes] = useState<{ [key: string]: number }>({});
  const [highRadiationPeriod, setHighRadiationPeriod] = useState(false);
  const [recoveryStartTime, setRecoveryStartTime] = useState<number | null>(null);
  const debounceTimer = useRef<any>(null);
  const pollingInterval = useRef<any>(null);

  const checkAlerts = (value: number, history: UVDataPoint[], now: number) => {
    const newAlerts: Alert[] = [];
    if (!alertsEnabled) return;

    if (value >= uvThreshold) {
      const alertKey = 'threshold';
      if (!lastAlertTimes[alertKey] || now - lastAlertTimes[alertKey] > 60000) {
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
  };

  const carregarSensor = async () => {
    setSensorLoading(true);
    try {
      const [sensorRes, historicoRes] = await Promise.all([
        fetch('http://localhost:4000/sensor'),
        fetch('http://localhost:4000/sensor/historico'),
      ]);

      if (sensorRes.ok) {
        const data = await sensorRes.json();
        const uvValue = data.valor ?? data.uv ?? data.valor_uv ?? 0;

        setSensorData({
          ...data,
          uv: uvValue,
          valor: uvValue,
          valor_uv: uvValue,
        });
        setCurrentUV(uvValue);
        setSensorConnected(true);

        const now = Date.now();
        setUvHistory(prevHistory => {
          const newHistory = [...prevHistory, { value: uvValue, timestamp: now }];
          if (debounceTimer.current) clearTimeout(debounceTimer.current);
          debounceTimer.current = setTimeout(() => {
            checkAlerts(uvValue, newHistory, now);
          }, 2000);
          return newHistory.slice(-1000);
        });
      } else {
        setSensorConnected(false);
      }

      if (historicoRes.ok) {
        const data = await historicoRes.json();
        const listaBruta = Array.isArray(data) ? data : (data.dados ?? []);
        
        // NORMALIZAÇÃO: Converte o campo 'uv' do JSON para 'valor'
        const listaFormatada = listaBruta.map((item: any) => ({
          ...item,
          valor: item.valor ?? item.uv ?? 0, 
          uv: item.uv ?? item.valor ?? 0     
        }));

        setHistorico(listaFormatada);
      }
    } catch (error) {
      console.warn('Erro ao carregar dados do sensor:', error);
      setSensorConnected(false);
    } finally {
      setSensorLoading(false);
    }
  };

  useEffect(() => {
    carregarSensor();
    pollingInterval.current = setInterval(carregarSensor, 5000);
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const clearOldAlert = (alertId: string) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const clearAlerts = () => {
    setActiveAlerts([]);
  };

  return (
    <SensorContext.Provider
      value={{
        currentUV,
        sensorData,
        historico,
        activeAlerts,
        uvThreshold,
        setUvThreshold,
        uvbAlerts,
        setUvbAlerts,
        alertsEnabled,
        setAlertsEnabled,
        clearOldAlert,
        clearAlerts,
        sensorLoading,
        sensorConnected,
        loadSensor: carregarSensor,
      }}
    >
      {children}
    </SensorContext.Provider>
  );
}

export const useSensor = () => {
  const context = useContext(SensorContext);
  if (!context) {
    throw new Error('useSensor deve ser usado dentro de um SensorProvider');
  }
  return context;
};

// --- AJUSTE FINAL: EXPORTAÇÃO PADRÃO ---
export default SensorProvider;