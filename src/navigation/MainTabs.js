/* eslint-disable react/no-unstable-nested-components */

import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Feather from 'react-native-vector-icons/Feather';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import HomeScreen from '../screens/home/HomeScreen';
import AppointmentsScreen from '../screens/appointment/AppointmentScreen';
import RecordsScreen from '../screens/records/RecordsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

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

            default:
              iconName = 'circle';
          }

          return (
            <Feather
              name={iconName}
              size={20}
              color={color}
            />
          );
        },

        tabBarActiveTintColor: '#2E76FF',
        tabBarInactiveTintColor: '#7A879E',

        tabBarStyle: {
          height: 70 + insets.bottom,
          paddingTop: 5,
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E8EDF3',
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
      />

      <Tab.Screen
        name="Appointments"
        component={AppointmentsScreen}
      />

      <Tab.Screen
        name="Records"
        component={RecordsScreen}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
}