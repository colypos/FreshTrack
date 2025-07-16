/**
 * Restaurant Configuration Constants
 * Diese Datei enthält unveränderliche Restaurant-Konfiguration
 * 
 * @author FreshTrack Development Team
 * @version 1.0.0
 * @since 2025-01-27
 */

import { RestaurantConfig } from '@/types/auth';

/**
 * Unveränderliche Restaurant-Konfiguration
 * WICHTIG: Diese Werte dürfen zur Laufzeit NICHT verändert werden
 */
export const RESTAURANT_CONFIG: Readonly<RestaurantConfig> = Object.freeze({
  name: 'Restaurant Aarberg',
  id: 'rest_aarberg_001',
  address: 'Hauptstrasse 123, 3270 Aarberg, Schweiz',
  phone: '+41 32 392 12 34',
  email: 'info@restaurant-aarberg.ch'
});

/**
 * Validierung der Restaurant-Konfiguration
 * Stellt sicher, dass alle erforderlichen Felder vorhanden sind
 */
export const validateRestaurantConfig = (): boolean => {
  const required = ['name', 'id', 'address', 'phone', 'email'];
  return required.every(field => 
    RESTAURANT_CONFIG[field as keyof RestaurantConfig] && 
    RESTAURANT_CONFIG[field as keyof RestaurantConfig].trim().length > 0
  );
};

/**
 * Getter-Funktionen für sichere Konfigurationszugriffe
 */
export const getRestaurantName = (): string => RESTAURANT_CONFIG.name;
export const getRestaurantId = (): string => RESTAURANT_CONFIG.id;
export const getRestaurantAddress = (): string => RESTAURANT_CONFIG.address;
export const getRestaurantPhone = (): string => RESTAURANT_CONFIG.phone;
export const getRestaurantEmail = (): string => RESTAURANT_CONFIG.email;

/**
 * Entwicklungs-Validierung
 * Überprüft zur Laufzeit, ob die Konfiguration korrekt ist
 */
if (__DEV__ && !validateRestaurantConfig()) {
  console.error('❌ Restaurant-Konfiguration ist unvollständig!');
  throw new Error('Restaurant-Konfiguration fehlt erforderliche Felder');
}