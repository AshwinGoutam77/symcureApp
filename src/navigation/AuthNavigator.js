/* eslint-disable no-unused-vars */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OtpScreen from '../screens/auth/OtpScreen';

import ProfileStep1 from '../screens/profile/ProfileStep1';
import ProfileStep2 from '../screens/profile/ProfileStep2';
import ProfileStep3 from '../screens/profile/ProfileStep3';

import DataPrivacyScreen from '../screens/staticScreens/DataPrivacyScreen';
import HelpSupportScreen from '../screens/staticScreens/HelpSupportScreen';

import MainTabs from './MainTabs';

import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';

import SelectSlotScreen from '../screens/home/SelectSlotScreen';
import RescheduleAppointmentScreen from '../screens/appointment/RescheduleAppointmentScreen';
import PaymentScreen from '../screens/home/PaymentScreen';
import BookingSuccessScreen from '../screens/home/BookingSuccessScreen';
import DoctorDetailScreen from '../screens/home/DoctorDetailScreen';
import SpecialtiesScreen from '../screens/home/SpecialtiesScreen';
import BrowseByDoctors from '../screens/home/BrowseByDoctors';
import RecentConsultedScreen from '../screens/home/RecentConsultedScreen';
import WebViewScreen from '../screens/home/WebViewScreen';

import AppointmentDetailScreen from '../screens/appointment/AppointmentDetailScreen';
import JoinConsultationScreen from '../screens/appointment/JoinConsultationScreen';
import RatingScreen from '../screens/appointment/RatingScreen';
import VideoConsultationScreen from '../screens/appointment/VideoConsultationScreen';

import RecordsScreen from '../screens/records/RecordsScreen';
import PrescriptionDetailScreen from '../screens/records/PrescriptionDetailScreen';
import { useSelector } from 'react-redux';
import AppointmentsScreen from '../screens/appointment/AppointmentScreen';
import HomeScreen from '../screens/home/HomeScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  const { isAuthenticated, onboardingRequired } = useSelector(
    state => state.auth,
  );

  // NOT LOGGED IN
if (!isAuthenticated) {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{animation: 'fade'}}
      />

      <Stack.Screen
        name="Otp"
        component={OtpScreen}
        options={{animation: 'fade'}}
      />

      <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
    </Stack.Navigator>
  );
}

  // LOGGED IN BUT PROFILE INCOMPLETE
  if (onboardingRequired) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ProfileStep1" component={ProfileStep1} />
        <Stack.Screen name="ProfileStep2" component={ProfileStep2} />
        <Stack.Screen name="ProfileStep3" component={ProfileStep3} />
        <Stack.Screen name="DataPrivacyScreen" component={DataPrivacyScreen} />
        <Stack.Screen name="HelpSupportScreen" component={HelpSupportScreen} />
      </Stack.Navigator>
    );
  }

  // LOGGED IN + PROFILE COMPLETE
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      <Stack.Screen name="MainTabs" component={MainTabs} />

      <Stack.Screen name="Profile" component={ProfileScreen} />

      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />

      <Stack.Screen name="SpecialtiesScreen" component={SpecialtiesScreen} />

      <Stack.Screen name="BrowseByDoctors" component={BrowseByDoctors} />

      <Stack.Screen
        name="RecentConsultedScreen"
        component={RecentConsultedScreen}
      />

      <Stack.Screen name="DoctorDetailScreen" component={DoctorDetailScreen} />

      <Stack.Screen name="SelectSlotScreen" component={SelectSlotScreen} />

      <Stack.Screen
        name="RescheduleAppointmentScreen"
        component={RescheduleAppointmentScreen}
      />

      <Stack.Screen name="PaymentScreen" component={PaymentScreen} />

      <Stack.Screen
        name="BookingSuccessScreen"
        component={BookingSuccessScreen}
      />

      <Stack.Screen
        name="AppointmentDetailScreen"
        component={AppointmentDetailScreen}
      />

       <Stack.Screen
        name="Appointments"
        component={AppointmentsScreen}
      />

      <Stack.Screen
        name="JoinConsultationScreen"
        component={JoinConsultationScreen}
      />

      <Stack.Screen name="RatingScreen" component={RatingScreen} />

      <Stack.Screen name="RecordsScreen" component={RecordsScreen} />

      <Stack.Screen
        name="PrescriptionDetail"
        component={PrescriptionDetailScreen}
      />

      <Stack.Screen
        name="VideoConsultationScreen"
        component={VideoConsultationScreen}
      />

      <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
    </Stack.Navigator>
  );
}
