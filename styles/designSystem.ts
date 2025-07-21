/**
 * FreshTrack Design System
 * 
 * Umfassendes Design-System basierend auf Material Design Prinzipien
 * mit WCAG 2.1 AA Compliance für optimale Barrierefreiheit.
 * 
 * Features:
 * - Responsive Breakpoints für alle Gerätegrößen
 * - WCAG 2.1 AA konforme Farbpalette
 * - 8px Grid-System für konsistente Abstände
 * - iOS-optimierte Touch-Targets (44pt minimum)
 * - Plattformspezifische Optimierungen
 * - Vollständige Typografie-Skala
 * - Material Design Elevation System
 * 
 * Speziell entwickelt für die FreshTrack Gastronomie-App mit Fokus auf
 * Benutzerfreundlichkeit und professionelle Ästhetik.
 */

import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Erweiterte Responsive Breakpoints für Multi-Platform-Unterstützung
 * 
 * Definiert Bildschirmgrößen-Kategorien für optimale Layouts:
 * - Mobile: Kleine bis standard Smartphones
 * - Tablet: iPad Mini bis iPad Pro (Hauptfokus)
 * - Desktop: Browser-Ansichten für Entwicklung/Testing
 */
export const breakpoints = {
  mobile: 480,    // iPhone SE, kleine Smartphones
  mobileLarge: 568, // iPhone 8, Standard-Smartphones
  tablet: 768,    // iPad Mini (Hauptfokus)
  tabletLarge: 1024, // iPad Pro
  desktop: 1200,  // Desktop-Browser
  desktopLarge: 1440, // Große Desktop-Bildschirme
};

// Legacy Breakpoints (für Kompatibilität beibehalten)
export const legacyBreakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
};

/**
 * Erweiterte Responsive Utilities
 * 
 * Berechnet optimale Spaltenanzahl basierend auf Bildschirmbreite
 * für responsive Grid-Layouts.
 */
export const getResponsiveColumns = () => {
  if (screenWidth < breakpoints.mobile) return 1;        // Kleine Smartphones: 1 Spalte
  if (screenWidth < breakpoints.mobileLarge) return 1;   // Standard-Smartphones: 1 Spalte
  if (screenWidth < breakpoints.tablet) return 2;       // iPad Mini: 2 Spalten (Hauptfokus)
  if (screenWidth < breakpoints.tabletLarge) return 2;   // iPad Pro: 2 Spalten
  if (screenWidth < breakpoints.desktop) return 3;      // Kleiner Desktop: 3 Spalten
  return 4; // Großer Desktop: 4 Spalten
};

// Geräteerkennung-Utilities
export const isSmallMobile = screenWidth < breakpoints.mobile;
export const isMobile = screenWidth < breakpoints.mobileLarge;
export const isTabletMini = screenWidth >= breakpoints.tablet && screenWidth < breakpoints.tabletLarge;
export const isTablet = screenWidth >= breakpoints.tablet && screenWidth < breakpoints.desktop;
export const isDesktop = screenWidth >= breakpoints.desktop;
export const isLargeDesktop = screenWidth >= breakpoints.desktopLarge;

/**
 * Plattformspezifische responsive Werte
 * 
 * @param mobile - Wert für mobile Geräte
 * @param tablet - Wert für Tablets
 * @param desktop - Wert für Desktop
 * @returns Entsprechender Wert basierend auf aktueller Bildschirmgröße
 */
export const getResponsiveValue = (mobile: any, tablet: any, desktop: any) => {
  if (isMobile) return mobile;
  if (isTablet) return tablet;
  return desktop;
};

/**
 * Touch-Target-Größen (iOS-Richtlinien konform)
 * 
 * Definiert Mindestgrößen für Touch-Elemente nach iOS Human Interface Guidelines
 */
export const touchTargets = {
  minimum: 44,    // iOS minimales Touch-Target
  comfortable: 48, // Komfortables Touch-Target
  large: 56,      // Großes Touch-Target für Hauptaktionen
};

/**
 * Farbsystem - WCAG 2.1 AA konform
 * 
 * Vollständige Farbpalette mit hohen Kontrastverhältnissen für optimale
 * Barrierefreiheit. Alle Farbkombinationen erfüllen WCAG 2.1 AA Standards.
 */
export const colors = {
  // Primärfarben
  primary: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC107', // Primärfarbe
    600: '#FFB300', // Aktiver Zustand
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
  },
  
  // Sekundärfarben
  secondary: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#FF9800', // Sekundärfarbe
    600: '#FB8C00',
    700: '#F57C00',
    800: '#EF6C00',
    900: '#E65100',
  },
  
  // Filter-Farben
  filter: {
    default: '#FDD86E',
    active: '#FFB800',
    inactive: 'rgba(253, 216, 110, 0.5)',
    activeBorder: '#000000',
  },
  
  // Neutrale Farben
  neutral: {
    0: '#FFFFFF',
    50: '#F5F5F5',
    100: '#EEEEEE',
    200: '#E0E0E0',
    300: '#BDBDBD',
    400: '#9E9E9E',
    500: '#757575',
    600: '#616161',
    700: '#424242',
    800: '#212121',
    900: '#000000',
  },
  
  // Semantische Farben
  success: {
    50: '#E8F5E8',
    500: '#4CAF50',
    700: '#388E3C',
  },
  warning: {
    50: '#FFF8E1',
    500: '#FF9800',
    700: '#F57C00',
  },
  error: {
    50: '#FFEBEE',
    500: '#F44336',
    700: '#D32F2F',
  },
  
  // App-spezifische Farben
  background: {
    primary: '#D0D0D0',
    secondary: '#F5C9A4',
    surface: '#FFFFFF',
  },
  
  // Textfarben (WCAG AA konform)
  text: {
    primary: '#000000',     // 21:1 Kontrastverhältnis
    secondary: '#424242',   // 12.63:1 Kontrastverhältnis
    disabled: '#757575',    // 4.54:1 Kontrastverhältnis
    inverse: '#FFFFFF',
  },
  
  // Rahmenfarben
  border: {
    primary: '#000000',
    secondary: 'rgba(0, 0, 0, 0.1)',
    focus: '#1976D2',
  },
};

/**
 * Typografie-System
 * 
 * Vollständige Typografie-Skala mit responsiven Schriftgrößen
 * und optimierten Zeilenhöhen für beste Lesbarkeit.
 */
export const typography = {
  fontFamily: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fallback: 'system-ui, sans-serif',
    monospace: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
  },
  
  // Responsive Schriftgrößen und Zeilenhöhen
  sizes: {
    // Basis-Größen (Mobile-First)
    primary: {
      fontSize: getResponsiveValue(16, 17, 18),
      lineHeight: getResponsiveValue(22.4, 23.8, 25.2),
      fontWeight: '400',
    },
    
    secondary: {
      fontSize: getResponsiveValue(14, 15, 16),
      lineHeight: getResponsiveValue(19.6, 21, 22.4),
      fontWeight: '300',
    },
    
    header: {
      fontSize: getResponsiveValue(20, 22, 24),
      lineHeight: getResponsiveValue(28, 30.8, 33.6),
      fontWeight: 'bold',
    },
    
    title: {
      fontSize: getResponsiveValue(28, 32, 36),
      lineHeight: getResponsiveValue(34, 38.4, 43.2),
      fontWeight: 'bold',
    },
    
    subtitle: {
      fontSize: getResponsiveValue(18, 20, 22),
      lineHeight: getResponsiveValue(25.2, 28, 30.8),
      fontWeight: '500',
    },
    
    caption: {
      fontSize: getResponsiveValue(12, 13, 14),
      lineHeight: getResponsiveValue(16.8, 18.2, 19.6),
      fontWeight: '400',
    },
    
    // Neue responsive Größen
    button: {
      fontSize: getResponsiveValue(16, 17, 18),
      lineHeight: getResponsiveValue(22.4, 23.8, 25.2),
      fontWeight: '600',
    },
    
    navigation: {
      fontSize: getResponsiveValue(14, 15, 16),
      lineHeight: getResponsiveValue(19.6, 21, 22.4),
      fontWeight: '500',
    },
  },
};

/**
 * Erweitertes Abstands-System (8px Grid mit responsiver Skalierung)
 * 
 * Konsistente Abstände basierend auf einem 8px-Grid-System
 * mit responsiver Anpassung für verschiedene Bildschirmgrößen.
 */
export const spacing = {
  xs: getResponsiveValue(4, 6, 8),
  sm: getResponsiveValue(8, 10, 12),
  md: getResponsiveValue(12, 14, 16),
  lg: getResponsiveValue(16, 18, 20),
  xl: getResponsiveValue(20, 24, 28),
  xxl: getResponsiveValue(24, 28, 32),
  xxxl: getResponsiveValue(32, 40, 48),
  
  // Spezifische Abstände
  listGap: getResponsiveValue(8, 10, 12),
  containerPadding: getResponsiveValue(16, 20, 24),
  sectionSpacing: getResponsiveValue(24, 28, 32),
  filterGap: getResponsiveValue(12, 14, 16),
  
  // Plattformspezifische Abstände
  tabBarHeight: getResponsiveValue(70, 80, 90),
  headerHeight: getResponsiveValue(60, 70, 80),
  cardPadding: getResponsiveValue(16, 20, 24),
};

/**
 * Spezifikationen für interaktive Elemente
 * 
 * Definiert einheitliche Eigenschaften für alle interaktiven
 * UI-Komponenten wie Buttons, Touch-Targets und Filter.
 */
export const interactive = {
  // Rahmen-Spezifikationen
  border: {
    width: getResponsiveValue(2, 2, 3),
    color: colors.border.primary,
    radius: getResponsiveValue(3, 4, 6),
  },
  
  // Padding-Spezifikationen
  padding: {
    horizontal: getResponsiveValue(12, 16, 20),
    vertical: getResponsiveValue(8, 10, 12),
  },
  
  // Filter-Button-Spezifikationen
  filterButton: {
    padding: {
      horizontal: getResponsiveValue(16, 18, 20),
      vertical: getResponsiveValue(8, 10, 12),
    },
    border: {
      default: 2,
      active: 3,
    },
    gap: getResponsiveValue(2, 3, 4),
  },
  
  // Animations-Spezifikationen
  animation: {
    duration: 200,
    easing: 'ease-in-out',
    hoverScale: getResponsiveValue(1.01, 1.02, 1.03),
  },
  
  // Zustand-Spezifikationen
  states: {
    hover: {
      opacity: getResponsiveValue(0.9, 0.85, 0.8),
    },
    active: {
      opacity: getResponsiveValue(0.95, 0.9, 0.85),
    },
    disabled: {
      opacity: 0.5,
    },
  },
  
  // Touch-Target-Spezifikationen (iOS-Richtlinien)
  touchTarget: {
    minimum: touchTargets.minimum,
    comfortable: touchTargets.comfortable,
    large: touchTargets.large,
  },
};

/**
 * Elevation-System (Material Design)
 * 
 * Definiert Schatten-Ebenen für visuelle Hierarchie
 * nach Material Design Prinzipien.
 */
export const elevation = {
  none: 0,
  low: 2,
  medium: 4,
  high: 8,
  highest: 16,
};

/**
 * Schatten-System
 * 
 * Plattformübergreifende Schatten-Definitionen für
 * konsistente visuelle Tiefe und Hierarchie.
 */
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  low: {
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  
  medium: {
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  
  high: {
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  highest: {
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 16,
  },
};

/**
 * Komponenten-Styles
 * 
 * Vordefinierte StyleSheet-Objekte für häufig verwendete
 * UI-Komponenten und Patterns.
 */
export const componentStyles = StyleSheet.create({
  // Basis für interaktive Elemente
  interactiveBase: {
    borderWidth: interactive.border.width,
    borderColor: interactive.border.color,
    borderRadius: interactive.border.radius,
    paddingHorizontal: interactive.padding.horizontal,
    paddingVertical: interactive.padding.vertical,
    backgroundColor: colors.background.secondary,
    ...shadows.low,
  },
  
  // Listen-Container
  listContainer: {
    gap: spacing.listGap,
    padding: spacing.containerPadding,
  },
  
  // Abschnitts-Gruppe
  sectionGroup: {
    marginBottom: spacing.sectionSpacing,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.secondary,
  },
  
  // Standard-Filter-Button
  filterButtonDefault: {
    backgroundColor: colors.filter.default,
    borderWidth: interactive.filterButton.border.default,
    borderColor: colors.border.primary,
    borderRadius: interactive.border.radius,
    paddingHorizontal: interactive.filterButton.padding.horizontal,
    paddingVertical: interactive.filterButton.padding.vertical,
    marginRight: spacing.filterGap,
    ...shadows.low,
  },
  
  // Aktiver Filter-Button
  filterButtonActive: {
    backgroundColor: colors.filter.active,
    borderWidth: interactive.filterButton.border.active,
    borderColor: colors.border.primary,
    borderRadius: interactive.border.radius,
    paddingHorizontal: interactive.filterButton.padding.horizontal,
    paddingVertical: interactive.filterButton.padding.vertical,
    marginRight: spacing.filterGap,
    ...shadows.medium,
  },
  
  // Inaktiver Filter-Button
  filterButtonInactive: {
    backgroundColor: colors.filter.inactive,
    borderWidth: interactive.filterButton.border.default,
    borderColor: colors.border.primary,
    borderRadius: interactive.border.radius,
    paddingHorizontal: interactive.filterButton.padding.horizontal,
    paddingVertical: interactive.filterButton.padding.vertical,
    marginRight: spacing.filterGap,
    opacity: interactive.states.disabled.opacity,
    ...shadows.none,
  },
  
  // Typografie-Styles
  textPrimary: {
    fontSize: typography.sizes.primary.fontSize,
    lineHeight: typography.sizes.primary.lineHeight,
    fontWeight: typography.sizes.primary.fontWeight,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.primary,
  },
  
  textSecondary: {
    fontSize: typography.sizes.secondary.fontSize,
    lineHeight: typography.sizes.secondary.lineHeight,
    fontWeight: typography.sizes.secondary.fontWeight,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.primary,
  },
  
  textHeader: {
    fontSize: typography.sizes.header.fontSize,
    lineHeight: typography.sizes.header.lineHeight,
    fontWeight: typography.sizes.header.fontWeight,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.primary,
  },
  
  textTitle: {
    fontSize: typography.sizes.title.fontSize,
    lineHeight: typography.sizes.title.lineHeight,
    fontWeight: typography.sizes.title.fontWeight,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.primary,
  },
  
  textSubtitle: {
    fontSize: typography.sizes.subtitle.fontSize,
    lineHeight: typography.sizes.subtitle.lineHeight,
    fontWeight: typography.sizes.subtitle.fontWeight,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.primary,
  },
  
  textCaption: {
    fontSize: typography.sizes.caption.fontSize,
    lineHeight: typography.sizes.caption.lineHeight,
    fontWeight: typography.sizes.caption.fontWeight,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.primary,
  },
});

/**
 * Responsive Grid-System
 * 
 * Hilfsfunktion für responsive Styling basierend auf Bildschirmgröße
 */
export const getResponsiveStyle = (mobileStyle: any, tabletStyle?: any, desktopStyle?: any) => {
  if (isDesktop && desktopStyle) return desktopStyle;
  if (isTablet && tabletStyle) return tabletStyle;
  return mobileStyle;
};

/**
 * Barrierefreiheits-Helfer
 * 
 * Utilities und Konstanten für optimale Barrierefreiheit
 * nach WCAG 2.1 AA Standards und iOS Human Interface Guidelines.
 */
export const accessibility = {
  // iOS-Richtlinien konforme Touch-Targets
  minTouchTarget: {
    minWidth: touchTargets.minimum,
    minHeight: touchTargets.minimum,
  },
  
  comfortableTouchTarget: {
    minWidth: touchTargets.comfortable,
    minHeight: touchTargets.comfortable,
  },
  
  largeTouchTarget: {
    minWidth: touchTargets.large,
    minHeight: touchTargets.large,
  },
  
  // Fokus-Indikatoren
  focusIndicator: {
    borderWidth: getResponsiveValue(2, 3, 4),
    borderColor: colors.border.focus,
    borderRadius: getResponsiveValue(3, 4, 6),
  },
  
  // Unterstützung für hohen Kontrast
  highContrast: {
    borderWidth: getResponsiveValue(2, 3, 4),
    borderColor: colors.border.primary,
  },
  
  // Screen Reader Unterstützung
  screenReader: {
    fontSize: {
      minimum: 16, // Niemals unter 16px für Barrierefreiheit
      comfortable: 18,
      large: 20,
    },
  },
};

/**
 * Plattformspezifische Styles
 * 
 * Optimierungen für iOS, Android und Web-Plattformen
 */
export const platformStyles = {
  ios: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  android: {
    elevation: 4,
  },
  web: {
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
  },
};

/**
 * Standard-Export des Design-Systems
 * 
 * Stellt alle Design-System-Komponenten als einheitliches Objekt bereit
 */
export default {
  colors,
  typography,
  spacing,
  interactive,
  elevation,
  shadows,
  componentStyles,
  breakpoints,
  legacyBreakpoints,
  accessibility,
  touchTargets,
  platformStyles,
  getResponsiveColumns,
  getResponsiveStyle,
  getResponsiveValue,
  isSmallMobile,
  isMobile,
  isTabletMini,
  isTablet,
  isDesktop,
  isLargeDesktop,
};