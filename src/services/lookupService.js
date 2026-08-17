import apiClient from './apiClient';
import {API_ROUTES} from '../config/routes';

const lookupService = {
  getStates: params =>
    apiClient.get(API_ROUTES.lookups.states, {
      params,
    }),

  getCities: params =>
    apiClient.get(API_ROUTES.lookups.cities, {
      params,
    }),

  getSpecializations: params =>
    apiClient.get(API_ROUTES.lookups.specializations, {
      params,
    }),
};

export default lookupService;