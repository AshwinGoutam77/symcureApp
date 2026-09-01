// hooks/queries/useDoctorQueries.js

import {useMutation, useQuery} from '@tanstack/react-query';
import doctorService from '../../services/doctorService';
import apiClient from '../../services/apiClient';

export const useDoctorsSearchQuery = params => {
  const hasSearch =
    !!params?.q ||
    !!params?.specialization_id ||
    !!params?.city_id ||
    !!params?.state_id;

  return useQuery({
    queryKey: ['doctors-search', params],
    queryFn: () => doctorService.searchDoctors(params),
    enabled: hasSearch,
    // staleTime: 30000,
    staleTime: 0,
  });
};

export const useDoctorDetailQuery = doctorId => {
  return useQuery({
    queryKey: ['doctor-detail', doctorId],
    queryFn: async () => {
      return await apiClient.get(
        `/patient/doctors/${doctorId}`,
      );
    },
    enabled: !!doctorId,
  });
};

export const useDoctorPaymentDetailQuery = doctorId => {
  return useQuery({
    queryKey: ['doctor-payment-detail', doctorId],
    queryFn: async () => {
      const response = await apiClient.get(
        '/patient/booking/context',
        {
          params: {
            doctor_id: doctorId,
            consult_type: 'offline',
          },
        },
      );

      return response?.data;
    },
    enabled: !!doctorId,
  });
};

export const useGrantDataShareMutation = () => {
  return useMutation({
    mutationFn: async doctorId => {
      return await apiClient.post(
        `/patient/doctors/${doctorId}/data-share`,
      );
    },
  });
};