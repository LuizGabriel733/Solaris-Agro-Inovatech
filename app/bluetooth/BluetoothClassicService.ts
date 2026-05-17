import { PermissionsAndroid, Platform, Permission, DeviceEventEmitter } from 'react-native';
import BluetoothClassic from 'react-native-bluetooth-classic';

const DEVICE_NAME = 'Uvision_SmartBand';

export class BluetoothClassicService {
  private device: any = null;
  private subscription: any = null;
  private otherSubscriptions: any[] = [];
  private connecting: boolean = false;
  private reconnectTimer: any = null;
  private reconnectAttempts: number = 0;
  private pollTimer: any = null;
  private consecutiveNotConnected = 0;
  private readCallback?: (text: string) => void;
  private disconnectCallback?: () => void;
  private readDelimiter = '\n';

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
      const apiLevel = Platform.Version as number;
      const permissions = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        'android.permission.BLUETOOTH',
        'android.permission.BLUETOOTH_ADMIN',
      ];

      if (apiLevel >= 31) {
        permissions.push(
          'android.permission.BLUETOOTH_CONNECT',
          'android.permission.BLUETOOTH_SCAN'
        );
      }

      const granted = await PermissionsAndroid.requestMultiple(permissions as Permission[]);
      const allGranted = Object.values(granted).every(value => value === PermissionsAndroid.RESULTS.GRANTED);
      console.debug('BluetoothClassicService: permissions granted=', allGranted, granted);
      return allGranted;
    } catch {
      return false;
    }
  }

  async getBondedDevice(): Promise<any> {
    const devices = await BluetoothClassic.list();
    console.debug('BluetoothClassicService: paired devices count=', devices?.length);
    const found = devices.find((device: any) =>
      device.name === DEVICE_NAME ||
      device.address === DEVICE_NAME ||
      device.name?.toLowerCase() === DEVICE_NAME.toLowerCase()
    );
    console.debug('BluetoothClassicService: bonded device=', found);
    return found;
  }

  async connect(): Promise<any> {
    if (!await this.requestPermissions()) {
      throw new Error('Permissões Bluetooth não concedidas');
    }

    const device = await this.getBondedDevice();
    if (!device) {
      throw new Error(`Dispositivo emparelhado '${DEVICE_NAME}' não encontrado`);
    }

    if (this.connecting) {
      console.debug('BluetoothClassicService: connect already in progress, returning current device');
      return this.device;
    }

    this.connecting = true;
    try {
      console.debug('BluetoothClassicService: connecting to', device.address || device);
      const connectedDevice = await BluetoothClassic.connect(device.address);
      console.debug('BluetoothClassicService: connect result=', connectedDevice);
      if (!connectedDevice) {
        throw new Error('Falha ao conectar ao dispositivo Bluetooth clássico');
      }

      // Configure delimiter/encoding and clear buffer to ensure clean reads
      try {
        if (typeof BluetoothClassic.setDelimiter === 'function') {
          await BluetoothClassic.setDelimiter('\n');
          console.debug('BluetoothClassicService: set delimiter to \\n');
        }
        if (typeof BluetoothClassic.setEncoding === 'function') {
          await BluetoothClassic.setEncoding('UTF8');
          console.debug('BluetoothClassicService: set encoding to UTF8');
        }
        if (typeof BluetoothClassic.clear === 'function') {
          await BluetoothClassic.clear();
          console.debug('BluetoothClassicService: cleared native buffer');
        }
      } catch (e) {
        console.warn('BluetoothClassicService: error configuring native module', e);
      }

      this.device = connectedDevice;
      // reset reconnect state
      this.reconnectAttempts = 0;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      return connectedDevice;
    } catch (e) {
      console.warn('BluetoothClassicService: connect error', e);
      // schedule reconnect attempt
      this.scheduleReconnect();
      throw e;
    } finally {
      this.connecting = false;
    }
  }

  private handleDisconnect() {
    console.debug('BluetoothClassicService: handling disconnect');
    try {
      this.device = null;
      if (this.subscription) {
        try { this.subscription.remove(); } catch {}
        this.subscription = null;
      }
      if (this.otherSubscriptions && this.otherSubscriptions.length) {
        this.otherSubscriptions.forEach(s => { try { s.remove(); } catch {} });
        this.otherSubscriptions = [];
      }
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
    } catch (e) {
      console.warn('BluetoothClassicService: error during handleDisconnect', e);
    }
    if (this.disconnectCallback) {
      try {
        this.disconnectCallback();
      } catch (e) {
        console.warn('BluetoothClassicService: disconnectCallback error', e);
      }
    }
    this.scheduleReconnect();
  }

  private scheduleReconnect() {
    // exponential backoff capped at 30s
    this.reconnectAttempts = Math.min(this.reconnectAttempts + 1, 6);
    const delay = Math.min(30000, Math.pow(2, this.reconnectAttempts) * 1000);
    console.debug('BluetoothClassicService: scheduling reconnect in', delay);
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(async () => {
      try {
        console.debug('BluetoothClassicService: attempting reconnect (attempt)', this.reconnectAttempts);
        await this.connect();
        // re-subscribe to data after reconnect using stored callbacks
        if (this.readCallback) {
          await this.listenForData(this.readCallback, this.disconnectCallback);
        }
      } catch (e) {
        console.warn('BluetoothClassicService: reconnect attempt failed', e);
        this.scheduleReconnect();
      }
    }, delay);
  }

  async disconnect() {
    if (!this.device) return;
    try {
      await BluetoothClassic.disconnect();
    } catch {
      // ignore
    }
    this.device = null;
  }

  public isConnectedState(): boolean {
    return !!this.device;
  }

  public isConnectingState(): boolean {
    return this.connecting;
  }

  async listenForData(onData: (text: string) => void, onDisconnect?: () => void) {
    this.readCallback = onData;
    this.disconnectCallback = onDisconnect;

    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    if (this.otherSubscriptions && this.otherSubscriptions.length) {
      this.otherSubscriptions.forEach(s => { try { s.remove(); } catch {} });
      this.otherSubscriptions = [];
    }
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    const syncRead = async () => {
      try {
        const connected = await BluetoothClassic.isConnected();
        if (!connected) {
          this.consecutiveNotConnected += 1;
          console.warn('BluetoothClassicService: not connected during poll, count=', this.consecutiveNotConnected);
          if (this.consecutiveNotConnected >= 3) {
            if (onDisconnect) onDisconnect();
            this.handleDisconnect();
          }
          return;
        }
        this.consecutiveNotConnected = 0;

        const available = await BluetoothClassic.available();
        console.debug('BluetoothClassicService: available=', available);
        if (!available) return;

        let data: string | null = null;
        try {
          data = await BluetoothClassic.readUntilDelimiter(this.readDelimiter);
          console.debug('BluetoothClassicService: readUntilDelimiter=', data);
        } catch (readError) {
          console.warn('BluetoothClassicService: readUntilDelimiter error', readError);
          try {
            data = await BluetoothClassic.readFromDevice();
            console.debug('BluetoothClassicService: readFromDevice=', data);
          } catch (secondaryReadError) {
            console.warn('BluetoothClassicService: readFromDevice error', secondaryReadError);
          }
        }

        if (typeof data === 'string' && data.trim().length > 0) {
          onData(data.trim());
        }
      } catch (e) {
        console.warn('BluetoothClassicService: poll error', e);
        // do not assume disconnect on a single poll failure
        return;
      }
    };

    this.pollTimer = setInterval(syncRead, 500);
    await syncRead();

    if (typeof BluetoothClassic.addListener === 'function') {
      // Keep connection state events if supported
      const lostSub = BluetoothClassic.addListener('connectionLost', (e: any) => {
        console.warn('BluetoothClassicService: connectionLost', e);
        if (onDisconnect) onDisconnect();
        this.handleDisconnect();
      });
      const discSub = BluetoothClassic.addListener('bluetoothDisconnected', (e: any) => {
        console.warn('BluetoothClassicService: bluetoothDisconnected', e);
        if (onDisconnect) onDisconnect();
        this.handleDisconnect();
      });
      this.otherSubscriptions.push(lostSub, discSub);
    } else {
      console.warn('BluetoothClassicService: addListener not available on BluetoothClassic, falling back to DeviceEventEmitter');
      const lostSub = DeviceEventEmitter.addListener('connectionLost', (e: any) => {
        console.warn('BluetoothClassicService: connectionLost (DeviceEventEmitter)', e);
        if (onDisconnect) onDisconnect();
        this.handleDisconnect();
      });
      const discSub = DeviceEventEmitter.addListener('bluetoothDisconnected', (e: any) => {
        console.warn('BluetoothClassicService: bluetoothDisconnected (DeviceEventEmitter)', e);
        if (onDisconnect) onDisconnect();
        this.handleDisconnect();
      });
      this.otherSubscriptions.push(lostSub, discSub);
    }
  }

  async cleanup() {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    if (this.otherSubscriptions && this.otherSubscriptions.length) {
      this.otherSubscriptions.forEach(s => { try { s.remove(); } catch {} });
      this.otherSubscriptions = [];
    }
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.readCallback = undefined;
    this.disconnectCallback = undefined;
    await this.disconnect();
  }
}
