import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomNavProps {
  currentRoute?: string;
}

export function BottomNav({ currentRoute }: BottomNavProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleNavigation = (route: '/' | '/historico' | '/alertas' | '/settings') => {
    router.push(route);
  };

  const isActive = (route: '/' | '/historico' | '/alertas' | '/settings') => currentRoute === route;

  return (
    <View style={[styles.bottomNav, { paddingBottom: insets.bottom }]}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => handleNavigation('/')}
      >
        <Feather 
          name="home" 
          size={18} 
          color={isActive('/') ? '#4A9943' : '#94A3B8'} 
        />
        <Text style={[styles.navText, isActive('/') && styles.navTextActive]}>
          Início
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => handleNavigation('/historico')}
      >
        <Feather 
          name="bar-chart-2" 
          size={18} 
          color={isActive('/historico') ? '#4A9943' : '#94A3B8'} 
        />
        <Text style={[styles.navText, isActive('/historico') && styles.navTextActive]}>
          Histórico
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => handleNavigation('/alertas')}
      >
        <Feather
          name="alert-circle"
          size={18}
          color={isActive('/alertas') ? '#4A9943' : '#94A3B8'}
        />
        <Text style={[styles.navText, isActive('/alertas') && styles.navTextActive]}>
          Alertas
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => handleNavigation('/settings')}
      >
        <Feather
          name="settings"
          size={18}
          color={isActive('/settings') ? '#4A9943' : '#94A3B8'}
        />
        <Text style={[styles.navText, isActive('/settings') && styles.navTextActive]}>
          Config.
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 8,
    ...(Platform.OS === 'android'
      ? { elevation: 12 }
      : { shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: -6 } }),
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 68,
    gap: 2,
  },
  navText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  navTextActive: {
    color: '#4A9943',
  },
});
