import { Tabs } from 'expo-router';
import { Package, ChartBar as BarChart3, Camera, ScrollText, Settings } from 'lucide-react-native';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const styles = StyleSheet.create({
  tabContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 200,
    backgroundColor: '#D0D0D0',
    paddingTop: 60,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingRight: 16,
  },
  tabItemActive: {
    // No additional background styling needed
  },
  tabIndicator: {
    width: 4,
    height: '100%',
    position: 'absolute',
    left: 0,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.tabContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined 
          ? options.tabBarLabel 
          : options.title !== undefined 
          ? options.title 
          : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const getIcon = () => {
          const iconProps = {
            size: 20,
            color: isFocused ? '#F68528' : '#000000'
          };

          switch (route.name) {
            case 'index':
              return <BarChart3 {...iconProps} />;
            case 'inventory':
              return <Package {...iconProps} />;
            case 'scanner':
              return <Camera {...iconProps} />;
            case 'movements':
              return <ScrollText {...iconProps} />;
            case 'settings':
              return <Settings {...iconProps} />;
            default:
              return null;
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={[
              styles.tabItem,
              isFocused && styles.tabItemActive
            ]}
          >
            <View style={[
              styles.tabIndicator,
              { backgroundColor: isFocused ? '#F68528' : '#000000' }
            ]} />
            <View style={styles.tabContent}>
              {getIcon()}
              <Text style={[
                styles.tabLabel,
                { color: isFocused ? '#F68528' : '#000000' }
              ]}>
                {label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventar',
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scanner',
        }}
      />
      <Tabs.Screen
        name="movements"
        options={{
          title: 'Bewegungen',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Einstellungen',
        }}
      />
    </Tabs>
  );
}