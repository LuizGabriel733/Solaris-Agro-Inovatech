import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BleManager } from 'react-native-ble-plx';

const manager = new BleManager();

export default function Index() {
  const [status, setStatus] = useState("Aguardando...");

  const conectarBluetooth = () => {
    setStatus("Buscando Arduino...");
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        setStatus("Erro: " + error.message);
        return;
      }
      if (device && device.name === "Uvision-Sensor") { // Nome do seu Arduino
        manager.stopDeviceScan();
        setStatus("Conectando ao " + device.name);
        device.connect()
          .then((d) => d.discoverAllServicesAndCharacteristics())
          .then(() => setStatus("Conectado com Sucesso!"));
      }
    });
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
