import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {API_BASE_URL} from '../config/env';
import activeProfileService from './activeProfileService';

import store, {persistor} from '../store';
import {clearSession} from '../store/authSlice';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,

  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// =====================================================
// REQUEST INTERCEPTOR
// =====================================================

apiClient.interceptors.request.use(
  async config => {
    try {
      const accessToken =
        await AsyncStorage.getItem('access_token');

      const patientAccountId =
        await activeProfileService.getProfileId();

      // Authorization
      if (accessToken) {
        config.headers.Authorization =
          `Bearer ${accessToken}`;
      }

      // Patient profile
      if (patientAccountId) {
        config.headers['X-Patient-Account-Id'] =
          String(patientAccountId);
      }

      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  error => Promise.reject(error),
);

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

apiClient.interceptors.response.use(
  response => {
    return response.data;
  },

  async error => {
    const responseData =
      error?.response?.data;

    const errorCode =
      responseData?.error?.code;

    // =================================================
    // SESSION EXPIRED / INVALID TOKEN
    // =================================================

    if (errorCode === 'UNAUTHENTICATED') {
      console.log('UNAUTHENTICATED → LOGGING OUT USER');

      try {
        // 1. Clear Redux session
        store.dispatch(clearSession());

        // 2. Make sure Redux Persist saves
        //    isAuthenticated: false
        await persistor.flush();

        // 3. Clear manually stored auth data
        await AsyncStorage.multiRemove([
          'access_token',
          'refresh_token',
          'patient_account_id',
          'active_profile',
          'registration_phone',
        ]);

        console.log(
          'SESSION CLEARED SUCCESSFULLY',
        );
      } catch (logoutError) {
        console.log(
          'AUTO LOGOUT ERROR:',
          logoutError,
        );
      }
    }

    // =================================================
    // RETURN API ERROR
    // =================================================

    return Promise.reject(
      responseData || error,
    );
  },
);

export default apiClient;