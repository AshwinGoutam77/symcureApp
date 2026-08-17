import apiClient from './apiClient';

const appointmentService = {
  getBookingContext: params =>
    apiClient.get('/patient/booking/context', {
      params,
    }),

  getAvailableSlots: params =>
    apiClient.get('/patient/booking/slots', {
      params,
    }),

  bookAppointment: payload => apiClient.post('/patient/appointments', payload),

  getAppointments: params =>
    apiClient.get('/patient/appointments', {
      params,
    }),

  getAppointmentDetail: appointmentId =>
    apiClient.get(`/patient/appointments/${appointmentId}`),

  rescheduleAppointment: (appointmentId, payload) =>
    apiClient.post(
      `/patient/appointments/${appointmentId}/reschedule`,
      payload,
    ),

  cancelAppointment: (appointmentId, payload = {}) =>
    apiClient.post(`/patient/appointments/${appointmentId}/cancel`, payload),

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

export default appointmentService;
