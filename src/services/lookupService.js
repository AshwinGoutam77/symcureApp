import apiClient from './apiClient';
import {API_ROUTES} from '../config/routes';

const lookupService = {
  getStates: params =>
    apiClient.get(API_ROUTES.lookups.states, {
      params,
    }),

    getDistricts: params =>
  apiClient.get(API_ROUTES.lookups.districts, {
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

      getQualificationSpecializations: params =>
    apiClient.get(
      API_ROUTES.lookups.qualificationSpecializations,
      {
        params,
      },
    ),

  searchCities: params =>
    apiClient.get(
      API_ROUTES.lookups.citiesSearch,
      {
        params,
      },
    ),
};

export default lookupService;