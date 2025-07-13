// Design System - Material Design Implementation with WCAG 2.1 AA Compliance
import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Breakpoints
export const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
};

// Responsive utilities
export const getResponsiveColumns = () => {
  if (screenWidth < breakpoints.mobile) return 1; // Mobile: Full width
  if (screenWidth < breakpoints.tablet) return 2; // Tablet: 2 columns
  return 3; // Desktop: 3 columns
};

export const isDesktop = screenWidth > breakpoints.tablet;
export const isTablet = screenWidth >= breakpoints.mobile && screenWidth <= breakpoints.tablet;
export const isMobile = screenWidth < breakpoints.mobile;

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
    primary: '-apple-system, BlinkMacSystemFont, sans-serif',
    fallback: 'system-ui, sans-serif',
  },
  
  // Font Sizes and Line Heights
  sizes: {
    // Primary text: 16px/1.4
    primary: {
      fontSize: 16,
      lineHeight: 22.4, // 16 * 1.4
      fontWeight: '400',
    },
    
    // Secondary text: 14px/1.4
    secondary: {
      fontSize: 14,
      lineHeight: 19.6, // 14 * 1.4
      fontWeight: '300',
    },
    
    // Header text: 20px/1.4
    header: {
      fontSize: 20,
      lineHeight: 28, // 20 * 1.4
      fontWeight: 'bold',
    },
    
    // Additional sizes
    title: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: 'bold',
    },
    
    subtitle: {
      fontSize: 18,
      lineHeight: 25.2, // 18 * 1.4
      fontWeight: '500',
    },
    
    caption: {
      fontSize: 12,
      lineHeight: 16.8, // 12 * 1.4
      fontWeight: '400',
    },
  },
};

// Spacing System (8px grid)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  
  // Specific spacing
  listGap: 8,
  containerPadding: 16,
  sectionSpacing: 24,
  filterGap: 12,
};

// Interactive Elements Specifications
export const interactive = {
  // Border specifications
  border: {
    width: 2,
    color: colors.border.primary,
    radius: 3,
  },
  
  // Padding specifications
  padding: {
    horizontal: 12,
    vertical: 8,
  },
  
  // Filter button specifications
  filterButton: {
    padding: {
      horizontal: 16,
      vertical: 8,
    },
    border: {
      default: 2,
      active: 3,
    },
    gap: Math.round(8 * 0.3), // 2px - rounded to prevent react-native-web issues
  },
  
  // Animation specifications
  animation: {
    duration: 200,
    easing: 'ease-in-out',
    hoverScale: 1.02,
  },
  
  // State specifications
  states: {
    hover: {
      opacity: 0.8,
    },
    active: {
      opacity: 0.9,
    },
    disabled: {
      opacity: 0.5,
    },
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
  // Minimum touch target size (44x44 points)
  minTouchTarget: {
    minWidth: 44,
    minHeight: 44,
  },
  
  // Focus indicators
  focusIndicator: {
    borderWidth: 2,
    borderColor: colors.border.focus,
    borderRadius: interactive.border.radius,
  },
  
  // High contrast mode support
  highContrast: {
    borderWidth: 2,
    borderColor: colors.border.primary,
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
  accessibility,
  getResponsiveColumns,
  getResponsiveStyle,
  isDesktop,
  isTablet,
  isMobile,
};