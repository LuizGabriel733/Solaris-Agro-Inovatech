import { useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BluetoothClassicService } from '../bluetooth/BluetoothClassicService';

export default function Index() {
  const [status, setStatus] = useState('Aguardando...');
  const bluetoothServiceRef = useRef<BluetoothClassicService | null>(null);

  const getBluetoothService = () => {
    if (!bluetoothServiceRef.current) {
      bluetoothServiceRef.current = new BluetoothClassicService();
    }
    return bluetoothServiceRef.current;
  };

  const conectarBluetooth = async () => {
    if (Platform.OS === 'web') {
      setStatus('Bluetooth indisponivel no navegador (use Android/iOS com development build).');
      return;
    }

    const service = getBluetoothService();
    setStatus('Preparando Bluetooth...');

    try {
      const permissionsOk = await service.requestPermissions();
      if (!permissionsOk) {
        setStatus('Permissões Bluetooth não concedidas');
        return;
      }

      setStatus('Conectando ao dispositivo emparelhado...');
      const device = await service.connect();
      setStatus(`Conectado a ${device.name ?? device.address}`);

      await service.listenForData((text) => {
        setStatus(`UV: ${text}`);
      });
    } catch (error: any) {
      setStatus('Erro ao conectar: ' + (error?.message ?? String(error)));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Uvision App</Text>
      <Text style={styles.status}>{status}</Text>
      
      <TouchableOpacity style={styles.button} onPress={conectarBluetooth}>
        <Text style={styles.buttonText}>CONECTAR ARDUINO</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  status: { fontSize: 16, color: "gray", marginBottom: 40 },
  button: { backgroundColor: "#007AFF", padding: 20, borderRadius: 10 },
  buttonText: { color: "white", fontWeight: "bold" }
});
