import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

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

interface SensorData {
  uv: number;
  valor_uv?: number;
  saude_solo?: string;
  impacto_plantas?: string;
  atualizadoEm?: string;
}

interface HistoricoItem {
  sensorConectado: boolean;
  temperatura: number;
  umidade: number;
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


  useEffect(() => {
    // As notificações nativas podem não estar disponíveis em todos os ambientes.
    // Mantemos apenas a lógica de polling e alertas visuais.
  }, []);

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

    const last180Min = history.filter(p => now - p.timestamp <= 180 * 60 * 1000);
    if (last180Min.length > 0) {
      const avg = last180Min.reduce((sum, p) => sum + p.value, 0) / last180Min.length;
      if (avg > 5 && last180Min.length >= 18) {
        const alertKey = 'accumulation';
        if (!lastAlertTimes[alertKey] || now - lastAlertTimes[alertKey] > 3600000) {
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
    }

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

    if (uvbAlerts && value >= 6) {
      const alertKey = 'uvb';
      if (!lastAlertTimes[alertKey] || now - lastAlertTimes[alertKey] > 1800000) {
        newAlerts.push({
          id: `${alertKey}-${now}`,
          icon: 'warning',
          title: 'Radiação UV-B elevada detectada – risco de estresse celular',
          time: new Date(now).toLocaleTimeString(),
          color: '#E74C3C',
          bgColor: '#FADBD8',
          isNew: true,
        });
        setLastAlertTimes(prev => ({ ...prev, [alertKey]: now }));
      }
    }

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

    if (newAlerts.length > 0) {
      setActiveAlerts(prev => [...newAlerts, ...prev].slice(0, 10));

      newAlerts.forEach(async () => {
        try {
          const Haptics = await import('expo-haptics');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch (error) {
          console.warn('Erro ao executar haptics:', error);
        }
      });
    }
  };

  const carregarSensor = async () => {
    setSensorLoading(true);

    try {
      const [sensorRes, historicoRes] = await Promise.all([
        fetch('http://192.168.0.11:3000/sensor'),
        fetch('http://192.168.0.11:3000/sensor/historico'),
      ]);

      if (sensorRes.ok) {
        const data = await sensorRes.json();
        const uvValue = data.uv ?? data.valor_uv ?? 0;

        setSensorData({
          ...data,
          uv: uvValue,
          valor_uv: data.valor_uv ?? uvValue,
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
        setHistorico(data.dados ?? data);
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

    pollingInterval.current = setInterval(() => {
      carregarSensor();
    }, 5000);

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
    throw new Error('useSensor must be used within SensorProvider');
  }
  return context;
};
