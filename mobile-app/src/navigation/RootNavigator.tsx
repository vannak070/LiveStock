import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { LoadingView } from '../components/ui';
import LoginScreen from '../screens/LoginScreen';
import TabNavigator from './TabNavigator';
import BatchesScreen from '../screens/BatchesScreen';
import FarmsScreen from '../screens/FarmsScreen';
import GrowthScreen from '../screens/GrowthScreen';
import SalesScreen from '../screens/SalesScreen';
import HealthScreen from '../screens/HealthScreen';
import FeedScreen from '../screens/FeedScreen';
import ProposalScreen from '../screens/ProposalScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingView label="Checking your session…" />;

  return (
    <NavigationContainer>
      {!user ? (
        <LoginScreen />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Tabs" component={TabNavigator} />
          {/* Not linked from anywhere in the nav UI anymore (Fattening
              cycles is hidden per product request), but kept registered
              rather than deleted so the route never dangles. */}
          <Stack.Screen name="Batches" component={BatchesScreen} />
          <Stack.Screen name="Farms" component={FarmsScreen} />
          <Stack.Screen name="Growth" component={GrowthScreen} />
          <Stack.Screen name="Sales" component={SalesScreen} />
          <Stack.Screen name="Health" component={HealthScreen} />
          <Stack.Screen name="Feed" component={FeedScreen} />
          <Stack.Screen name="Proposal" component={ProposalScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
