/**
 * Authentication Hook für Restaurant Aarberg
 * Verwaltet Benutzeranmeldung und Authentifizierungsstatus
 * 
 * @author FreshTrack Development Team
 * @version 1.0.0
 * @since 2025-01-27
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState, LoginCredentials } from '@/types/auth';
import { DEFAULT_USERS, findUserByUsername, findUserById } from '@/constants/users';

const AUTH_STORAGE_KEY = 'restaurant_auth_user';
const LAST_LOGIN_KEY = 'restaurant_last_login';

/**
 * Authentication Hook
 * Bietet Funktionen für Login, Logout und Authentifizierungsstatus
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    currentUser: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  /**
   * Lädt gespeicherte Authentifizierungsdaten beim App-Start
   */
  const loadStoredAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const storedUserId = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      
      if (storedUserId) {
        const user = findUserById(storedUserId);
        
        if (user && user.isActive) {
          setAuthState({
            currentUser: user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          // Letzten Login-Zeitpunkt aktualisieren
          await updateLastLogin(user.id);
          
          console.log(`✅ Benutzer automatisch angemeldet: ${user.displayName}`);
        } else {
          // Ungültiger gespeicherter Benutzer
          await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          setAuthState({
            currentUser: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      } else {
        setAuthState({
          currentUser: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Fehler beim Laden der Authentifizierung:', error);
      setAuthState({
        currentUser: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Fehler beim Laden der Anmeldedaten'
      });
    }
  }, []);

  /**
   * Aktualisiert den letzten Login-Zeitpunkt
   */
  const updateLastLogin = async (userId: string) => {
    try {
      const loginTime = new Date().toISOString();
      await AsyncStorage.setItem(`${LAST_LOGIN_KEY}_${userId}`, loginTime);
    } catch (error) {
      console.error('Fehler beim Speichern des Login-Zeitpunkts:', error);
    }
  };

  /**
   * Benutzer-Login
   * PROTOTYP: Verwendet nur Username, kein Passwort erforderlich
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Validierung
      if (!credentials.username || credentials.username.trim().length === 0) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Benutzername ist erforderlich'
        }));
        return false;
      }
      
      // Benutzer suchen
      const user = findUserByUsername(credentials.username.trim());
      
      if (!user) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Benutzer nicht gefunden'
        }));
        return false;
      }
      
      if (!user.isActive) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Benutzerkonto ist deaktiviert'
        }));
        return false;
      }
      
      // Erfolgreiche Anmeldung
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, user.id);
      await updateLastLogin(user.id);
      
      setAuthState({
        currentUser: user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      console.log(`✅ Benutzer angemeldet: ${user.displayName} (${user.role})`);
      return true;
      
    } catch (error) {
      console.error('Login-Fehler:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Anmeldung fehlgeschlagen'
      }));
      return false;
    }
  }, []);

  /**
   * Benutzer-Logout
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      const currentUser = authState.currentUser;
      
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      
      setAuthState({
        currentUser: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      
      if (currentUser) {
        console.log(`✅ Benutzer abgemeldet: ${currentUser.displayName}`);
      }
      
    } catch (error) {
      console.error('Logout-Fehler:', error);
      // Auch bei Fehlern den lokalen State zurücksetzen
      setAuthState({
        currentUser: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    }
  }, [authState.currentUser]);

  /**
   * Schneller Benutzerwechsel (für Prototyp)
   */
  const switchUser = useCallback(async (username: string): Promise<boolean> => {
    await logout();
    return await login({ username });
  }, [login, logout]);

  /**
   * Berechtigung prüfen
   */
  const hasPermission = useCallback((resource: string, action: string): boolean => {
    if (!authState.currentUser) return false;
    
    return authState.currentUser.permissions.some(permission =>
      permission.resource === resource && 
      (permission.action === action || permission.action === 'full')
    );
  }, [authState.currentUser]);

  /**
   * Rolle prüfen
   */
  const hasRole = useCallback((role: string): boolean => {
    return authState.currentUser?.role === role;
  }, [authState.currentUser]);

  /**
   * Alle verfügbaren Benutzer abrufen (für Benutzerauswahl)
   */
  const getAvailableUsers = useCallback((): User[] => {
    return DEFAULT_USERS.filter(user => user.isActive);
  }, []);

  /**
   * Letzten Login-Zeitpunkt abrufen
   */
  const getLastLogin = useCallback(async (userId: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(`${LAST_LOGIN_KEY}_${userId}`);
    } catch (error) {
      console.error('Fehler beim Abrufen des letzten Logins:', error);
      return null;
    }
  }, []);

  /**
   * Fehler zurücksetzen
   */
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  // Authentifizierung beim Hook-Start laden
  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  // Debug-Informationen in Development
  useEffect(() => {
    if (__DEV__) {
      console.log('🔐 Auth State:', {
        isAuthenticated: authState.isAuthenticated,
        currentUser: authState.currentUser?.displayName,
        role: authState.currentUser?.role,
        isLoading: authState.isLoading,
        error: authState.error
      });
    }
  }, [authState]);

  return {
    // State
    ...authState,
    
    // Actions
    login,
    logout,
    switchUser,
    clearError,
    
    // Utilities
    hasPermission,
    hasRole,
    getAvailableUsers,
    getLastLogin,
    
    // Computed
    isManager: authState.currentUser?.role === 'manager',
    isKitchen: authState.currentUser?.role === 'kitchen',
    isCashier: authState.currentUser?.role === 'cashier',
  };
};

/**
 * Hook für Authentifizierungs-Schutz
 * Leitet nicht-authentifizierte Benutzer zur Anmeldung weiter
 */
export const useRequireAuth = () => {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      // In einer echten App würde hier eine Weiterleitung zur Login-Seite erfolgen
      console.warn('⚠️ Benutzer nicht authentifiziert - Weiterleitung zur Anmeldung erforderlich');
    }
  }, [auth.isLoading, auth.isAuthenticated]);
  
  return auth;
};