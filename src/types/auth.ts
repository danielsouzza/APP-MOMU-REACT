export interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[];
}

export interface Role {
  id: number;
  name: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  currentRole: Role | null;
  setAuth: (token: string, user: User) => void;
  setRole: (role: Role) => void;
  logout: () => void;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    roles: {
      id: number;
      name: string;
    }[];
  };
} 