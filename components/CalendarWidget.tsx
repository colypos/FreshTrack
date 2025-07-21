/**
 * Kalender-Widget-Komponente für Datumsauswahl
 * 
 * Eine vollständig funktionale Kalender-Komponente mit:
 * - Deutschem Datumsformat (DD.MM.YYYY)
 * - Monatsnavigation
 * - Datumsbereichs-Validierung
 * - iOS-optimierten Touch-Targets
 * - Barrierefreiheits-Unterstützung
 * - Responsive Design
 * 
 * Speziell entwickelt für die FreshTrack Anwendung mit Fokus auf
 * Benutzerfreundlichkeit und plattformübergreifende Kompatibilität.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react-native';
import designSystem from '@/styles/designSystem';

/**
 * Props für die CalendarWidget-Komponente
 */
interface CalendarWidgetProps {
  /** Aktuell ausgewähltes Datum im Format DD.MM.YYYY */
  selectedDate?: string;
  /** Callback wenn ein Datum ausgewählt wird */
  onDateSelect: (date: string) => void;
  /** Frühestes auswählbares Datum */
  minDate?: Date;
  /** Spätestes auswählbares Datum */
  maxDate?: Date;
  /** Sprachcode für Lokalisierung */
  locale?: string;
}

/**
 * Interface für einen Kalendertag
 */
interface CalendarDay {
  /** Date-Objekt für den Tag */
  date: Date;
  /** Formatiertes Datum (DD.MM.YYYY) */
  formatted: string;
  /** Anzeige-Text (Tagesnummer) */
  display: string;
  /** Ist heute */
  isToday: boolean;
  /** Ist ausgewählt */
  isSelected: boolean;
  /** Gehört zum aktuellen Monat */
  isCurrentMonth: boolean;
  /** Ist deaktiviert (außerhalb erlaubter Bereiche) */
  isDisabled: boolean;
}

/**
 * CalendarWidget Hauptkomponente
 * 
 * Vollständige Kalender-Implementierung mit Monatsnavigation,
 * Datumsauswahl und Validierung.
 * 
 * @param props - Kalender-Konfiguration und Event-Callbacks
 * @returns JSX.Element - Interaktive Kalender-Komponente
 */
export default function CalendarWidget({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  locale = 'de'
}: CalendarWidgetProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  /**
   * Monatsnamen in verschiedenen Sprachen
   */
  const monthNames = {
    de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
         'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    en: ['January', 'February', 'March', 'April', 'May', 'June',
         'July', 'August', 'September', 'October', 'November', 'December']
  };
  
  /**
   * Tagesnamen in verschiedenen Sprachen (abgekürzt)
   */
  const dayNames = {
    de: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  };

  /**
   * Formatiert ein Date-Objekt ins deutsche Format DD.MM.YYYY
   * 
   * @param date - Zu formatierendes Date-Objekt
   * @returns string - Formatiertes Datum
   */
  const formatGermanDate = useCallback((date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }, []);

  /**
   * Parst einen deutschen Datumsstring zu einem Date-Objekt
   * 
   * @param dateString - Datumsstring im Format DD.MM.YYYY
   * @returns Date | null - Geparste Datum oder null bei Fehlern
   */
  const parseGermanDate = useCallback((dateString: string): Date | null => {
    if (!dateString) return null;
    
    const germanDateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
    const match = dateString.match(germanDateRegex);
    
    if (match) {
      const [, day, month, year] = match;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    return null;
  }, []);

  /**
   * Prüft ob ein Datum deaktiviert werden soll
   * 
   * @param date - Zu prüfendes Datum
   * @returns boolean - true wenn deaktiviert
   */
  const isDateDisabled = useCallback((date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  }, [minDate, maxDate]);

  /**
   * Generiert alle Kalendertage für den aktuellen Monat
   * 
   * Erstellt ein vollständiges Kalender-Grid mit:
   * - Tagen des aktuellen Monats
   * - Tagen der vorherigen/nächsten Monate für vollständige Wochen
   * - Status-Informationen für jeden Tag
   * 
   * @returns Array von CalendarDay-Objekten
   */
  const generateCalendarDays = useMemo((): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const today = new Date();
    const selectedDateObj = selectedDate ? parseGermanDate(selectedDate) : null;
    
    // Erster Tag des Monats
    const firstDay = new Date(year, month, 1);
    // Letzter Tag des Monats
    const lastDay = new Date(year, month + 1, 0);
    
    // Starte vom ersten Tag der Woche die den ersten Monatstag enthält
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Ende am letzten Tag der Woche die den letzten Monatstag enthält
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === today.toDateString();
      const isSelected = selectedDateObj ? 
        currentDate.toDateString() === selectedDateObj.toDateString() : false;
      const isDisabled = isDateDisabled(currentDate);
      
      days.push({
        date: new Date(currentDate),
        formatted: formatGermanDate(currentDate),
        display: currentDate.getDate().toString(),
        isToday,
        isSelected,
        isCurrentMonth,
        isDisabled
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }, [currentMonth, selectedDate, parseGermanDate, formatGermanDate, isDateDisabled]);

  /**
   * Behandelt Klicks auf Kalendertage
   * 
   * @param day - Angeklickter Kalendertag
   */
  const handleDatePress = useCallback((day: CalendarDay) => {
    if (day.isDisabled) return;
    onDateSelect(day.formatted);
  }, [onDateSelect]);

  /**
   * Navigiert zwischen Monaten
   * 
   * @param direction - Navigationsrichtung ('prev' oder 'next')
   */
  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  }, []);

  /**
   * Springt zum heutigen Datum und wählt es aus
   */
  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(today);
    onDateSelect(formatGermanDate(today));
  }, [formatGermanDate, onDateSelect]);

  return (
    <View style={styles.container}>
      {/* Kalender-Header mit Monatsnavigation */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('prev')}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Vorheriger Monat"
          accessibilityRole="button"
          testID="calendar-prev-month"
        >
          <ChevronLeft size={20} color={designSystem.colors.text.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.monthTitle}
          onPress={goToToday}
          activeOpacity={0.7}
          accessibilityLabel={`${monthNames[locale as keyof typeof monthNames][currentMonth.getMonth()]} ${currentMonth.getFullYear()}, tippen für heute`}
          accessibilityRole="button"
          testID="calendar-month-title"
        >
          <Text style={styles.monthText}>
            {monthNames[locale as keyof typeof monthNames][currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('next')}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Nächster Monat"
          accessibilityRole="button"
          testID="calendar-next-month"
        >
          <ChevronRight size={20} color={designSystem.colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Tagesnamen-Header */}
      <View style={styles.dayNamesContainer}>
        {dayNames[locale as keyof typeof dayNames].map((dayName, index) => (
          <View key={index} style={styles.dayNameCell}>
            <Text style={styles.dayNameText}>{dayName}</Text>
          </View>
        ))}
      </View>

      {/* Kalender-Grid mit allen Tagen */}
      <View style={styles.calendarGrid}>
        {generateCalendarDays.map((day, index) => (
          <TouchableOpacity
            key={`${day.formatted}-${index}`}
            style={[
              styles.dayCell,
              day.isSelected && styles.dayCellSelected,
              day.isToday && !day.isSelected && styles.dayCellToday,
              !day.isCurrentMonth && styles.dayCellOtherMonth,
              day.isDisabled && styles.dayCellDisabled
            ]}
            onPress={() => handleDatePress(day)}
            disabled={day.isDisabled}
            activeOpacity={0.7}
            hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
            accessibilityLabel={`${day.formatted}${day.isToday ? ', heute' : ''}${day.isSelected ? ', ausgewählt' : ''}`}
            accessibilityRole="button"
            accessibilityState={{ 
              selected: day.isSelected,
              disabled: day.isDisabled 
            }}
            testID={`calendar-day-${day.formatted}`}
          >
            <Text style={[
              styles.dayText,
              day.isSelected && styles.dayTextSelected,
              day.isToday && !day.isSelected && styles.dayTextToday,
              !day.isCurrentMonth && styles.dayTextOtherMonth,
              day.isDisabled && styles.dayTextDisabled
            ]}>
              {day.display}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Schnellaktionen */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={goToToday}
          activeOpacity={0.7}
          accessibilityLabel="Heute auswählen"
          accessibilityRole="button"
          testID="calendar-today-button"
        >
          <Calendar size={16} color={designSystem.colors.text.primary} />
          <Text style={styles.quickActionText}>Heute</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * Styling für CalendarWidget nach Design-System
 */
const styles = StyleSheet.create({
  container: {
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.interactive.border.radius,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    padding: designSystem.spacing.lg,
    ...designSystem.shadows.low,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: designSystem.spacing.lg,
    paddingHorizontal: designSystem.spacing.sm,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: designSystem.interactive.border.radius,
    backgroundColor: designSystem.colors.background.primary,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    justifyContent: 'center',
    alignItems: 'center',
    ...designSystem.shadows.low,
  },
  monthTitle: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: designSystem.spacing.sm,
  },
  monthText: {
    ...designSystem.componentStyles.textSubtitle,
    fontWeight: '600',
    textAlign: 'center',
  },
  dayNamesContainer: {
    flexDirection: 'row',
    marginBottom: designSystem.spacing.sm,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: designSystem.spacing.sm,
  },
  dayNameText: {
    ...designSystem.componentStyles.textCaption,
    fontWeight: '600',
    color: designSystem.colors.text.secondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 7 Tage pro Woche
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: designSystem.interactive.border.radius,
    marginBottom: 2,
    minHeight: Platform.OS === 'ios' ? 44 : 40, // iOS minimales Touch-Target
    backgroundColor: 'transparent',
  },
  dayCellSelected: {
    backgroundColor: designSystem.colors.secondary[500],
    borderWidth: 2,
    borderColor: designSystem.colors.border.primary,
    ...designSystem.shadows.medium,
  },
  dayCellToday: {
    backgroundColor: designSystem.colors.success[500],
    borderWidth: 2,
    borderColor: designSystem.colors.border.primary,
    ...designSystem.shadows.medium,
  },
  dayCellOtherMonth: {
    opacity: 0.3,
  },
  dayCellDisabled: {
    opacity: 0.2,
    backgroundColor: designSystem.colors.neutral[200],
  },
  dayText: {
    ...designSystem.componentStyles.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    fontSize: Platform.OS === 'ios' ? 16 : 14,
  },
  dayTextSelected: {
    color: designSystem.colors.text.primary,
    fontWeight: 'bold',
  },
  dayTextToday: {
    color: designSystem.colors.text.primary,
    fontWeight: 'bold',
  },
  dayTextOtherMonth: {
    color: designSystem.colors.text.disabled,
  },
  dayTextDisabled: {
    color: designSystem.colors.text.disabled,
  },
  quickActions: {
    marginTop: designSystem.spacing.lg,
    paddingTop: designSystem.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: designSystem.colors.border.secondary,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: designSystem.colors.background.primary,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    borderRadius: designSystem.interactive.border.radius,
    paddingVertical: designSystem.spacing.md,
    paddingHorizontal: designSystem.spacing.lg,
    gap: designSystem.spacing.sm,
    minHeight: 44,
    ...designSystem.shadows.low,
  },
  quickActionText: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
  },
});