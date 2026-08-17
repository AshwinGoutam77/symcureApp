import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';

import './src/i18n';
import AppProviders from './src/providers/AppProviders';

export default function App() {
  return (
    <AppProviders>
      <SafeAreaProvider>
        <StatusBar
          translucent={true}
          backgroundColor="transparent"
          barStyle="light-content"
        />

        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </AppProviders>
  );
}
