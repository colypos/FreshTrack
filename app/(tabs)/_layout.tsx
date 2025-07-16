import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Package, Menu, Camera, ScrollText, Settings, Users } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';

export default function TabLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#D0D0D0',
          borderTopWidth: 0,
          paddingBottom: 12,
          paddingTop: 12,
          height: 70,
        },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#000000',
        tabBarLabelStyle: {
          display: 'none',
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        tabBarItemStyle: {
          borderRadius: 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{
              backgroundColor: 'transparent',
              padding: 8,
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Menu size={24} color={focused ? '#FF9800' : '#000000'} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventar',
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{
              backgroundColor: 'transparent',
              padding: 8,
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Package size={24} color={focused ? '#FF9800' : '#000000'} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="auth"
        options={{
          title: 'Benutzer',
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{
              backgroundColor: 'transparent',
              padding: 8,
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Users size={24} color={focused ? '#FF9800' : '#000000'} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{
              backgroundColor: 'transparent',
              padding: 8,
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Camera size={24} color={focused ? '#FF9800' : '#000000'} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="movements"
        options={{
          title: 'Bewegungen',
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{
              backgroundColor: 'transparent',
              padding: 8,
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ScrollText size={24} color={focused ? '#FF9800' : '#000000'} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Einstellungen',
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{
              backgroundColor: 'transparent',
              padding: 8,
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Settings size={24} color={focused ? '#FF9800' : '#000000'} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}