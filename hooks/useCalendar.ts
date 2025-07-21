/**
 * Kalender-Hook für Datumsverwaltung in der FreshTrack Anwendung
 * 
 * Stellt Funktionalitäten für Datumsauswahl, -validierung und -formatierung bereit.
 * Speziell optimiert für das deutsche Datumsformat DD.MM.YYYY und iOS-Kompatibilität.
 * 
 * Features:
 * - Deutsches Datumsformat (DD.MM.YYYY)
 * - Datumsvalidierung mit Min/Max-Bereichen
 * - iOS-spezifische Optimierungen
 * - Haptic Feedback für iOS
 * - Barrierefreiheits-Unterstützung
 */

import { useState, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';

/**
 * Eigenschaften für den useCalendar Hook
 */
interface UseCalendarProps {
  /** Anfangsdatum als String im Format DD.MM.YYYY */
  initialDate?: string;
  /** Frühestes erlaubtes Datum */
  minDate?: Date;
  /** Spätestes erlaubtes Datum */
  maxDate?: Date;
  /** Sprachcode für Lokalisierung */
  locale?: string;
}

/**
 * Rückgabewerte des useCalendar Hooks
 */
interface CalendarHook {
  /** Aktuell ausgewähltes Datum */
  selectedDate: string;
  /** Funktion zum Setzen des ausgewählten Datums */
  setSelectedDate: (date: string) => void;
  /** Validiert ob ein Datumsstring gültig ist */
  isValidDate: (dateString: string) => boolean;
  /** Formatiert ein Date-Objekt ins deutsche Format */
  formatDate: (date: Date) => string;
  /** Parst einen deutschen Datumsstring zu einem Date-Objekt */
  parseDate: (dateString: string) => Date | null;
  /** Generiert eine Liste von Datumsoptionen */
  getDateOptions: (count?: number) => Array<{
    formatted: string;
    display: string;
    date: Date;
  }>;
}

/**
 * Haupthook für Kalender-Funktionalität
 * 
 * @param props - Konfigurationsoptionen für den Kalender
 * @returns CalendarHook - Objekt mit allen Kalender-Funktionen
 */
export const useCalendar = ({
  initialDate = '',
  minDate,
  maxDate,
  locale = 'de'
}: UseCalendarProps = {}): CalendarHook => {
  const [selectedDate, setSelectedDate] = useState(initialDate);

  /**
   * Formatiert ein Date-Objekt ins deutsche Format DD.MM.YYYY
   * 
   * @param date - Zu formatierendes Date-Objekt
   * @returns string - Formatiertes Datum im deutschen Format
   */
  const formatDate = useCallback((date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }, []);

  /**
   * Parst einen deutschen Datumsstring (DD.MM.YYYY) zu einem Date-Objekt
   * 
   * Führt umfassende Validierung durch:
   * - Regex-Prüfung des Formats
   * - Bereichsvalidierung (Tag: 1-31, Monat: 1-12, Jahr: 1900-2100)
   * - Tatsächliche Datumsvalidierung (z.B. 31.02. wird abgelehnt)
   * 
   * @param dateString - Datumsstring im Format DD.MM.YYYY
   * @returns Date | null - Geparste Datum oder null bei Fehlern
   */
  const parseDate = useCallback((dateString: string): Date | null => {
    if (!dateString) return null;
    
    const germanDateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
    const match = dateString.match(germanDateRegex);
    
    if (match) {
      const [, day, month, year] = match;
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      
      // Grundvalidierung der Bereiche
      if (dayNum < 1 || dayNum > 31) return null;
      if (monthNum < 1 || monthNum > 12) return null;
      if (yearNum < 1900 || yearNum > 2100) return null;
      
      // Erstelle Datum und validiere ob es tatsächlich gültig ist
      const testDate = new Date(yearNum, monthNum - 1, dayNum);
      if (testDate.getDate() === dayNum && 
          testDate.getMonth() === monthNum - 1 && 
          testDate.getFullYear() === yearNum) {
        return testDate;
      }
    }
    
    return null;
  }, []);

  /**
   * Validiert ob ein Datumsstring gültig und innerhalb der erlaubten Bereiche ist
   * 
   * @param dateString - Zu validierender Datumsstring
   * @returns boolean - true wenn gültig, false wenn ungültig
   */
  const isValidDate = useCallback((dateString: string): boolean => {
    const date = parseDate(dateString);
    if (!date) return false;
    
    if (minDate && date < minDate) return false;
    if (maxDate && date > maxDate) return false;
    
    return true;
  }, [parseDate, minDate, maxDate]);

  /**
   * Generiert eine Liste von Datumsoptionen für Auswahllisten
   * 
   * Erstellt eine Liste von aufeinanderfolgenden Daten ab heute,
   * respektiert dabei die Min/Max-Datumsbereiche.
   * 
   * @param count - Anzahl der zu generierenden Datumsoptionen (Standard: 365)
   * @returns Array von Datumsobjekten mit formatiertem String und Display-Text
   */
  const getDateOptions = useCallback((count: number = 365): Array<{
    formatted: string;
    display: string;
    date: Date;
  }> => {
    const options = [];
    const today = new Date();
    
    for (let i = 0; i < count; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Überspringe wenn außerhalb des Min/Max-Bereichs
      if (minDate && date < minDate) continue;
      if (maxDate && date > maxDate) break;
      
      options.push({
        formatted: formatDate(date),
        display: formatDate(date),
        date: new Date(date)
      });
    }
    
    return options;
  }, [formatDate, minDate, maxDate]);

  return {
    selectedDate,
    setSelectedDate,
    isValidDate,
    formatDate,
    parseDate,
    getDateOptions
  };
};

/**
 * iOS-spezifische Kalender-Hilfsfunktionen
 * 
 * Sammlung von Utility-Funktionen für optimale iOS-Kalender-Erfahrung:
 * - Touch-Target-Größen nach iOS-Richtlinien
 * - Haptic Feedback Integration
 * - Barrierefreiheits-Optimierungen
 */
export const iOSCalendarUtils = {
  /**
   * Stellt sicher, dass Touch-Targets den iOS-Richtlinien entsprechen
   * @returns number - Minimale Touch-Target-Größe (44pt für iOS, 40pt für andere)
   */
  getMinimumTouchTarget: () => Platform.OS === 'ios' ? 44 : 40,
  
  /**
   * iOS-spezifisches Haptic Feedback
   * 
   * Löst leichtes haptisches Feedback aus, wenn auf iOS verfügbar.
   * Fehler werden stillschweigend ignoriert um Kompatibilität zu gewährleisten.
   */
  triggerHapticFeedback: () => {
    if (Platform.OS === 'ios') {
      // Importiere Haptics nur auf iOS um Fehler zu vermeiden
      import('expo-haptics').then(({ ImpactFeedbackStyle, impactAsync }) => {
        impactAsync(ImpactFeedbackStyle.Light);
      }).catch(() => {
        // Stillschweigend fehlschlagen wenn Haptics nicht verfügbar
      });
    }
  },
  
  /**
   * iOS-spezifische Datumsformatierung für Barrierefreiheit
   * 
   * Formatiert Daten in einem für Screen Reader optimierten Format
   * mit vollständigen Wochentag-, Monats- und Jahresangaben.
   * 
   * @param date - Datumsstring
   * @param locale - Sprachcode (Standard: 'de')
   * @returns string - Barrierefreundlich formatiertes Datum
   */
  formatForAccessibility: (date: string, locale: string = 'de') => {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return date;
    
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    return dateObj.toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US', options);
  }
};