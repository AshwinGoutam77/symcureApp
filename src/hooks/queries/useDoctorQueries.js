// hooks/queries/useDoctorQueries.js

import {useMutation, useQuery} from '@tanstack/react-query';
import doctorService from '../../services/doctorService';
import apiClient from '../../services/apiClient';

export const useDoctorsSearchQuery = params => {
  const hasSearch =
    !!params?.q ||
    !!params?.specialty_group_id ||
    !!params?.qualification_specialization_id ||
    !!params?.city_id ||
    !!params?.specialization_id ||
    !!params?.state_id;

  return useQuery({
    queryKey: [
      'doctors-search',
      params?.q || '',
      params?.specialty_group_id || null,
      params?.qualification_specialization_id || null,
      params?.specialization_id || null,
      params?.city_id || null,
      params?.state_id || null,
      params?.source || 'home',
      params?.page || 1,
      params?.limit || 20,
    ],

    queryFn: () =>
      doctorService.searchDoctors({
        q: params?.q || undefined,

        // Existing Browse by Category/Speciality
        specialty_group_id:
          params?.specialty_group_id || undefined,

        // New smart search
        qualification_specialization_id:
          params?.qualification_specialization_id || undefined,

        // Keep old filters only where still used elsewhere
        specialization_id:
          params?.specialization_id || undefined,

        city_id:
          params?.city_id || undefined,

        state_id:
          params?.state_id || undefined,

        // New API requirement
        source: params?.source || 'home',

        page: params?.page || 1,
        limit: params?.limit || 20,
      }),

    enabled: hasSearch,

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