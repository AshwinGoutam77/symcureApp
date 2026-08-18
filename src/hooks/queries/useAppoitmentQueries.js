import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import appointmentService from '../../services/appointmentService';

export const useAvailableSlots = ({
  doctorId,
  date,
  consultType = 'offline',
}) => {
  return useQuery({
    queryKey: ['available-slots', doctorId, date, consultType],

    queryFn: () =>
      appointmentService.getAvailableSlots({
        doctor_id: doctorId,
        date,
        consult_type: consultType,
      }),

    enabled: !!doctorId && !!date && consultType === 'offline',

    staleTime: 0,
    refetchOnMount: 'always',
  });
};

export const useBookAppointment = () => {
  return useMutation({
    mutationFn: payload => appointmentService.bookAppointment(payload),
  });
};

export const useAppointments = params => {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: async () => {
      const response = await appointmentService.getAppointments(params);
      return response?.data;
    },
    staleTime: 30000,
  });
};

export const useAppointmentDetail = appointmentId => {
  return useQuery({
    queryKey: ['appointment-detail', appointmentId],

    queryFn: async () => {
      const response = await appointmentService.getAppointmentDetail(
        appointmentId,
      );

      return response?.data;
    },

    enabled: !!appointmentId,

    // Always fetch when this screen mounts/focuses
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, reason }) =>
      appointmentService.cancelAppointment(
        appointmentId,
        reason ? { reason } : {},
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['appointments'],
      });
    },
  });
};

export const useRescheduleAppointment = () => {
  return useMutation({
    mutationFn: async ({ appointmentId, date, slot_start, slot_end }) => {
      return appointmentService.rescheduleAppointment(appointmentId, {
        date,
        slot_start,
        slot_end,
      });
    },
  });
};

export const useReports = params => {
  return useQuery({
    queryKey: ['patient-reports', params],
    queryFn: () => appointmentService.getReports(params),
    select: response => response?.data,
  });
};

export const useUploadReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: formData => appointmentService.uploadReport(formData),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patient-reports'],
      });
    },
  });
};
