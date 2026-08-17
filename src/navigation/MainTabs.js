/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Feather from 'react-native-vector-icons/Feather';

import HomeScreen from '../screens/home/HomeScreen';
import AppointmentsScreen from '../screens/appointment/AppointmentScreen';
import RecordsScreen from '../screens/records/RecordsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import TransactionsScreen from '../screens/transactions/TransactionsScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,

        tabBarIcon: ({color}) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Appointments':
              iconName = 'calendar';
              break;
            case 'Records':
              iconName = 'file-text';
              break;
            case 'Transactions':
              iconName = 'repeat';
              break;
            case 'Profile':
              iconName = 'user';
              break;
          }

          return <Feather name={iconName} size={20} color={color} />;
        },

        tabBarActiveTintColor: '#2E76FF',
        tabBarInactiveTintColor: '#7A879E',

        tabBarStyle: {
          position: 'absolute',
          height: 90,
          paddingBottom: 15,
          paddingTop: 5,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="Records" component={RecordsScreen} />
      {/* <Tab.Screen name="Transactions" component={TransactionsScreen} /> */}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
