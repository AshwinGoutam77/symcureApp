import apiClient from './apiClient';

const contentService = {
  getContent: slug => apiClient.get(`/patient/content/${slug}`),

  getAppConfig: () => apiClient.get('/patient/app-config'),
};

export default contentService;
