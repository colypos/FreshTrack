import { useState, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';

interface UseCalendarProps {
  initialDate?: string;
  minDate?: Date;
  maxDate?: Date;
  locale?: string;
}

interface CalendarHook {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  isValidDate: (dateString: string) => boolean;
  formatDate: (date: Date) => string;
  parseDate: (dateString: string) => Date | null;
  getDateOptions: (count?: number) => Array<{
    formatted: string;
    display: string;
    date: Date;
  }>;
}

export const useCalendar = ({
  initialDate = '',
  minDate,
  maxDate,
  locale = 'de'
}: UseCalendarProps = {}): CalendarHook => {
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const formatDate = useCallback((date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }, []);

  const parseDate = useCallback((dateString: string): Date | null => {
    if (!dateString) return null;
    
    const germanDateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
    const match = dateString.match(germanDateRegex);
    
    if (match) {
      const [, day, month, year] = match;
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      
      // Basic validation
      if (dayNum < 1 || dayNum > 31) return null;
      if (monthNum < 1 || monthNum > 12) return null;
      if (yearNum < 1900 || yearNum > 2100) return null;
      
      // Create date and validate it's actually valid
      const testDate = new Date(yearNum, monthNum - 1, dayNum);
      if (testDate.getDate() === dayNum && 
          testDate.getMonth() === monthNum - 1 && 
          testDate.getFullYear() === yearNum) {
        return testDate;
      }
    }
    
    return null;
  }, []);

  const isValidDate = useCallback((dateString: string): boolean => {
    const date = parseDate(dateString);
    if (!date) return false;
    
    if (minDate && date < minDate) return false;
    if (maxDate && date > maxDate) return false;
    
    return true;
  }, [parseDate, minDate, maxDate]);

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
      
      // Skip if outside min/max range
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

// iOS-specific calendar utilities
export const iOSCalendarUtils = {
  // Ensure touch targets meet iOS guidelines (44pt minimum)
  getMinimumTouchTarget: () => Platform.OS === 'ios' ? 44 : 40,
  
  // iOS-specific haptic feedback
  triggerHapticFeedback: () => {
    if (Platform.OS === 'ios') {
      // Import haptics only on iOS to avoid errors
      import('expo-haptics').then(({ ImpactFeedbackStyle, impactAsync }) => {
        impactAsync(ImpactFeedbackStyle.Light);
      }).catch(() => {
        // Silently fail if haptics not available
      });
    }
  },
  
  // iOS-specific date formatting
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