import {useMutation, useQueryClient} from '@tanstack/react-query';
import profileService from '../../services/profileService';

export const useSwitchProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patientAccountId =>
      profileService.switchProfile(patientAccountId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patient-profiles'],
      });

      queryClient.invalidateQueries({
        queryKey: ['active-profile'],
      });
    },
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: payload =>
      profileService.updateProfile(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patient-profiles'],
      });

      queryClient.invalidateQueries({
        queryKey: ['active-profile'],
      });
    },
  });
};

export const useAddFamilyMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: payload =>
      profileService.addFamilyMember(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patient-profiles'],
      });
    },
  });
};

export const useSendMobileChangeOtpMutation = () => {
  return useMutation({
    mutationFn: () =>
      profileService.sendMobileChangeOtp(),
  });
};

/**
 * Resend OTP to the patient's CURRENT mobile number
 */
export const useResendMobileChangeOtpMutation = () => {
  return useMutation({
    mutationFn: otpRequestId =>
      profileService.resendMobileChangeOtp(
        otpRequestId,
      ),
  });
};

/**
 * Verify OTP and change the account mobile number
 */
export const useVerifyMobileChangeOtpMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: payload =>
      profileService.verifyMobileChangeOtp(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patient-profiles'],
      });

      queryClient.invalidateQueries({
        queryKey: ['active-profile'],
      });
    },
  });
};

export const useSetPinMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pin =>
      profileService.setPin(pin),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patient-profiles'],
      });

      queryClient.invalidateQueries({
        queryKey: ['active-profile'],
      });
    },
  });
};