import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { FarmFilterProvider } from './src/context/FarmFilterContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <FarmFilterProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </FarmFilterProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
