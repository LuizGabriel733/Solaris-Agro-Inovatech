import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { BluetoothClassicService } from '../bluetooth/BluetoothClassicService';

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
  const bluetoothServiceRef = useRef<BluetoothClassicService | null>(null);

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

  const getBluetoothService = () => {
    if (!bluetoothServiceRef.current) {
      bluetoothServiceRef.current = new BluetoothClassicService();
    }
    return bluetoothServiceRef.current;
  };

  const cleanupBluetooth = async () => {
    try {
      const bluetoothService = getBluetoothService();
      await bluetoothService.cleanup();
    } catch (e) {
      // ignore
    }
  };

  const connectClassicAndSubscribe = async () => {
    const bluetoothService = getBluetoothService();
    if (bluetoothService.isConnectedState() || bluetoothService.isConnectingState()) {
      console.debug('SensorContext: bluetooth service already connected or connecting, skipping connectClassicAndSubscribe');
      return;
    }

    await bluetoothService.requestPermissions();

    await bluetoothService.connect();
    setSensorConnected(true);

    await bluetoothService.listenForData((value) => {
      // tolerate noisy payloads: extract first numeric token
      const raw = String(value ?? '').trim();
      const m = raw.match(/[-+]?\d*\.?\d+/);
      const uvValue = m ? Number(m[0]) : NaN;
      if (!Number.isNaN(uvValue)) {
        console.debug('SensorContext: parsed UV value=', uvValue, 'from', raw);
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
      }
    }, () => {
      console.warn('SensorContext: Bluetooth disconnected (onDisconnect)');
      setSensorConnected(false);
    });
    // Provide onDisconnect handler via the same listenForData call
    // (listenForData will register disconnect handlers internally)
    // We call it again with empty onData but provide onDisconnect in case native emits disconnects separately.
    // Ensure we don't create duplicate read listeners by only relying on the first registration.
    // Instead, attach a small handler to react to disconnects coming from the native module via otherSubscriptions.
    // Listen for disconnect events through a lightweight subscription via DeviceEventEmitter if needed.
    // (No-op here as BluetoothClassicService already registers disconnect handlers and will invoke cleanup)
  };

  const carregarSensor = async () => {
    setSensorLoading(true);
    try {
      const bluetoothService = getBluetoothService();
      if (!sensorConnected && !bluetoothService.isConnectedState() && !bluetoothService.isConnectingState()) {
        await cleanupBluetooth();
        await connectClassicAndSubscribe();
      }
    } catch (bleError) {
      console.warn('Bluetooth clássico error:', bleError);
      // fallback para backend se Bluetooth clássico não estiver disponível
      try {
        const hosts = Platform.OS === 'android'
          ? ['http://10.0.2.2:4000', 'http://localhost:4000']
          : ['http://localhost:4000'];

        const tryFetch = async (path: string) => {
          let lastError: any = null;
          for (const host of hosts) {
            try {
              const res = await fetch(host + path);
              if (res.ok) return res;
              lastError = new Error(`HTTP ${res.status} from ${host}${path}`);
            } catch (e) {
              lastError = e;
            }
          }
          throw lastError ?? new Error('Unknown network error');
        };

        const [sensorRes, historicoRes] = await Promise.all([
          tryFetch('/sensor'),
          tryFetch('/sensor/historico'),
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
          const listaFormatada = listaBruta.map((item: any) => ({
            ...item,
            valor: item.valor ?? item.uv ?? 0,
            uv: item.uv ?? item.valor ?? 0,
          }));
          setHistorico(listaFormatada);
        }
      } catch (error) {
        console.warn('Erro ao carregar dados do sensor:', error);
        setSensorConnected(false);
      }
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
      cleanupBluetooth();
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