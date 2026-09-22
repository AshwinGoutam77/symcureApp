import {useMutation, useQueryClient} from '@tanstack/react-query';
import authService from '../../services/authService';

export const useSetPinMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pin => authService.setPin(pin),

    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: ['active-profile'],
      });

      queryClient.invalidateQueries({
        queryKey: ['patient-profiles'],
      });

      return data;
    },
  });
};

export const usePinLoginMutation = () => {
  return useMutation({
    mutationFn: payload => authService.pinLogin(payload),
  });
};