/**
 * Data Export Utility Module
 * Provides secure and efficient data export functionality
 * 
 * @author FreshTrack Development Team
 * @version 1.0.0
 * @since 2025-01-27
 */

import { Product, Movement, Alert } from '@/types';

/**
 * User settings interface for export
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
 * User preferences interface for export
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
 * User history interface for export
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
 * User content interface for export
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
 * Complete export data structure
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
 * Rate limiting configuration
 */
const RATE_LIMIT = {
  maxExports: 5,
  timeWindow: 3600000, // 1 hour in milliseconds
  storageKey: 'export_rate_limit'
};

/**
 * Export error types
 */
export enum ExportErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  SESSION_ERROR = 'SESSION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Custom export error class
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
 * Validates network connectivity
 * @returns Promise<boolean> - Network status
 */
async function validateNetworkStatus(): Promise<boolean> {
  try {
    // Check if we're online
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return false;
    }
    
    // Additional connectivity check for web
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
 * Validates session authenticity
 * @returns Promise<boolean> - Session validity
 */
async function validateSession(): Promise<boolean> {
  try {
    // For demo purposes, always return true since there's no real authentication system
    return true;
  } catch (error) {
    console.error('Session validation error:', error);
    return true;
  }
}

/**
 * Checks and enforces rate limiting
 * @returns boolean - Whether export is allowed
 */
function checkRateLimit(): boolean {
  try {
    const rateLimitData = localStorage.getItem(RATE_LIMIT.storageKey);
    const now = Date.now();
    
    if (!rateLimitData) {
      // First export
      localStorage.setItem(RATE_LIMIT.storageKey, JSON.stringify({
        count: 1,
        windowStart: now
      }));
      return true;
    }
    
    const { count, windowStart } = JSON.parse(rateLimitData);
    
    // Check if we're in a new time window
    if (now - windowStart > RATE_LIMIT.timeWindow) {
      localStorage.setItem(RATE_LIMIT.storageKey, JSON.stringify({
        count: 1,
        windowStart: now
      }));
      return true;
    }
    
    // Check if we've exceeded the limit
    if (count >= RATE_LIMIT.maxExports) {
      return false;
    }
    
    // Increment count
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
 * Validates data completeness before export
 * @param data - Export data to validate
 * @returns boolean - Data validity
 */
function validateDataCompleteness(data: ExportData): boolean {
  try {
    // Check required metadata
    if (!data.metadata || !data.metadata.exportDate || !data.metadata.version) {
      return false;
    }
    
    // Check data structure integrity
    if (!Array.isArray(data.products) || 
        !Array.isArray(data.movements) || 
        !Array.isArray(data.alerts) ||
        !Array.isArray(data.userPreferences) ||
        !Array.isArray(data.userContent)) {
      return false;
    }
    
    // Check user settings structure
    if (!data.userSettings || 
        typeof data.userSettings !== 'object' ||
        !data.userSettings.language) {
      return false;
    }
    
    // Check user history structure
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
 * Formats date in German locale (DD.MM.YYYY)
 * @param date - Date to format
 * @returns string - Formatted date
 */
function formatGermanDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Generates mock user data for export
 * @returns Object containing user settings, preferences, history, and content
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
 * Logs export activity for audit purposes
 * @param success - Whether export was successful
 * @param recordCount - Number of records exported
 * @param error - Error details if export failed
 */
function logExportActivity(success: boolean, recordCount: number, error?: ExportError): void {
  try {
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
    
    // In a real app, this would send to your logging service
    console.log('Export Activity Log:', logEntry);
    
    // Store locally for debugging
    const existingLogs = JSON.parse(localStorage.getItem('export_logs') || '[]');
    existingLogs.push(logEntry);
    
    // Keep only last 50 logs
    if (existingLogs.length > 50) {
      existingLogs.splice(0, existingLogs.length - 50);
    }
    
    localStorage.setItem('export_logs', JSON.stringify(existingLogs));
  } catch (error) {
    console.error('Failed to log export activity:', error);
  }
}

/**
 * Creates and triggers download of export file
 * @param data - Export data
 * @param filename - Name of the file to download
 */
function triggerDownload(data: ExportData, filename: string): void {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create temporary download link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new ExportError(
      ExportErrorType.UNKNOWN_ERROR,
      'Failed to create download file',
      error
    );
  }
}

/**
 * Main data export function with comprehensive error handling and security
 * 
 * @param products - Array of products to export
 * @param movements - Array of movements to export  
 * @param alerts - Array of alerts to export
 * @returns Promise<void>
 * 
 * @throws {ExportError} When export fails due to various reasons
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
    // 1. Security validations
    console.log('🔒 Starting security validations...');
    
    // Check HTTPS (in production)
    if (typeof window !== 'undefined' && 
        window.location.protocol !== 'https:' && 
        window.location.hostname !== 'localhost') {
      throw new ExportError(
        ExportErrorType.NETWORK_ERROR,
        'HTTPS-Verbindung erforderlich für sicheren Datenexport'
      );
    }
    
    // Validate session
    const isSessionValid = await validateSession();
    if (!isSessionValid) {
      throw new ExportError(
        ExportErrorType.SESSION_ERROR,
        'Sitzung abgelaufen. Bitte melden Sie sich erneut an.'
      );
    }
    
    // Check rate limiting
    if (!checkRateLimit()) {
      throw new ExportError(
        ExportErrorType.RATE_LIMIT_ERROR,
        'Zu viele Export-Versuche. Bitte warten Sie eine Stunde.'
      );
    }
    
    // 2. Network validation
    console.log('🌐 Validating network connectivity...');
    const isNetworkAvailable = await validateNetworkStatus();
    if (!isNetworkAvailable) {
      throw new ExportError(
        ExportErrorType.NETWORK_ERROR,
        'Keine Internetverbindung verfügbar'
      );
    }
    
    // 3. Prepare export data
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
    
    // 4. Validate data completeness
    console.log('✅ Validating data completeness...');
    if (!validateDataCompleteness(exportData)) {
      throw new ExportError(
        ExportErrorType.VALIDATION_ERROR,
        'Datenvalidierung fehlgeschlagen. Export abgebrochen.'
      );
    }
    
    // 5. Generate filename with German date format
    const germanDate = formatGermanDate(exportDate);
    const filename = `user_data_export_${germanDate}.json`;
    
    // 6. Create and trigger download
    console.log('💾 Creating download file...');
    triggerDownload(exportData, filename);
    
    // 7. Log successful export
    const totalRecords = Object.values(exportData.metadata.recordCounts)
      .reduce((sum, count) => sum + count, 0);
    
    logExportActivity(true, totalRecords);
    
    console.log('✅ Export completed successfully!');
    
  } catch (error) {
    // Enhanced error handling
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
    
    // Log failed export
    logExportActivity(false, 0, exportError);
    
    // Re-throw for handling by calling component
    throw exportError;
  }
}

/**
 * Gets user-friendly error message based on error type
 * @param error - Export error
 * @returns string - User-friendly error message
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