// import React from 'react';
// import {StatusBar} from 'react-native';
// import {NavigationContainer} from '@react-navigation/native';
// import {SafeAreaProvider} from 'react-native-safe-area-context';

// import AppNavigator from './src/navigation/AppNavigator';

// import './src/i18n';
// import AppProviders from './src/providers/AppProviders';

// export default function App() {
//   return (
//     <AppProviders>
//       <SafeAreaProvider>
//         <StatusBar
//           translucent={true}
//           backgroundColor="transparent"
//           barStyle="light-content"
//         />

//         <NavigationContainer>
//           <AppNavigator />
//         </NavigationContainer>
//       </SafeAreaProvider>
//     </AppProviders>
//   );
// }

import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer, createNavigationContainerRef} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
// import {useSelector} from 'react-redux';

import AppNavigator from './src/navigation/AppNavigator';
import './src/i18n';
import AppProviders from './src/providers/AppProviders';
// import useNotifications from './src/hooks/useNotifications';

export const navigationRef = createNavigationContainerRef();

// function NotificationBootstrap() {
//   const isAuthenticated = useSelector((s: any) => s.auth.isAuthenticated);
//   const onboardingRequired = useSelector((s: any) => s.auth.onboardingRequired);

//   // Only after login + profile complete
//   if (isAuthenticated && !onboardingRequired) {
//     return <NotificationHook />;
//   }
//   return null;
// }

// function NotificationHook() {
//   useNotifications(navigationRef);
//   return null;
// }

export default function App() {
  return (
    <AppProviders>
      <SafeAreaProvider>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <NavigationContainer ref={navigationRef}>
          <AppNavigator />
          {/* <NotificationBootstrap /> */}
        </NavigationContainer>
      </SafeAreaProvider>
    </AppProviders>
  );
}