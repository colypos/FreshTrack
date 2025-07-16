/**
 * Benutzer-Konfiguration für Restaurant Aarberg
 * Definiert die drei Standard-Benutzerkonten für den Prototyp
 * 
 * WICHTIGER HINWEIS: Alle Benutzer haben derzeit Vollzugriff (Prototyp-Status)
 * In der Produktion müssen rollenbasierte Berechtigungen implementiert werden
 * 
 * @author FreshTrack Development Team
 * @version 1.0.0
 * @since 2025-01-27
 */

import { User, Permission } from '@/types/auth';

/**
 * Vollzugriffs-Berechtigungen (Prototyp)
 * SICHERHEITSHINWEIS: In Produktion durch rollenspezifische Berechtigungen ersetzen
 */
const FULL_ACCESS_PERMISSIONS: Permission[] = [
  {
    id: 'perm_dashboard_read',
    name: 'Dashboard Lesen',
    description: 'Zugriff auf Dashboard-Übersicht',
    resource: 'dashboard',
    action: 'read'
  },
  {
    id: 'perm_inventory_full',
    name: 'Inventar Vollzugriff',
    description: 'Vollzugriff auf Inventarverwaltung',
    resource: 'inventory',
    action: 'full'
  },
  {
    id: 'perm_scanner_full',
    name: 'Scanner Vollzugriff',
    description: 'Vollzugriff auf Barcode-Scanner',
    resource: 'scanner',
    action: 'full'
  },
  {
    id: 'perm_movements_full',
    name: 'Bewegungen Vollzugriff',
    description: 'Vollzugriff auf Lagerbewegungen',
    resource: 'movements',
    action: 'full'
  },
  {
    id: 'perm_settings_full',
    name: 'Einstellungen Vollzugriff',
    description: 'Vollzugriff auf Systemeinstellungen',
    resource: 'settings',
    action: 'full'
  },
  {
    id: 'perm_export_data',
    name: 'Daten Export',
    description: 'Berechtigung zum Exportieren von Daten',
    resource: 'data',
    action: 'export'
  },
  {
    id: 'perm_import_data',
    name: 'Daten Import',
    description: 'Berechtigung zum Importieren von Daten',
    resource: 'data',
    action: 'import'
  }
];

/**
 * Standard-Benutzerkonten für Restaurant Aarberg
 * Alle drei Benutzer haben derzeit identische Vollzugriffs-Berechtigungen (Prototyp)
 */
export const DEFAULT_USERS: Readonly<User[]> = Object.freeze([
  {
    id: 'user_kitchen_001',
    username: 'kueche',
    role: 'kitchen',
    displayName: 'Küche-Benutzer',
    email: 'kueche@restaurant-aarberg.ch',
    createdAt: '2025-01-27T10:00:00Z',
    lastLogin: undefined,
    isActive: true,
    permissions: [...FULL_ACCESS_PERMISSIONS] // Vollzugriff (Prototyp)
  },
  {
    id: 'user_cashier_001',
    username: 'kasse',
    role: 'cashier',
    displayName: 'Kasse-Benutzer',
    email: 'kasse@restaurant-aarberg.ch',
    createdAt: '2025-01-27T10:00:00Z',
    lastLogin: undefined,
    isActive: true,
    permissions: [...FULL_ACCESS_PERMISSIONS] // Vollzugriff (Prototyp)
  },
  {
    id: 'user_manager_001',
    username: 'verwalter',
    role: 'manager',
    displayName: 'Verwalter-Benutzer',
    email: 'verwalter@restaurant-aarberg.ch',
    createdAt: '2025-01-27T10:00:00Z',
    lastLogin: undefined,
    isActive: true,
    permissions: [...FULL_ACCESS_PERMISSIONS] // Vollzugriff (Prototyp)
  }
]);

/**
 * Benutzer-Suche nach Username
 */
export const findUserByUsername = (username: string): User | undefined => {
  return DEFAULT_USERS.find(user => 
    user.username.toLowerCase() === username.toLowerCase() && user.isActive
  );
};

/**
 * Benutzer-Suche nach ID
 */
export const findUserById = (id: string): User | undefined => {
  return DEFAULT_USERS.find(user => user.id === id && user.isActive);
};

/**
 * Alle aktiven Benutzer abrufen
 */
export const getActiveUsers = (): User[] => {
  return DEFAULT_USERS.filter(user => user.isActive);
};

/**
 * Rollen-Mapping für UI-Anzeige
 */
export const ROLE_DISPLAY_NAMES = Object.freeze({
  kitchen: 'Küche',
  cashier: 'Kasse',
  manager: 'Verwalter'
});

/**
 * Rollen-Beschreibungen für UI
 */
export const ROLE_DESCRIPTIONS = Object.freeze({
  kitchen: 'Zuständig für Lagerbestand und Wareneingänge',
  cashier: 'Zuständig für Verkäufe und Warenausgänge',
  manager: 'Vollzugriff auf alle Systemfunktionen'
});

/**
 * Rollen-Icons für UI (Lucide Icon Namen)
 */
export const ROLE_ICONS = Object.freeze({
  kitchen: 'ChefHat',
  cashier: 'CreditCard',
  manager: 'Shield'
});

/**
 * Validierung der Benutzer-Konfiguration
 */
export const validateUserConfig = (): boolean => {
  if (DEFAULT_USERS.length !== 3) {
    console.error('❌ Es müssen exakt 3 Benutzer konfiguriert sein');
    return false;
  }
  
  const requiredRoles = ['kitchen', 'cashier', 'manager'];
  const configuredRoles = DEFAULT_USERS.map(user => user.role);
  
  const hasAllRoles = requiredRoles.every(role => configuredRoles.includes(role as any));
  if (!hasAllRoles) {
    console.error('❌ Nicht alle erforderlichen Rollen sind konfiguriert');
    return false;
  }
  
  return true;
};

// Entwicklungs-Validierung
if (__DEV__ && !validateUserConfig()) {
  throw new Error('Benutzer-Konfiguration ist fehlerhaft');
}