import {useQuery} from '@tanstack/react-query';
import lookupService from '../../services/lookupService';

export const useStatesQuery = search => {
  return useQuery({
    queryKey: ['states', search],
    queryFn: () =>
      lookupService.getStates(
        search ? {q: search} : {},
      ),
  });
};

export const useCitiesQuery = ({
  stateId,
  districtId,
}) => {
  return useQuery({
    queryKey: [
      'cities',
      stateId,
      districtId,
    ],

    queryFn: () =>
      lookupService.getCities({
        state_id: stateId,
        district_id: districtId,
      }),

    enabled:
      !!stateId &&
      !!districtId,
  });
};

export const useDistrictsQuery = stateId => {
  return useQuery({
    queryKey: [
      'districts',
      stateId,
    ],

    queryFn: () =>
      lookupService.getDistricts({
        state_id: stateId,
      }),

    enabled: !!stateId,
  });
};

/*
 * Advanced Doctor Search
 * Qualification / Specialization
 */
export const useQualificationSpecializationsQuery =
  search => {
    const value = search?.trim() || '';

    return useQuery({
      queryKey: [
        'qualification-specializations',
        value,
      ],

      queryFn: () =>
        lookupService.getQualificationSpecializations({
          q: value,
        }),

      enabled: value.length > 0,

      staleTime: 30000,
    });
  };

/*
 * Advanced Doctor Search
 * City
 *
 * API requires minimum 2 characters.
 */
export const useCitiesSearchQuery = search => {
  const value = search?.trim() || '';

  return useQuery({
    queryKey: [
      'cities-search',
      value,
    ],

    queryFn: () =>
      lookupService.searchCities({
        q: value,
      }),

    enabled: value.length >= 2,

    staleTime: 30000,
  });
};