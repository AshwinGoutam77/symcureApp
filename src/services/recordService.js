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

  uploadReport: formData =>
    apiClient.post('/patient/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

export default recordService;