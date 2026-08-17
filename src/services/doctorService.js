import API_ROUTES from '../config/routes';
import apiClient from './apiClient';

const doctorService = {
  searchDoctors: params => {
    return apiClient.get(API_ROUTES.doctors.search, {
      params,
    });
  },

  getDoctorDetail: doctorId => apiClient.get(`/patient/doctors/${doctorId}`),

  grantDataShare: doctorId =>
    apiClient.post(`/patient/doctors/${doctorId}/data-share`),
};

export default doctorService;
