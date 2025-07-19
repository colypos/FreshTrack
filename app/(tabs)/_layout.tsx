import { Tabs } from 'expo-router';
import { View, Platform } from 'react-native';
import { Package, Menu, Camera, ScrollText, Settings } from 'lucide-react-native';
import { useLanguage } from '@/hooks/useLanguage';
import designSystem from '@/styles/designSystem';

export default function TabLayout() {
  const { t } = useLanguage();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: designSystem.colors.background.primary,
          borderTopWidth: 0,
          paddingBottom: designSystem.getResponsiveValue(12, 16, 20),
          paddingTop: designSystem.getResponsiveValue(12, 16, 20),
          height: designSystem.spacing.tabBarHeight,
          ...Platform.select({
            ios: designSystem.platformStyles.ios,
            android: designSystem.platformStyles.android,
            web: designSystem.platformStyles.web,
          }),
        },
        tabBarActiveTintColor: designSystem.colors.secondary[600],
        tabBarInactiveTintColor: designSystem.colors.text.secondary,
        tabBarLabelStyle: {
          ...designSystem.componentStyles.textCaption,
          fontSize: designSystem.typography.sizes.navigation.fontSize,
          fontWeight: designSystem.typography.sizes.navigation.fontWeight,
          marginTop: designSystem.spacing.xs,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        tabBarItemStyle: {
          borderRadius: 0,
          minHeight: designSystem.accessibility.minTouchTarget.minHeight,
        },
        tabBarAccessibilityLabel: t('navigation'),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('dashboard'),
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{
              backgroundColor: 'transparent',
              padding: designSystem.spacing.sm,
              width: designSystem.accessibility.minTouchTarget.minWidth,
              height: designSystem.accessibility.minTouchTarget.minHeight,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Menu 
                size={designSystem.getResponsiveValue(22, 24, 26)} 
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
          title: t('inventory'),
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{
              backgroundColor: 'transparent',
              padding: designSystem.spacing.sm,
              width: designSystem.accessibility.minTouchTarget.minWidth,
              height: designSystem.accessibility.minTouchTarget.minHeight,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Package 
                size={designSystem.getResponsiveValue(22, 24, 26)} 
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
          title: t('scanner'),
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{
              backgroundColor: 'transparent',
              padding: designSystem.spacing.sm,
              width: designSystem.accessibility.minTouchTarget.minWidth,
              height: designSystem.accessibility.minTouchTarget.minHeight,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Camera 
                size={designSystem.getResponsiveValue(22, 24, 26)} 
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
          title: t('movements'),
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{
              backgroundColor: 'transparent',
              padding: designSystem.spacing.sm,
              width: designSystem.accessibility.minTouchTarget.minWidth,
              height: designSystem.accessibility.minTouchTarget.minHeight,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ScrollText 
                size={designSystem.getResponsiveValue(22, 24, 26)} 
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
          title: t('settings'),
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{
              backgroundColor: 'transparent',
              padding: designSystem.spacing.sm,
              width: designSystem.accessibility.minTouchTarget.minWidth,
              height: designSystem.accessibility.minTouchTarget.minHeight,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Settings 
                size={designSystem.getResponsiveValue(22, 24, 26)} 
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