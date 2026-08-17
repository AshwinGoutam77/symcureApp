import {useMutation} from '@tanstack/react-query';
import authService from '../../services/authService';
import profileService from '../../services/profileService'

export const useSendOtpMutation = () => {
  return useMutation({
    mutationFn: authService.sendOtp,
  });
};

export const useVerifyOtpMutation = () => {
  return useMutation({
    mutationFn: payload => authService.verifyOtp(payload),
  });
};

export const useCompleteProfileMutation = () => {
  return useMutation({
    mutationFn: payload => authService.completeProfile(payload),
  });
};

export const useAddFamilyMemberMutation = () => {
  return useMutation({
    mutationFn: payload =>
      profileService.addFamilyMember(payload),
  });
};

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: authService.logout,
  });
};