import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User, Role } from '../types/auth';

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      currentRole: null,
      setAuth: (token: string, user: User) => 
        set({ isAuthenticated: true, token, user }),
      setRole: (role: Role) => 
        set({ currentRole: role }),
      logout: () => 
        set({ isAuthenticated: false, user: null, token: null, currentRole: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export { useAuthStore }; 