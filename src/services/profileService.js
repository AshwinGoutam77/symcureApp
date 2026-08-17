// import apiClient from './apiClient';

// const profileService = {
//   getProfiles: () => apiClient.get('/patient/profiles'),

//   addFamilyMember: payload => apiClient.post('/patient/profiles', payload),
//   // apiClient.post(API_ROUTES.auth.sendOtp, payload),

//   getProfile: () => apiClient.get('/patient/profile'),

//   updateProfile: payload => apiClient.patch('/patient/profile', payload),

//   getNotificationPreferences: () =>
//     apiClient.get('/patient/notification-preferences'),

//   updateNotificationPreferences: payload =>
//     apiClient.patch('/patient/notification-preferences', payload),
// };

// export default profileService;

import apiClient from './apiClient';
import { API_ROUTES } from '../config/routes';

const profileService = {
  // Get all patient profiles
  getProfiles: () => apiClient.get(API_ROUTES.profile.list),

  // Get currently active profile
  getActiveProfile: () => apiClient.get(API_ROUTES.profile.complete),

  // Switch active profile
  switchProfile: patientAccountId =>
    apiClient.post(API_ROUTES.profile.switch, {
      patient_account_id: patientAccountId,
    }),

  // Update current profile
  updateProfile: payload =>
    apiClient.patch(API_ROUTES.profile.complete, payload),

  // Add family member
  addFamilyMember: payload => apiClient.post(API_ROUTES.profile.list, payload),
  
  grantDataShare: doctorId =>
    apiClient.post(
      `/patient/doctors/${doctorId}/data-share`,
    ),
};

export default profileService;
