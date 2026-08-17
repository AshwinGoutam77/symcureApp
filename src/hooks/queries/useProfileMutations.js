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