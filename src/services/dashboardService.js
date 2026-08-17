import apiClient from './apiClient';
import { API_ROUTES } from '../config/routes';

const dashboardService = {
  getDashboard: () => apiClient.get(API_ROUTES.dashboard.home),
};

export default dashboardService;
