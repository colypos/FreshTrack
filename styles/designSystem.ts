// Design System - Material Design Implementation with WCAG 2.1 AA Compliance
import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Enhanced Responsive Breakpoints for Multi-Platform Support
export const breakpoints = {
  mobile: 480,    // iPhone SE, small phones
  mobileLarge: 568, // iPhone 8, standard phones
  tablet: 768,    // iPad Mini (primary focus)
  tabletLarge: 1024, // iPad Pro
  desktop: 1200,  // Desktop browsers
  desktopLarge: 1440, // Large desktop screens
};

// Legacy breakpoints (maintained for compatibility)
export const legacyBreakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
};

// Enhanced Responsive Utilities
export const getResponsiveColumns = () => {
  if (screenWidth < breakpoints.mobile) return 1;        // Small phones: 1 column
  if (screenWidth < breakpoints.mobileLarge) return 1;   // Standard phones: 1 column
  if (screenWidth < breakpoints.tablet) return 2;       // iPad Mini: 2 columns (primary focus)
  if (screenWidth < breakpoints.tabletLarge) return 2;   // iPad Pro: 2 columns
  if (screenWidth < breakpoints.desktop) return 3;      // Small desktop: 3 columns
  return 4; // Large desktop: 4 columns
};

// Device Detection Utilities
export const isSmallMobile = screenWidth < breakpoints.mobile;
export const isMobile = screenWidth < breakpoints.mobileLarge;
export const isTabletMini = screenWidth >= breakpoints.tablet && screenWidth < breakpoints.tabletLarge;
export const isTablet = screenWidth >= breakpoints.tablet && screenWidth < breakpoints.desktop;
export const isDesktop = screenWidth >= breakpoints.desktop;
export const isLargeDesktop = screenWidth >= breakpoints.desktopLarge;

// Platform-Specific Responsive Values
export const getResponsiveValue = (mobile: any, tablet: any, desktop: any) => {
  if (isMobile) return mobile;
  if (isTablet) return tablet;
  return desktop;
};

// Touch Target Sizes (iOS Guidelines Compliant)
export const touchTargets = {
  minimum: 44,    // iOS minimum touch target
  comfortable: 48, // Comfortable touch target
  large: 56,      // Large touch target for primary actions
};

// Color System - WCAG 2.1 AA Compliant
export const colors = {
  // Primary Colors
  primary: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC107', // Primary
    600: '#FFB300', // Active state
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
  },
  
  // Secondary Colors
  secondary: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#FF9800', // Secondary
    600: '#FB8C00',
    700: '#F57C00',
    800: '#EF6C00',
    900: '#E65100',
  },
  
  // Filter Colors
  filter: {
    default: '#FDD86E',
    active: '#FFB800',
    inactive: 'rgba(253, 216, 110, 0.5)',
  },
  
  // Neutral Colors
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
  
  // Semantic Colors
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
  
  // App Specific
  background: {
    primary: '#D0D0D0',
    secondary: '#F5C9A4',
    surface: '#FFFFFF',
  },
  
  // Text Colors (WCAG AA Compliant)
  text: {
    primary: '#000000',     // 21:1 contrast ratio
    secondary: '#424242',   // 12.63:1 contrast ratio
    disabled: '#757575',    // 4.54:1 contrast ratio
    inverse: '#FFFFFF',
  },
  
  // Border Colors
  border: {
    primary: '#000000',
    secondary: 'rgba(0, 0, 0, 0.1)',
    focus: '#1976D2',
  },
};

// Typography System
export const typography = {
  fontFamily: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fallback: 'system-ui, sans-serif',
    monospace: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
  },
  
  // Responsive Font Sizes and Line Heights
  sizes: {
    // Base sizes (mobile-first)
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
    
    // New responsive sizes
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

// Enhanced Spacing System (8px grid with responsive scaling)
export const spacing = {
  xs: getResponsiveValue(4, 6, 8),
  sm: getResponsiveValue(8, 10, 12),
  md: getResponsiveValue(12, 14, 16),
  lg: getResponsiveValue(16, 18, 20),
  xl: getResponsiveValue(20, 24, 28),
  xxl: getResponsiveValue(24, 28, 32),
  xxxl: getResponsiveValue(32, 40, 48),
  
  // Specific spacing
  listGap: getResponsiveValue(8, 10, 12),
  containerPadding: getResponsiveValue(16, 20, 24),
  sectionSpacing: getResponsiveValue(24, 28, 32),
  filterGap: getResponsiveValue(12, 14, 16),
  
  // Platform-specific spacing
  tabBarHeight: getResponsiveValue(70, 80, 90),
  headerHeight: getResponsiveValue(60, 70, 80),
  cardPadding: getResponsiveValue(16, 20, 24),
};

// Interactive Elements Specifications
export const interactive = {
  // Border specifications
  border: {
    width: getResponsiveValue(2, 2, 3),
    color: colors.border.primary,
    radius: getResponsiveValue(3, 4, 6),
  },
  
  // Padding specifications
  padding: {
    horizontal: getResponsiveValue(12, 16, 20),
    vertical: getResponsiveValue(8, 10, 12),
  },
  
  // Filter button specifications
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
  
  // Animation specifications
  animation: {
    duration: 200,
    easing: 'ease-in-out',
    hoverScale: getResponsiveValue(1.01, 1.02, 1.03),
  },
  
  // State specifications
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
  
  // Touch target specifications (iOS Guidelines)
  touchTarget: {
    minimum: touchTargets.minimum,
    comfortable: touchTargets.comfortable,
    large: touchTargets.large,
  },
};

// Elevation System (Material Design)
export const elevation = {
  none: 0,
  low: 2,
  medium: 4,
  high: 8,
  highest: 16,
};

// Shadow System
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

// Component Styles
export const componentStyles = StyleSheet.create({
  // Interactive Element Base
  interactiveBase: {
    borderWidth: interactive.border.width,
    borderColor: interactive.border.color,
    borderRadius: interactive.border.radius,
    paddingHorizontal: interactive.padding.horizontal,
    paddingVertical: interactive.padding.vertical,
    backgroundColor: colors.background.secondary,
    ...shadows.low,
  },
  
  // List Container
  listContainer: {
    gap: spacing.listGap,
    padding: spacing.containerPadding,
  },
  
  // Section Group
  sectionGroup: {
    marginBottom: spacing.sectionSpacing,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.secondary,
  },
  
  // Filter Button Default
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
  
  // Filter Button Active
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
  
  // Filter Button Inactive
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
  
  // Typography Styles
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

// Responsive Grid System
export const getResponsiveStyle = (mobileStyle: any, tabletStyle?: any, desktopStyle?: any) => {
  if (isDesktop && desktopStyle) return desktopStyle;
  if (isTablet && tabletStyle) return tabletStyle;
  return mobileStyle;
};

// Accessibility Helpers
export const accessibility = {
  // iOS Guidelines Compliant Touch Targets
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
  
  // Focus indicators
  focusIndicator: {
    borderWidth: getResponsiveValue(2, 3, 4),
    borderColor: colors.border.focus,
    borderRadius: getResponsiveValue(3, 4, 6),
  },
  
  // High contrast mode support
  highContrast: {
    borderWidth: getResponsiveValue(2, 3, 4),
    borderColor: colors.border.primary,
  },
  
  // Screen reader support
  screenReader: {
    fontSize: {
      minimum: 16, // Never go below 16px for accessibility
      comfortable: 18,
      large: 20,
    },
  },
};

// Platform-Specific Styles
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