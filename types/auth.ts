export interface User {
  id: string;
  username: string;
  role: UserRole;
  displayName: string;
  email: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  permissions: Permission[];
}

export type UserRole = 'kitchen' | 'cashier' | 'manager';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password?: string; // Optional for prototype
}

export interface RestaurantConfig {
  name: string;
  id: string;
  address: string;
  phone: string;
  email: string;
}