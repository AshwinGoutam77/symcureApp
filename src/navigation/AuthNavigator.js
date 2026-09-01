/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import AppointmentsScreen from '../screens/appointment/AppointmentScreen';
import HomeScreen from '../screens/home/HomeScreen';
import { ActivityIndicator, View } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { clearSession, setAuthUser } from '../store/authSlice';
import profileService from '../services/profileService';
import DeleteAccountScreen from '../screens/profile/DeleteAccountScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  const dispatch = useDispatch();
  const { isAuthenticated, onboardingRequired } = useSelector(
    state => state.auth,
  );

  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  // const restoreSession = async () => {
  //   try {
  //     const token = await AsyncStorage.getItem('access_token');

  //     // -----------------------------------------
  //     // NO TOKEN
  //     // -----------------------------------------
  //     if (!token) {
  //       dispatch(clearSession());
  //       return;
  //     }

  //     console.log('RESTORING SAVED SESSION...');

  //     // CHECK PROFILE FROM API
  //     const response =
  //       await profileService.getActiveProfile();

  //     const profile = response?.data ?? response;

  //     console.log(
  //       'RESTORED PROFILE:',
  //       JSON.stringify(profile, null, 2),
  //     );

  //     // PROFILE NOT COMPLETE
  //     if (profile?.profile_complete !== true) {
  //       console.log(
  //         'PROFILE INCOMPLETE → CLEARING SESSION',
  //       );

  //       await AsyncStorage.removeItem('access_token');
  //       await AsyncStorage.removeItem('refresh_token');
  //       await AsyncStorage.removeItem('patient_account_id');
  //       await AsyncStorage.removeItem('active_profile');
  //       await AsyncStorage.removeItem('registration_phone');

  //       dispatch(clearSession());

  //       dispatch(clearSession());

  //       return;
  //     }

  //     // PROFILE COMPLETE
  //     dispatch(
  //       setAuthUser({
  //         ...profile,
  //         access_token: token,
  //       }),
  //     );
  //   } catch (error) {
  //     console.log(
  //       'SESSION RESTORE ERROR:',
  //       error,
  //     );

  //     if (
  //       error?.error?.code ===
  //       'UNAUTHENTICATED'
  //     ) {
  //       await AsyncStorage.multiRemove([
  //         'access_token',
  //         'refresh_token',
  //         'patient_account_id',
  //         'active_profile',
  //         'registration_phone',
  //       ]);

  //       dispatch(clearSession());
  //     }
  //   } finally {
  //     setCheckingSession(false);
  //   }
  // };

  const restoreSession = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');

      if (!token) {
        dispatch(clearSession());
        return;
      }

      console.log('RESTORING SAVED SESSION...');

      const response = await profileService.getActiveProfile();

      console.log(
        'PROFILE API RESPONSE:',
        JSON.stringify(response, null, 2),
      );

      const profile = response?.data?.profile ?? response;

      console.log(
        'PROFILE COMPLETE:',
        profile?.profile_complete,
      );

      // Only logout when backend explicitly says false
      if (profile?.profile_complete === false) {
        console.log('PROFILE INCOMPLETE → LOGOUT');

        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        await AsyncStorage.removeItem('patient_account_id');
        await AsyncStorage.removeItem('active_profile');
        await AsyncStorage.removeItem('registration_phone');

        dispatch(clearSession());

        return;
      }

      // If profile_complete is true
      if (profile?.profile_complete === true) {
        dispatch(
          setAuthUser({
            ...profile,
            access_token: token,
            onboarding: {
              basic_details_required: false,
            },
          }),
        );

        return;
      }

      // If API doesn't return profile_complete,
      // DON'T logout the user.
      console.log(
        'profile_complete was not returned by Profile API',
      );
    } catch (error) {
      console.log(
        'SESSION RESTORE ERROR:',
        error,
      );

      if (error?.error?.code === 'UNAUTHENTICATED') {
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        await AsyncStorage.removeItem('patient_account_id');
        await AsyncStorage.removeItem('active_profile');
        await AsyncStorage.removeItem('registration_phone');

        dispatch(clearSession());
      }
    } finally {
      setCheckingSession(false);
    }
  };

  if (checkingSession) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F4F7FD',
        }}>
        <ActivityIndicator
          size="large"
          color="#2E76FF"
        />
      </View>
    );
  }


  // NOT LOGGED IN
  if (!isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ animation: 'fade' }}
        />

        <Stack.Screen
          name="Otp"
          component={OtpScreen}
          options={{ animation: 'fade' }}
        />

        <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
        <Stack.Screen name="DataPrivacyScreen" component={DataPrivacyScreen} />
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
      <Stack.Screen name="DataPrivacyScreen" component={DataPrivacyScreen} />
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

      <Stack.Screen
        name="DeleteAccountScreen"
        component={DeleteAccountScreen}
      />
    </Stack.Navigator>
  );
}
