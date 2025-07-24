import { Tabs } from 'expo-router';
import { View, Platform, Dimensions } from 'react-native';
import { Package, Menu, Camera, ScrollText, Settings } from 'lucide-react-native';
import { useLanguage } from '@/hooks/useLanguage';
import designSystem from '@/styles/designSystem';

const { width: screenWidth } = Dimensions.get('window');

export default function TabLayout() {
  const { t } = useLanguage();
  
  // Hide labels when screen width is too narrow for comfortable display
  const shouldHideLabels = screenWidth < 400; // Threshold for hiding labels
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: designSystem.colors.background.primary,
          borderTopWidth: 0,
          paddingBottom: shouldHideLabels ? 8 : designSystem.getResponsiveValue(12, 16, 20),
          paddingTop: shouldHideLabels ? 8 : designSystem.getResponsiveValue(12, 16, 20),
          height: shouldHideLabels ? 60 : designSystem.spacing.tabBarHeight,
          ...Platform.select({
            ios: designSystem.platformStyles.ios,
            android: designSystem.platformStyles.android,
            web: designSystem.platformStyles.web,
          }),
        },
        tabBarActiveTintColor: designSystem.colors.secondary[600],
        tabBarInactiveTintColor: designSystem.colors.text.secondary,
        tabBarShowLabel: !shouldHideLabels,
        tabBarLabelStyle: {
          ...designSystem.componentStyles.textCaption,
          fontSize: designSystem.typography.sizes.navigation.fontSize,
          fontWeight: designSystem.typography.sizes.navigation.fontWeight,
          marginTop: shouldHideLabels ? 0 : designSystem.spacing.xs,
          display: shouldHideLabels ? 'none' : 'flex',
        },
        tabBarIconStyle: {
          marginTop: shouldHideLabels ? 8 : 0,
        },
        tabBarItemStyle: {
          borderRadius: 0,
          minHeight: shouldHideLabels ? 44 : designSystem.accessibility.minTouchTarget.minHeight,
        },
        tabBarAccessibilityLabel: t('navigation'),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: shouldHideLabels ? '' : t('dashboard'),
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{
              backgroundColor: 'transparent',
              padding: shouldHideLabels ? 4 : designSystem.spacing.sm,
              width: designSystem.accessibility.minTouchTarget.minWidth,
              height: shouldHideLabels ? 44 : designSystem.accessibility.minTouchTarget.minHeight,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Menu 
                size={shouldHideLabels ? 28 : designSystem.getResponsiveValue(22, 24, 26)} 
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
          title: shouldHideLabels ? '' : t('inventory'),
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{
              backgroundColor: 'transparent',
              padding: shouldHideLabels ? 4 : designSystem.spacing.sm,
              width: designSystem.accessibility.minTouchTarget.minWidth,
              height: shouldHideLabels ? 44 : designSystem.accessibility.minTouchTarget.minHeight,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Package 
                size={shouldHideLabels ? 28 : designSystem.getResponsiveValue(22, 24, 26)} 
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
          title: shouldHideLabels ? '' : t('scanner'),
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{
              backgroundColor: 'transparent',
              padding: shouldHideLabels ? 4 : designSystem.spacing.sm,
              width: designSystem.accessibility.minTouchTarget.minWidth,
              height: shouldHideLabels ? 44 : designSystem.accessibility.minTouchTarget.minHeight,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Camera 
                size={shouldHideLabels ? 28 : designSystem.getResponsiveValue(22, 24, 26)} 
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
          title: shouldHideLabels ? '' : t('movements'),
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{
              backgroundColor: 'transparent',
              padding: shouldHideLabels ? 4 : designSystem.spacing.sm,
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
              padding: shouldHideLabels ? 4 : designSystem.spacing.sm,
              width: designSystem.accessibility.minTouchTarget.minWidth,
              height: shouldHideLabels ? 44 : designSystem.accessibility.minTouchTarget.minHeight,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Settings 
                size={shouldHideLabels ? 28 : designSystem.getResponsiveValue(22, 24, 26)} 
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