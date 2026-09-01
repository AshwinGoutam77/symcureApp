import apiClient from './apiClient';
import { API_ROUTES } from '../config/routes';

const authService = {
  sendOtp: payload => apiClient.post(API_ROUTES.auth.sendOtp, payload),
  
  resendOtp: payload =>
    apiClient.post(API_ROUTES.auth.resendOtp, payload),

  verifyOtp: payload => apiClient.post(API_ROUTES.auth.verifyOtp, payload),

  completeProfile: payload => apiClient.patch(API_ROUTES.profile.complete, payload),

  me: () => apiClient.get(API_ROUTES.auth.me),

  logout: () => apiClient.post(API_ROUTES.auth.logout),
};

export default authService;
