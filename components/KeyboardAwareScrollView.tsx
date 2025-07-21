/**
 * Keyboard-bewusste ScrollView-Komponente für optimale mobile UX
 * 
 * Diese Komponente löst das Problem der Tastatur-Überlagerung von Eingabefeldern
 * durch intelligentes Scrollen und Layout-Anpassungen. Speziell optimiert für
 * iOS und Android mit plattformspezifischen Verhaltensweisen.
 * 
 * Features:
 * - Automatisches Scrollen zu fokussierten Feldern
 * - Plattformspezifische Keyboard-Behandlung
 * - Responsive Layout-Anpassungen
 * - Field-Tracking für präzise Scroll-Positionierung
 * - Safe Area Integration
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
  View,
  StyleSheet,
  ScrollViewProps,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Erweiterte Props für KeyboardAwareScrollView
 */
interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  /** React-Kinder-Elemente */
  children: React.ReactNode;
  /** Zusätzliche Scroll-Höhe über dem fokussierten Feld */
  extraScrollHeight?: number;
  /** Aktiviert automatisches Scrollen zu fokussierten Feldern */
  enableAutomaticScroll?: boolean;
  /** Keyboard-Persistenz-Verhalten */
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}

/**
 * KeyboardAwareScrollView Hauptkomponente
 * 
 * Intelligente ScrollView die automatisch auf Keyboard-Events reagiert
 * und fokussierte Eingabefelder in den sichtbaren Bereich scrollt.
 * 
 * @param props - Erweiterte ScrollView-Props mit Keyboard-Funktionalität
 * @returns JSX.Element - Keyboard-bewusste ScrollView
 */
export default function KeyboardAwareScrollView({
  children,
  extraScrollHeight = 20,
  enableAutomaticScroll = true,
  keyboardShouldPersistTaps = 'handled',
  style,
  contentContainerStyle,
  ...scrollViewProps
}: KeyboardAwareScrollViewProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [currentlyFocusedField, setCurrentlyFocusedField] = useState<any>(null);
  
  const insets = useSafeAreaInsets();

  /**
   * Registriert Keyboard- und Dimensions-Event-Listener
   */
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      handleKeyboardShow
    );
    
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      handleKeyboardHide
    );

    const dimensionListener = Dimensions.addEventListener('change', handleDimensionChange);

    return () => {
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
      dimensionListener?.remove();
    };
  }, []);

  /**
   * Behandelt das Anzeigen der Tastatur
   * 
   * @param event - Keyboard-Event mit Tastatur-Dimensionen
   */
  const handleKeyboardShow = (event: any) => {
    const { height } = event.endCoordinates;
    setKeyboardHeight(height);
    
    if (enableAutomaticScroll && currentlyFocusedField) {
      setTimeout(() => {
        scrollToFocusedField();
      }, 150); // Etwas längere Verzögerung für iOS
    }
  };

  /**
   * Behandelt das Verstecken der Tastatur
   */
  const handleKeyboardHide = () => {
    setKeyboardHeight(0);
  };

  /**
   * Behandelt Änderungen der Bildschirmdimensionen
   * @param window - Neue Fenster-Dimensionen
   */
  const handleDimensionChange = ({ window }: any) => {
    setScreenHeight(window.height);
  };

  /**
   * Scrollt automatisch zum aktuell fokussierten Eingabefeld
   * 
   * Berechnet die optimale Scroll-Position basierend auf:
   * - Feld-Position im Fenster
   * - Verfügbare Bildschirmhöhe (minus Tastatur)
   * - Safe Area Insets
   * - Zusätzliche Scroll-Höhe für bessere UX
   */
  const scrollToFocusedField = () => {
    if (!currentlyFocusedField || !scrollViewRef.current) return;

    currentlyFocusedField.measureInWindow((x: number, y: number, width: number, height: number) => {
      const fieldBottom = y + height;
      const availableHeight = screenHeight - keyboardHeight - insets.top - insets.bottom;
      const scrollOffset = fieldBottom - availableHeight + extraScrollHeight;

      if (scrollOffset > 0) {
        scrollViewRef.current?.scrollTo({
          y: scrollOffset,
          animated: true,
        });
      }
    });
  };

  /**
   * Behandelt Layout-Änderungen der ScrollView
   * @param event - Layout-Event mit neuen Dimensionen
   */
  const handleScrollViewLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setScrollViewHeight(height);
  };

  /**
   * Behandelt Änderungen der Content-Größe
   * @param contentWidth - Neue Content-Breite
   * @param contentHeight - Neue Content-Höhe
   */
  const handleContentSizeChange = (contentWidth: number, contentHeight: number) => {
    setContentHeight(contentHeight);
  };

  /**
   * Behandelt Scroll-Events
   * @param event - Scroll-Event
   */
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Optional: Behandle Scroll-Events für zusätzliche Funktionalität
    scrollViewProps.onScroll?.(event);
  };

  // Berechne verfügbare Höhe unter Berücksichtigung der Tastatur
  const availableHeight = Math.max(
    screenHeight - keyboardHeight - insets.top - insets.bottom,
    200 // Minimale Höhe um Layout-Kollaps zu verhindern
  );
  const needsScrolling = contentHeight > availableHeight;

  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Entferne Offset der stören könnte
    >
      <ScrollView
        ref={scrollViewRef}
        style={[
          styles.scrollView, 
          Platform.OS === 'ios' && keyboardHeight === 0 
            ? { flex: 1 } // Verwende flex wenn Tastatur versteckt ist
            : { maxHeight: availableHeight }
        ]}
        contentContainerStyle={[
          styles.contentContainer,
          contentContainerStyle,
          needsScrolling && { paddingBottom: extraScrollHeight },
          Platform.OS === 'ios' && { flexGrow: 1 } // Stelle sicher dass Content auf iOS wachsen kann
        ]}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={needsScrolling}
        scrollEnabled={true}
        bounces={Platform.OS === 'ios'}
        alwaysBounceVertical={false}
        onLayout={handleScrollViewLayout}
        onContentSizeChange={handleContentSizeChange}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        {...scrollViewProps}
      >
        <KeyboardFieldTracker onFieldFocus={setCurrentlyFocusedField}>
          {children}
        </KeyboardFieldTracker>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/**
 * Hilfskomponente zur Verfolgung fokussierter Felder
 * 
 * Erweitert Kinder-Komponenten um Field-Tracking-Funktionalität
 * für präzises Keyboard-Management.
 */
interface KeyboardFieldTrackerProps {
  /** React-Kinder-Elemente */
  children: React.ReactNode;
  /** Callback wenn ein Feld fokussiert wird */
  onFieldFocus: (field: any) => void;
}

/**
 * KeyboardFieldTracker Komponente
 * 
 * Verfolgt fokussierte Eingabefelder und stellt Field-Tracking-API
 * für Kinder-Komponenten bereit.
 * 
 * @param props - Props mit Kindern und Fokus-Callback
 * @returns JSX.Element - Erweiterte Kinder mit Field-Tracking
 */
function KeyboardFieldTracker({ children, onFieldFocus }: KeyboardFieldTrackerProps) {
  const fieldRefs = useRef<Map<string, any>>(new Map());

  /**
   * Registriert ein Eingabefeld für das Tracking
   * @param id - Eindeutige Feld-ID
   * @param ref - Referenz auf das Eingabefeld
   */
  const registerField = (id: string, ref: any) => {
    fieldRefs.current.set(id, ref);
  };

  /**
   * Behandelt Fokus-Events von registrierten Feldern
   * @param id - ID des fokussierten Feldes
   */
  const handleFieldFocus = (id: string) => {
    const field = fieldRefs.current.get(id);
    if (field) {
      onFieldFocus(field);
    }
  };

  // Klone Kinder und füge Fokus-Tracking hinzu
  const enhancedChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as any, {
        key: index,
        fieldTracker: { registerField, handleFieldFocus }
      });
    }
    return child;
  });

  return <>{enhancedChildren}</>;
}

/**
 * Styling für KeyboardAwareScrollView
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    flexShrink: 1,
  },
  contentContainer: {
    flexGrow: 1,
    ...(Platform.OS === 'ios' && {
      minHeight: '100%', // Stelle vollständige Höhennutzung auf iOS sicher
    }),
  },
});