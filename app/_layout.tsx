import { Stack } from "expo-router";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TouchableOpacity, View, Text, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../src/stores/auth';
import { useRouter, usePathname } from 'expo-router';

// Previne que a splash screen seja escondida automaticamente
SplashScreen.preventAutoHideAsync();

function HeaderRight() {
  const { currentRole, user } = useAuthStore();
  const router = useRouter();
  const route = usePathname();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  if (route === '/screens/select-role') {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={() => setIsMenuVisible(true)}
        style={styles.menuButton}
      >
        <Ionicons name="person-circle-outline" size={28} color="#007AFF" />
      </TouchableOpacity>

      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userRole}>{currentRole?.name}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setIsMenuVisible(false);
                router.push('/screens/select-role');
              }}
            >
              <Ionicons name="swap-horizontal" size={20} color="#666" />
              <Text style={styles.menuItemText}>Trocar Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, styles.menuItemDanger]}
              onPress={() => {
                setIsMenuVisible(false);
                useAuthStore.getState().logout();
                router.replace('/screens/login');
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
              <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Sair</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 15,
  },
  menuButton: {
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  modalContent: {
    position: 'absolute',
    top: 60,
    right: 15,
    width: 250,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userInfo: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#666',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  menuItemDanger: {
    marginTop: 4,
  },
  menuItemTextDanger: {
    color: '#FF3B30',
  },
});

export default function Layout() {
  const [fontsLoaded] = useFonts({
    // Adicione suas fontes aqui se necessário
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          contentStyle: { backgroundColor: '#fff' },
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          presentation: 'card',
          headerRight: () => <HeaderRight />,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="screens/login"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="screens/select-role"
          options={{
            title: 'Selecionar Perfil',
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="screens/assessments"
          options={{
            title: 'Avaliações',
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="screens/assessment-result"
          options={{
            title: 'Resultado da Avaliação',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
