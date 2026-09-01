import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import HerdScreen from '../screens/HerdScreen';
import FinanceScreen from '../screens/FinanceScreen';
import AlertsScreen from '../screens/AlertsScreen';
import MoreScreen from '../screens/MoreScreen';
import { colors } from '../theme/colors';
import { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<keyof TabParamList, string> = {
  Dashboard: '▦',
  Herd: '\u{1F42E}',
  Finance: '\u{1F4B0}',
  Alerts: '\u{1F514}',
  More: '≡'
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { borderTopColor: colors.border, backgroundColor: colors.white },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarIcon: () => <Text style={{ fontSize: 18 }}>{ICONS[route.name as keyof TabParamList]}</Text>
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Herd" component={HerdScreen} />
      <Tab.Screen name="Finance" component={FinanceScreen} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}
