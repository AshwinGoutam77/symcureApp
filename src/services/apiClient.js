import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/env';

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
      // Get saved login token
      const accessToken = await AsyncStorage.getItem('access_token');

      // Get currently active patient profile
      const patientAccountId = await AsyncStorage.getItem('patient_account_id');

      // -----------------------------------------------
      // Authorization
      // -----------------------------------------------

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      // -----------------------------------------------
      // Patient Account ID
      // -----------------------------------------------

      if (patientAccountId) {
        config.headers['X-Patient-Account-Id'] = patientAccountId;
      }

      // -----------------------------------------------
      // LOG
      // -----------------------------------------------

      // console.log('================ API REQUEST ================');
      // console.log('METHOD:', config.method?.toUpperCase());
      // console.log('URL:', config.baseURL + config.url);
      // console.log('PATIENT ACCOUNT ID:', patientAccountId);
      // console.log('AUTH TOKEN:', accessToken ? 'FOUND' : 'NOT FOUND');
      // console.log('DATA:', config.data);
      // console.log('HEADERS:', config.headers);
      // console.log('==============================================');

      return config;
    } catch (error) {
      console.log('REQUEST INTERCEPTOR ERROR:', error);

      return Promise.reject(error);
    }
  },

  error => {
    console.log('REQUEST INTERCEPTOR ERROR:', error);

    return Promise.reject(error);
  },
);

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

apiClient.interceptors.response.use(
  response => {
    // console.log('================ API RESPONSE ================');
    // console.log('URL:', response.config?.url);
    // console.log('STATUS:', response.status);
    // console.log('DATA:', response.data);
    // console.log('===============================================');
    return response.data;
  },

  error => {
    // console.log('================ API ERROR =================');
    // console.log('URL:', error?.config?.url);
    // console.log('STATUS:', error?.response?.status);
    // console.log('DATA:', error?.response?.data);
    // console.log('MESSAGE:', error?.message);
    // console.log('=============================================');
    return Promise.reject(error?.response?.data || error);
  },
);

export default apiClient;
