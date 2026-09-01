import apiClient from './apiClient';

const recordService = {
  getPrescriptions: params =>
    apiClient.get('/patient/prescriptions', {
      params,
    }),

  getPrescriptionDetail: prescriptionId =>
    apiClient.get(`/patient/prescriptions/${prescriptionId}`),

  getReports: params =>
    apiClient.get('/patient/reports', {
      params,
    }),

    getPrescriptionPdfFormat: async doctorId => {
  const response = await apiClient.get(
    `/patient/doctors/${doctorId}/prescription-pdf-format`,
  );

  return response.data;
},

  uploadReport: formData =>
    apiClient.post('/patient/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

export default recordService;