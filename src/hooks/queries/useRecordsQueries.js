import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import recordService from '../../services/recordService';

export const usePrescriptions = params => {
  return useQuery({
    queryKey: ['prescriptions', params],
    queryFn: async () => {
      const response =
        await recordService.getPrescriptions(params);

      return response?.data;
    },
    enabled: true,
  });
};

export const usePrescriptionDetail = prescriptionId => {
  return useQuery({
    queryKey: ['prescription-detail', prescriptionId],
    queryFn: async () => {
      const response =
        await recordService.getPrescriptionDetail(prescriptionId);

      return response?.data;
    },
    enabled: !!prescriptionId,
  });
};

export const useReports = params => {
  return useQuery({
    queryKey: ['reports', params],
    queryFn: async () => {
      const response =
        await recordService.getReports(params);

      return response?.data;
    },
  });
};

export const useUploadReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: formData =>
      recordService.uploadReport(formData),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['reports'],
      });
    },
  });
};