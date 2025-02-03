import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/auth';
import { Role } from '../../src/types/auth';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import { User } from '../../src/types/auth';

const roleIcons: Record<string, string> = {
  'admin': 'settings',
  'coordinator': 'school',
  'director': 'business',
  'evaluator': 'clipboard',
};

const roleDescriptions: Record<string, string> = {
  'admin': 'Acesso administrativo completo ao sistema.',
  'coordinator': 'Visualize e gerencie as avaliações dos cursos sob sua coordenação.',
  'director': 'Acompanhe e analise os resultados de todos os cursos.',
  'evaluator': 'Realize avaliações e acompanhe seus resultados individuais.',
};

const roleDisplayNames: Record<string, string> = {
  'admin': 'Administrador',
  'coordinator': 'Coordenador',
  'director': 'Diretor',
  'evaluator': 'Avaliador',
};

export default function SelectRoleScreen() {
  const router = useRouter();
  const { user, setAuth, setRole, logout } = useAuthStore();

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data } = await api.get<User>('user');
      
        if (data) {
          
          setAuth(useAuthStore.getState().token!, data);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados do usuário');
      }
    }

    loadUserData();
  }, []);


  const handleLogout = () => {
    logout();
    router.replace('/screens/login');
  };

  // Adicionar verificação se não há usuário ou roles
  if (!user || !user.roles?.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhum perfil disponível</Text>
      </View>
    );
  }

  async function handleSelectRole(role: Role) {
    try {
      await api.post(`/switch-role/${role.id}`);
      setRole(role);
      
      // Se for avaliador, força o modo não agrupado
      if (role.name === 'evaluator') {
        router.replace({
          pathname: '/screens/assessments',
          params: { forceUngrouped: 'true' }
        });
      } else {
        router.replace('/screens/assessments');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível selecionar este perfil');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Selecione seu perfil</Text>
        <Text style={styles.subtitle}>
          Olá, {user.name}! Escolha como deseja acessar o sistema:
        </Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.rolesContainer}
        showsVerticalScrollIndicator={false}
      >
        {user.roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={styles.roleCard}
            onPress={() => handleSelectRole(role)}
          >
            <View style={styles.roleIconContainer}>
              <Ionicons 
                name={(roleIcons[role.name] + '-outline') as keyof typeof Ionicons.glyphMap}
                size={32}
                color="#007AFF"
              />
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleName}>
                {roleDisplayNames[role.name] || role.name}
              </Text>
              <Text style={styles.roleDescription}>
                {roleDescriptions[role.name] || 'Acesse funcionalidades específicas do sistema.'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
        <Text style={styles.logoutButtonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  rolesContainer: {
    padding: 20,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  roleIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  roleInfo: {
    flex: 1,
    marginRight: 10,
  },
  roleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFF',
    borderRadius: 10,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
}); 