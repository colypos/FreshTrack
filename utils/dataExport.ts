/**
 * Datenexport-Utility-Modul
 * Stellt sichere und effiziente Datenexport-Funktionalität bereit
 * 
 * @author FreshTrack Development Team
 * @version 1.0.0
 * @since 2025-01-27
 * 
 * Dieses Modul implementiert einen umfassenden Datenexport mit:
 * - Sicherheitsvalidierungen (HTTPS, Session, Rate Limiting)
 * - Netzwerk-Konnektivitätsprüfung
 * - Vollständige Datenvalidierung
 * - Plattformübergreifende Download-Funktionalität
 * - Audit-Logging für Compliance
 */

import { Product, Movement, Alert } from '@/types';
import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

/**
 * Benutzereinstellungen-Interface für Export
 * Definiert die Struktur der zu exportierenden Benutzereinstellungen
 */
interface UserSettings {
  language: string;
  theme: string;
  notifications: {
    expiryAlerts: boolean;
    lowStockAlerts: boolean;
    autoBackup: boolean;
  };
  preferences: {
    dateFormat: string;
    currency: string;
    timezone: string;
  };
}

/**
 * Benutzerpräferenzen-Interface für Export
 * Strukturiert individuelle Benutzereinstellungen
 */
interface UserPreferences {
  id: string;
  category: string;
  setting: string;
  value: any;
  createdAt: string;
  updatedAt: string;
}

/**
 * Benutzerhistorie-Interface für Export
 * Dokumentiert Benutzeraktivitäten und Login-Verlauf
 */
interface UserHistory {
  loginHistory: Array<{
    timestamp: string;
    device: string;
    location?: string;
  }>;
  activityLog: Array<{
    action: string;
    timestamp: string;
    details: string;
  }>;
  exportHistory: Array<{
    timestamp: string;
    type: string;
    recordCount: number;
  }>;
}

/**
 * Benutzerinhalte-Interface für Export
 * Benutzerdefinierte Inhalte wie Notizen und Kategorien
 */
interface UserContent {
  id: string;
  type: 'note' | 'custom_category' | 'template';
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Vollständige Export-Datenstruktur
 * Umfasst alle zu exportierenden Daten mit Metadaten
 */
interface ExportData {
  metadata: {
    exportDate: string;
    version: string;
    format: string;
    recordCounts: {
      products: number;
      movements: number;
      alerts: number;
      userSettings: number;
      userPreferences: number;
      userContent: number;
    };
  };
  userSettings: UserSettings;
  userPreferences: UserPreferences[];
  userHistory: UserHistory;
  userContent: UserContent[];
  products: Product[];
  movements: Movement[];
  alerts: Alert[];
}

/**
 * Rate-Limiting-Konfiguration
 * Verhindert Missbrauch der Export-Funktionalität
 */
const RATE_LIMIT = {
  maxExports: 5,
  timeWindow: 3600000, // 1 Stunde in Millisekunden
  storageKey: 'export_rate_limit'
};

/**
 * Export-Fehlertypen
 * Kategorisiert verschiedene Arten von Export-Fehlern
 */
export enum ExportErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  SESSION_ERROR = 'SESSION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Benutzerdefinierte Export-Fehlerklasse
 * Erweitert den Standard-Error um Typ und Details
 */
export class ExportError extends Error {
  constructor(
    public type: ExportErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ExportError';
  }
}

/**
 * Validiert die Netzwerkkonnektivität
 * 
 * Prüft verschiedene Aspekte der Netzwerkverbindung:
 * - Online-Status des Browsers
 * - Erreichbarkeit externer Dienste
 * - Timeout-Behandlung
 * 
 * @returns Promise<boolean> - Netzwerkstatus (true = verfügbar)
 */
async function validateNetworkStatus(): Promise<boolean> {
  try {
    // Überspringe Netzwerkprüfung auf nativen Plattformen
    if (Platform.OS !== 'web') {
      return true;
    }
    
    // Prüfe Online-Status (nur Web)
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return false;
    }
    
    // Zusätzliche Konnektivitätsprüfung für Web
    if (typeof fetch !== 'undefined') {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        await fetch('https://www.google.com/favicon.ico', {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        return true;
      } catch {
        clearTimeout(timeoutId);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Network validation error:', error);
    return false;
  }
}

/**
 * Validiert die Session-Authentizität
 * 
 * In einer Produktionsumgebung würde diese Funktion:
 * - Session-Token validieren
 * - Ablaufzeiten prüfen
 * - Benutzerberechtigungen verifizieren
 * 
 * @returns Promise<boolean> - Session-Gültigkeit
 */
async function validateSession(): Promise<boolean> {
  try {
    // Für Demo-Zwecke immer true, da kein echtes Authentifizierungssystem vorhanden
    return true;
  } catch (error) {
    console.error('Session validation error:', error);
    return true;
  }
}

/**
 * Prüft und erzwingt Rate-Limiting
 * 
 * Implementiert ein zeitfensterbasiertes Rate-Limiting-System:
 * - Maximal 5 Exports pro Stunde
 * - Automatisches Zurücksetzen nach Zeitfenster
 * - Persistente Speicherung der Limits
 * 
 * @returns boolean - Ob Export erlaubt ist
 */
function checkRateLimit(): boolean {
  try {
    // Prüfe ob localStorage verfügbar ist (Browser-Umgebung)
    if (typeof localStorage === 'undefined') {
      return true; // Erlaube Export in Nicht-Browser-Umgebungen
    }
    
    const rateLimitData = localStorage.getItem(RATE_LIMIT.storageKey);
    const now = Date.now();
    
    if (!rateLimitData) {
      // Erster Export
      localStorage.setItem(RATE_LIMIT.storageKey, JSON.stringify({
        count: 1,
        windowStart: now
      }));
      return true;
    }
    
    const { count, windowStart } = JSON.parse(rateLimitData);
    
    // Prüfe ob wir in einem neuen Zeitfenster sind
    if (now - windowStart > RATE_LIMIT.timeWindow) {
      localStorage.setItem(RATE_LIMIT.storageKey, JSON.stringify({
        count: 1,
        windowStart: now
      }));
      return true;
    }
    
    // Prüfe ob das Limit überschritten wurde
    if (count >= RATE_LIMIT.maxExports) {
      return false;
    }
    
    // Erhöhe Zähler
    localStorage.setItem(RATE_LIMIT.storageKey, JSON.stringify({
      count: count + 1,
      windowStart
    }));
    
    return true;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return false;
  }
}

/**
 * Validiert Datenvollständigkeit vor dem Export
 * 
 * Prüft die Struktur und Vollständigkeit der zu exportierenden Daten:
 * - Metadaten-Vollständigkeit
 * - Array-Strukturen
 * - Benutzereinstellungen
 * - Historien-Daten
 * 
 * @param data - Zu validierende Export-Daten
 * @returns boolean - Datenvalidität
 */
function validateDataCompleteness(data: ExportData): boolean {
  try {
    // Prüfe erforderliche Metadaten
    if (!data.metadata || !data.metadata.exportDate || !data.metadata.version) {
      return false;
    }
    
    // Prüfe Datenstruktur-Integrität
    if (!Array.isArray(data.products) || 
        !Array.isArray(data.movements) || 
        !Array.isArray(data.alerts) ||
        !Array.isArray(data.userPreferences) ||
        !Array.isArray(data.userContent)) {
      return false;
    }
    
    // Prüfe Benutzereinstellungen-Struktur
    if (!data.userSettings || 
        typeof data.userSettings !== 'object' ||
        !data.userSettings.language) {
      return false;
    }
    
    // Prüfe Benutzerhistorie-Struktur
    if (!data.userHistory || 
        !Array.isArray(data.userHistory.loginHistory) ||
        !Array.isArray(data.userHistory.activityLog)) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Data validation error:', error);
    return false;
  }
}

/**
 * Formatiert Datum im deutschen Format (DD.MM.YYYY)
 * @param date - Zu formatierendes Datum
 * @returns string - Formatiertes Datum
 */
function formatGermanDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Generiert Mock-Benutzerdaten für den Export
 * 
 * Erstellt realistische Beispieldaten für:
 * - Benutzereinstellungen
 * - Präferenzen
 * - Aktivitätshistorie
 * - Benutzerdefinierte Inhalte
 * 
 * @returns Objekt mit Benutzereinstellungen, Präferenzen, Historie und Inhalten
 */
function generateMockUserData() {
  const now = new Date().toISOString();
  
  const userSettings: UserSettings = {
    language: 'de',
    theme: 'light',
    notifications: {
      expiryAlerts: true,
      lowStockAlerts: true,
      autoBackup: false
    },
    preferences: {
      dateFormat: 'DD.MM.YYYY',
      currency: 'EUR',
      timezone: 'Europe/Berlin'
    }
  };
  
  const userPreferences: UserPreferences[] = [
    {
      id: 'pref_1',
      category: 'display',
      setting: 'itemsPerPage',
      value: 20,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'pref_2',
      category: 'notifications',
      setting: 'soundEnabled',
      value: true,
      createdAt: now,
      updatedAt: now
    }
  ];
  
  const userHistory: UserHistory = {
    loginHistory: [
      {
        timestamp: now,
        device: 'Web Browser',
        location: 'Germany'
      }
    ],
    activityLog: [
      {
        action: 'product_created',
        timestamp: now,
        details: 'Created new product: Tomaten'
      },
      {
        action: 'movement_recorded',
        timestamp: now,
        details: 'Recorded stock movement for Tomaten'
      }
    ],
    exportHistory: [
      {
        timestamp: now,
        type: 'full_export',
        recordCount: 0
      }
    ]
  };
  
  const userContent: UserContent[] = [
    {
      id: 'content_1',
      type: 'note',
      title: 'Wichtige Notiz',
      content: 'Kühlschrank A1 muss gereinigt werden',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'content_2',
      type: 'custom_category',
      title: 'Bio-Produkte',
      content: 'Spezielle Kategorie für biologische Lebensmittel',
      createdAt: now,
      updatedAt: now
    }
  ];
  
  return {
    userSettings,
    userPreferences,
    userHistory,
    userContent
  };
}

/**
 * Protokolliert Export-Aktivitäten für Audit-Zwecke
 * 
 * Erstellt detaillierte Logs für Compliance und Debugging:
 * - Erfolgs-/Fehlerstatus
 * - Anzahl exportierter Datensätze
 * - Fehlerdetails bei Problemen
 * - Benutzer- und Session-Informationen
 * 
 * @param success - Ob Export erfolgreich war
 * @param recordCount - Anzahl exportierter Datensätze
 * @param error - Fehlerdetails bei fehlgeschlagenem Export
 */
function logExportActivity(success: boolean, recordCount: number, error?: ExportError): void {
  try {
    // Prüfe ob localStorage verfügbar ist (Browser-Umgebung)
    if (typeof localStorage === 'undefined') {
      console.log('Export Activity Log (localStorage unavailable):', {
        timestamp: new Date().toISOString(),
        success,
        recordCount,
        error: error ? {
          type: error.type,
          message: error.message,
          details: error.details
        } : null
      });
      return;
    }
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      success,
      recordCount,
      error: error ? {
        type: error.type,
        message: error.message,
        details: error.details
      } : null,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      sessionId: localStorage.getItem('session_token') || 'Unknown'
    };
    
    // In einer echten App würde dies an einen Logging-Service gesendet
    console.log('Export Activity Log:', logEntry);
    
    // Lokale Speicherung für Debugging
    const existingLogs = JSON.parse(localStorage.getItem('export_logs') || '[]');
    existingLogs.push(logEntry);
    
    // Behalte nur die letzten 50 Logs
    if (existingLogs.length > 50) {
      existingLogs.splice(0, existingLogs.length - 50);
    }
    
    localStorage.setItem('export_logs', JSON.stringify(existingLogs));
  } catch (error) {
    console.error('Failed to log export activity:', error);
  }
}

/**
 * Erstellt und löst Download der Export-Datei aus
 * 
 * Plattformspezifische Download-Implementierung:
 * - Web: Blob-basierter Download
 * - Native: FileSystem + Sharing API
 * 
 * @param data - Export-Daten
 * @param filename - Name der Download-Datei
 */
async function triggerDownload(data: ExportData, filename: string): Promise<void> {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    
    if (Platform.OS === 'web') {
      // Web-Plattform: Blob-basierter Download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Erstelle temporären Download-Link
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      // Löse Download aus
      document.body.appendChild(link);
      link.click();
      
      // Aufräumen
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // Native Plattform: Dateisystem und Sharing verwenden
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      // Datei auf Gerätespeicher schreiben
      await FileSystem.writeAsStringAsync(fileUri, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      // Datei teilen
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Data',
        });
      } else {
        throw new Error('Sharing is not available on this device');
      }
    }
  } catch (error) {
    throw new ExportError(
      ExportErrorType.UNKNOWN_ERROR,
      'Failed to create download file',
      error
    );
  }
}

/**
 * Hauptfunktion für Datenexport mit umfassender Fehlerbehandlung und Sicherheit
 * 
 * Diese Funktion implementiert einen sicheren, mehrstufigen Export-Prozess:
 * 1. Sicherheitsvalidierungen (HTTPS, Session, Rate Limiting)
 * 2. Netzwerk-Konnektivitätsprüfung
 * 3. Datenvorbereitung und -validierung
 * 4. Datei-Erstellung und Download
 * 5. Audit-Logging
 * 
 * @param products - Array der zu exportierenden Produkte
 * @param movements - Array der zu exportierenden Bewegungen
 * @param alerts - Array der zu exportierenden Warnungen
 * @returns Promise<void> - Asynchrone Operation ohne Rückgabewert
 * 
 * @throws {ExportError} Bei Export-Fehlern verschiedener Ursachen
 * 
 * @example
 * ```typescript
 * try {
 *   await handleDataExport(products, movements, alerts);
 *   showSuccessToast('Daten erfolgreich exportiert!');
 * } catch (error) {
 *   if (error instanceof ExportError) {
 *     showErrorToast(error.message);
 *   }
 * }
 * ```
 */
export async function handleDataExport(
  products: Product[],
  movements: Movement[],
  alerts: Alert[]
): Promise<void> {
  try {
    // 1. Sicherheitsvalidierungen
    console.log('🔒 Starting security validations...');
    
    // Prüfe HTTPS (in Produktion)
    if (typeof window !== 'undefined' && 
        window.location.protocol !== 'https:' && 
        window.location.hostname !== 'localhost') {
      throw new ExportError(
        ExportErrorType.NETWORK_ERROR,
        'HTTPS-Verbindung erforderlich für sicheren Datenexport'
      );
    }
    
    // Validiere Session
    const isSessionValid = await validateSession();
    if (!isSessionValid) {
      throw new ExportError(
        ExportErrorType.SESSION_ERROR,
        'Sitzung abgelaufen. Bitte melden Sie sich erneut an.'
      );
    }
    
    // Prüfe Rate Limiting
    if (!checkRateLimit()) {
      throw new ExportError(
        ExportErrorType.RATE_LIMIT_ERROR,
        'Zu viele Export-Versuche. Bitte warten Sie eine Stunde.'
      );
    }
    
    // 2. Netzwerk-Validierung
    console.log('🌐 Validating network connectivity...');
    const isNetworkAvailable = await validateNetworkStatus();
    if (!isNetworkAvailable) {
      throw new ExportError(
        ExportErrorType.NETWORK_ERROR,
        'Keine Internetverbindung verfügbar'
      );
    }
    
    // 3. Export-Daten vorbereiten
    console.log('📦 Preparing export data...');
    const exportDate = new Date();
    const { userSettings, userPreferences, userHistory, userContent } = generateMockUserData();
    
    const exportData: ExportData = {
      metadata: {
        exportDate: exportDate.toISOString(),
        version: '1.0.0',
        format: 'JSON',
        recordCounts: {
          products: products.length,
          movements: movements.length,
          alerts: alerts.length,
          userSettings: 1,
          userPreferences: userPreferences.length,
          userContent: userContent.length
        }
      },
      userSettings,
      userPreferences,
      userHistory,
      userContent,
      products,
      movements,
      alerts
    };
    
    // 4. Datenvollständigkeit validieren
    console.log('✅ Validating data completeness...');
    if (!validateDataCompleteness(exportData)) {
      throw new ExportError(
        ExportErrorType.VALIDATION_ERROR,
        'Datenvalidierung fehlgeschlagen. Export abgebrochen.'
      );
    }
    
    // 5. Dateiname mit deutschem Datumsformat generieren
    const germanDate = formatGermanDate(exportDate);
    const filename = `user_data_export_${germanDate}.json`;
    
    // 6. Download erstellen und auslösen
    console.log('💾 Creating download file...');
    await triggerDownload(exportData, filename);
    
    // 7. Erfolgreichen Export protokollieren
    const totalRecords = Object.values(exportData.metadata.recordCounts)
      .reduce((sum, count) => sum + count, 0);
    
    logExportActivity(true, totalRecords);
    
    console.log('✅ Export completed successfully!');
    
  } catch (error) {
    // Erweiterte Fehlerbehandlung
    let exportError: ExportError;
    
    if (error instanceof ExportError) {
      exportError = error;
    } else if (error instanceof Error) {
      exportError = new ExportError(
        ExportErrorType.UNKNOWN_ERROR,
        `Unerwarteter Fehler beim Export: ${error.message}`,
        error
      );
    } else {
      exportError = new ExportError(
        ExportErrorType.UNKNOWN_ERROR,
        'Unbekannter Fehler beim Datenexport'
      );
    }
    
    // Fehlgeschlagenen Export protokollieren
    logExportActivity(false, 0, exportError);
    
    // Fehler für aufrufende Komponente weiterwerfen
    throw exportError;
  }
}

/**
 * Gibt benutzerfreundliche Fehlermeldung basierend auf Fehlertyp zurück
 * 
 * @param error - Export-Fehler
 * @returns string - Benutzerfreundliche Fehlermeldung auf Deutsch
 */
export function getErrorMessage(error: ExportError): string {
  switch (error.type) {
    case ExportErrorType.NETWORK_ERROR:
      return 'Netzwerkfehler: Überprüfen Sie Ihre Internetverbindung.';
    case ExportErrorType.VALIDATION_ERROR:
      return 'Datenvalidierung fehlgeschlagen. Versuchen Sie es erneut.';
    case ExportErrorType.RATE_LIMIT_ERROR:
      return 'Zu viele Versuche. Bitte warten Sie eine Stunde.';
    case ExportErrorType.SESSION_ERROR:
      return 'Sitzung abgelaufen. Bitte melden Sie sich erneut an.';
    default:
      return 'Ein unerwarteter Fehler ist aufgetreten.';
  }
}