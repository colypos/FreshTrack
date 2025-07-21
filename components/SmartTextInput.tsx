/**
 * Intelligente TextInput-Komponente mit erweiterten Funktionen
 * 
 * Diese Komponente erweitert die Standard-TextInput um:
 * - Automatische Feld-Registrierung für Keyboard-Tracking
 * - Konsistentes Styling nach Design-System
 * - Fokus-Management für bessere UX
 * - Plattformübergreifende Optimierungen
 */

import React, { useRef, useEffect } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import designSystem from '@/styles/designSystem';

/**
 * Erweiterte Props für SmartTextInput
 */
interface SmartTextInputProps extends TextInputProps {
  /** Optionaler Field-Tracker für Keyboard-Management */
  fieldTracker?: {
    registerField: (id: string, ref: any) => void;
    handleFieldFocus: (id: string) => void;
  };
  /** Eindeutige ID für das Feld */
  fieldId?: string;
}

/**
 * SmartTextInput Komponente
 * 
 * Erweiterte TextInput mit automatischem Keyboard-Management und
 * konsistentem Styling nach dem Design-System.
 * 
 * @param props - Erweiterte TextInput-Props mit Field-Tracking
 * @returns JSX.Element - Gestylte TextInput-Komponente
 */
export default function SmartTextInput({
  fieldTracker,
  fieldId,
  style,
  onFocus,
  onBlur,
  ...textInputProps
}: SmartTextInputProps) {
  const inputRef = useRef<TextInput>(null);
  // Generiere eindeutige ID falls keine bereitgestellt wurde
  const uniqueId = fieldId || `field_${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Registriert das Feld beim Field-Tracker nach dem Mount
   */
  useEffect(() => {
    if (fieldTracker && inputRef.current) {
      fieldTracker.registerField(uniqueId, inputRef.current);
    }
  }, [fieldTracker, uniqueId]);

  /**
   * Behandelt Fokus-Events und benachrichtigt den Field-Tracker
   * @param event - Fokus-Event
   */
  const handleFocus = (event: any) => {
    if (fieldTracker) {
      fieldTracker.handleFieldFocus(uniqueId);
    }
    onFocus?.(event);
  };

  /**
   * Behandelt Blur-Events
   * @param event - Blur-Event
   */
  const handleBlur = (event: any) => {
    onBlur?.(event);
  };

  return (
    <TextInput
      ref={inputRef}
      style={[styles.textInput, style]}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...textInputProps}
    />
  );
}

/**
 * Styling für SmartTextInput nach Design-System
 */
const styles = StyleSheet.create({
  textInput: {
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    borderRadius: designSystem.interactive.border.radius,
    padding: 14,
    ...designSystem.componentStyles.textPrimary,
    backgroundColor: designSystem.colors.background.secondary,
    minHeight: 48,
    lineHeight: 20,
    ...designSystem.shadows.low,
  },
});