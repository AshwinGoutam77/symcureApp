/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */

import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ActivityIndicator, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OtpScreen from '../screens/auth/OtpScreen';

// Profile
import ProfileStep1 from '../screens/profile/ProfileStep1';
import ProfileStep2 from '../screens/profile/ProfileStep2';
import ProfileStep3 from '../screens/profile/ProfileStep3';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import DeleteAccountScreen from '../screens/profile/DeleteAccountScreen';

// Static
import DataPrivacyScreen from '../screens/staticScreens/DataPrivacyScreen';
import HelpSupportScreen from '../screens/staticScreens/HelpSupportScreen';

// Main
import MainTabs from './MainTabs';

// Home
import SelectSlotScreen from '../screens/home/SelectSlotScreen';
import PaymentScreen from '../screens/home/PaymentScreen';
import BookingSuccessScreen from '../screens/home/BookingSuccessScreen';
import DoctorDetailScreen from '../screens/home/DoctorDetailScreen';
import SpecialtiesScreen from '../screens/home/SpecialtiesScreen';
import BrowseByDoctors from '../screens/home/BrowseByDoctors';
import RecentConsultedScreen from '../screens/home/RecentConsultedScreen';
import WebViewScreen from '../screens/home/WebViewScreen';

// Appointments
import RescheduleAppointmentScreen from '../screens/appointment/RescheduleAppointmentScreen';
import AppointmentDetailScreen from '../screens/appointment/AppointmentDetailScreen';
import JoinConsultationScreen from '../screens/appointment/JoinConsultationScreen';
import RatingScreen from '../screens/appointment/RatingScreen';
import VideoConsultationScreen from '../screens/appointment/VideoConsultationScreen';
import AppointmentsScreen from '../screens/appointment/AppointmentScreen';

// Records
import RecordsScreen from '../screens/records/RecordsScreen';
import PrescriptionDetailScreen from '../screens/records/PrescriptionDetailScreen';

// Services / Redux
import {clearSession, setAuthUser} from '../store/authSlice';
import profileService from '../services/profileService';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  const dispatch = useDispatch();

  const {isAuthenticated, onboardingRequired} = useSelector(
    state => state.auth,
  );

  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  /**
   * Clear everything related to the current session.
   */
  const logoutUser = async () => {
    console.log('CLEARING SESSION...');

    try {
      // Do NOT use multiRemove here.
      // Remove each item individually.
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('patient_account_id');
      await AsyncStorage.removeItem('active_profile');
      await AsyncStorage.removeItem('registration_phone');

      console.log('ASYNC STORAGE SESSION CLEARED');
    } catch (storageError) {
      console.log(
        'ASYNC STORAGE CLEAR ERROR:',
        storageError,
      );
    }

    // Always clear Redux session even if AsyncStorage has an issue.
    dispatch(clearSession());

    console.log('REDUX SESSION CLEARED');
  };

  /**
   * Restore saved login session.
   */
  const restoreSession = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');

      console.log('SAVED TOKEN EXISTS:', !!token);

      // No token → user is logged out.
      if (!token) {
        console.log('NO SAVED TOKEN → LOGGED OUT');

        dispatch(clearSession());
        return;
      }

      console.log('RESTORING SAVED SESSION...');

      const response = await profileService.getActiveProfile();

      console.log(
        'PROFILE API RESPONSE:',
        JSON.stringify(response, null, 2),
      );

      /**
       * IMPORTANT
       *
       * Some APIs return:
       *
       * {
       *   success: false,
       *   error: {
       *     code: "INVALID_TOKEN"
       *   }
       * }
       *
       * instead of throwing an HTTP 401.
       *
       * So check the response itself as well.
       */

      const responseErrorCode =
        response?.error?.code ||
        response?.data?.error?.code;

      if (
        response?.success === false &&
        (
          responseErrorCode === 'INVALID_TOKEN' ||
          responseErrorCode === 'UNAUTHENTICATED'
        )
      ) {
        console.log(
          'INVALID TOKEN FROM RESPONSE → LOGOUT',
        );

        await logoutUser();
        return;
      }

      /**
       * Get profile.
       */
      const profile =
        response?.data?.profile ??
        response?.profile ??
        response;

      console.log(
        'PROFILE COMPLETE:',
        profile?.profile_complete,
      );

      /**
       * Backend explicitly says profile is incomplete.
       */
      if (profile?.profile_complete === false) {
        console.log(
          'PROFILE INCOMPLETE → LOGOUT',
        );

        await logoutUser();
        return;
      }

      /**
       * Backend says profile is complete.
       */
      if (profile?.profile_complete === true) {
        console.log(
          'PROFILE COMPLETE → RESTORING USER',
        );

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

      /**
       * If profile_complete isn't returned,
       * don't automatically logout.
       */
      console.log(
        'profile_complete was not returned by Profile API',
      );
    } catch (error) {
      console.log(
        'SESSION RESTORE ERROR:',
        JSON.stringify(error, null, 2),
      );

      /**
       * Depending on your API service,
       * the error can have different structures.
       */
      const errorCode =
        error?.error?.code ||
        error?.data?.error?.code ||
        error?.response?.data?.error?.code;

      const statusCode =
        error?.status ||
        error?.statusCode ||
        error?.response?.status;

      console.log(
        'SESSION ERROR CODE:',
        errorCode,
      );

      console.log(
        'SESSION STATUS CODE:',
        statusCode,
      );

      /**
       * Invalid / expired token.
       */
      if (
        errorCode === 'UNAUTHENTICATED' ||
        errorCode === 'INVALID_TOKEN' ||
        statusCode === 401
      ) {
        console.log(
          'TOKEN INVALID/EXPIRED → LOGOUT',
        );

        await logoutUser();

        return;
      }

      /**
       * Other errors should NOT automatically
       * logout the user.
       */
      console.log(
        'SESSION ERROR IS NOT AUTH ERROR → KEEP SESSION',
      );
    } finally {
      setCheckingSession(false);
    }
  };

  /**
   * While checking saved session.
   */
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

  /**
   * NOT LOGGED IN
   */
  if (!isAuthenticated) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
        />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            animation: 'fade',
          }}
        />

        <Stack.Screen
          name="Otp"
          component={OtpScreen}
          options={{
            animation: 'fade',
          }}
        />

        <Stack.Screen
          name="WebViewScreen"
          component={WebViewScreen}
        />

        <Stack.Screen
          name="DataPrivacyScreen"
          component={DataPrivacyScreen}
        />
      </Stack.Navigator>
    );
  }

  /**
   * LOGGED IN BUT PROFILE INCOMPLETE
   */
  if (onboardingRequired) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen
          name="ProfileStep1"
          component={ProfileStep1}
        />

        <Stack.Screen
          name="ProfileStep2"
          component={ProfileStep2}
        />

        <Stack.Screen
          name="ProfileStep3"
          component={ProfileStep3}
        />

        <Stack.Screen
          name="DataPrivacyScreen"
          component={DataPrivacyScreen}
        />

        <Stack.Screen
          name="HelpSupportScreen"
          component={HelpSupportScreen}
        />
      </Stack.Navigator>
    );
  }

  /**
   * LOGGED IN + PROFILE COMPLETE
   */
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
      />

      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
      />

      <Stack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
      />

      <Stack.Screen
        name="DataPrivacyScreen"
        component={DataPrivacyScreen}
      />

      <Stack.Screen
        name="SpecialtiesScreen"
        component={SpecialtiesScreen}
      />

      <Stack.Screen
        name="BrowseByDoctors"
        component={BrowseByDoctors}
      />

      <Stack.Screen
        name="RecentConsultedScreen"
        component={RecentConsultedScreen}
      />

      <Stack.Screen
        name="DoctorDetailScreen"
        component={DoctorDetailScreen}
      />

      <Stack.Screen
        name="SelectSlotScreen"
        component={SelectSlotScreen}
      />

      <Stack.Screen
        name="RescheduleAppointmentScreen"
        component={RescheduleAppointmentScreen}
      />

      <Stack.Screen
        name="PaymentScreen"
        component={PaymentScreen}
      />

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

      <Stack.Screen
        name="RatingScreen"
        component={RatingScreen}
      />

      <Stack.Screen
        name="RecordsScreen"
        component={RecordsScreen}
      />

      <Stack.Screen
        name="PrescriptionDetail"
        component={PrescriptionDetailScreen}
      />

      <Stack.Screen
        name="VideoConsultationScreen"
        component={VideoConsultationScreen}
      />

      <Stack.Screen
        name="WebViewScreen"
        component={WebViewScreen}
      />

      <Stack.Screen
        name="DeleteAccountScreen"
        component={DeleteAccountScreen}
      />
    </Stack.Navigator>
  );
}