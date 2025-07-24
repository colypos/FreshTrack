import { Tabs } from 'expo-router';
import { View, Platform, Dimensions } from 'react-native';
import { Package, Menu, Camera, ScrollText, Settings } from 'lucide-react-native';
import { useLanguage } from '@/hooks/useLanguage';
import designSystem from '@/styles/designSystem';

const { width: screenWidth } = Dimensions.get('window');

export default function TabLayout() {
  const { t } = useLanguage();
  
  // Mobile-first approach: Hide labels on mobile devices, show on tablets/desktop
  const isMobile = screenWidth < 768; // Mobile breakpoint
  const shouldHideLabels = isMobile;
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: designSystem.colors.background.primary,
          borderTopWidth: 0,
          paddingBottom: isMobile ? 12 : designSystem.getResponsiveValue(16, 20, 24),
          paddingTop: isMobile ? 12 : designSystem.getResponsiveValue(16, 20, 24),
          height: isMobile ? 64 : designSystem.spacing.tabBarHeight,
          ...Platform.select({
            ios: designSystem.platformStyles.ios,
            android: designSystem.platformStyles.android,
            web: designSystem.platformStyles.web,
          }),
        },
        tabBarActiveTintColor: designSystem.colors.secondary[600],
        tabBarInactiveTintColor: designSystem.colors.text.secondary,
        tabBarShowLabel: !isMobile,
        tabBarLabelStyle: {
          ...designSystem.componentStyles.textCaption,
          fontSize: isMobile ? 0 : designSystem.typography.sizes.navigation.fontSize,
          fontWeight: designSystem.typography.sizes.navigation.fontWeight,
          marginTop: isMobile ? 0 : designSystem.spacing.xs,
          display: isMobile ? 'none' : 'flex',
        },
        tabBarIconStyle: {
          marginTop: isMobile ? 0 : 0,
          marginBottom: isMobile ? 0 : 4,
        },
        tabBarItemStyle: {
          borderRadius: 0,
          minHeight: designSystem.accessibility.minTouchTarget.minHeight,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarAccessibilityLabel: t('navigation'),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: isMobile ? '' : t('dashboard'),
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{
              backgroundColor: 'transparent',
              padding: isMobile ? 8 : designSystem.spacing.sm,
              width: designSystem.accessibility.minTouchTarget.minWidth,
              height: designSystem.accessibility.minTouchTarget.minHeight,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Menu 
                size={isMobile ? 26 : designSystem.getResponsiveValue(22, 24, 26)} 
                color={focused ? designSystem.colors.secondary[600] : designSystem.colors.text.secondary} 
              />
            </View>
          ),
          tabBarAccessibilityLabel: t('dashboard'),
          tabBarAccessibilityHint: t('tapToOpen'),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: isMobile ? '' : t('inventory'),
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{
              backgroundColor: 'transparent',
              padding: isMobile ? 8 : designSystem.spacing.sm,
              width: designSystem.accessibility.minTouchTarget.minWidth,
              height: designSystem.accessibility.minTouchTarget.minHeight,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Package 
                size={isMobile ? 26 : designSystem.getResponsiveValue(22, 24, 26)} 
                color={focused ? designSystem.colors.secondary[600] : designSystem.colors.text.secondary} 
              />
            </View>
          ),
          tabBarAccessibilityLabel: t('inventory'),
          tabBarAccessibilityHint: t('tapToOpen'),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: isMobile ? '' : t('scanner'),
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{
              backgroundColor: 'transparent',
              padding: isMobile ? 8 : designSystem.spacing.sm,
              width: designSystem.accessibility.minTouchTarget.minWidth,
              height: designSystem.accessibility.minTouchTarget.minHeight,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Camera 
                size={isMobile ? 26 : designSystem.getResponsiveValue(22, 24, 26)} 
                color={focused ? designSystem.colors.secondary[600] : designSystem.colors.text.secondary} 
              />
            </View>
          ),
          tabBarAccessibilityLabel: t('scanner'),
          tabBarAccessibilityHint: t('tapToOpen'),
        }}
      />
      <Tabs.Screen
        name="movements"
        options={{
          title: isMobile ? '' : t('movements'),
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{
              backgroundColor: 'transparent',
              padding: isMobile ? 8 : designSystem.spacing.sm,
              width: designSystem.accessibility.minTouchTarget.minWidth,
              height: designSystem.accessibility.minTouchTarget.minHeight,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ScrollText 
                size={shouldHideLabels ? 28 : designSystem.getResponsiveValue(22, 24, 26)} 
                color={focused ? designSystem.colors.secondary[600] : designSystem.colors.text.secondary} 
              />
            </View>
          ),
          tabBarAccessibilityLabel: t('movements'),
          tabBarAccessibilityHint: t('tapToOpen'),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: shouldHideLabels ? '' : t('settings'),
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{
              backgroundColor: 'transparent',
              padding: isMobile ? 8 : designSystem.spacing.sm,
              width: designSystem.accessibility.minTouchTarget.minWidth,
              height: designSystem.accessibility.minTouchTarget.minHeight,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Settings 
                size={isMobile ? 26 : designSystem.getResponsiveValue(22, 24, 26)} 
                color={focused ? designSystem.colors.secondary[600] : designSystem.colors.text.secondary} 
              />
            </View>
          ),
          tabBarAccessibilityLabel: t('settings'),
          tabBarAccessibilityHint: t('tapToOpen'),
        }}
      />
    </Tabs>
  );
}