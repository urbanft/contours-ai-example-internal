
import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AppNavigation from './navigation/AppNavigation';
import { StatusBar } from 'react-native';

export default function App() {

  return (
   <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
    <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <AppNavigation />
    </SafeAreaView>
  );
}
