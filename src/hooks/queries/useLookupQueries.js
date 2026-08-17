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

export const useCitiesQuery = stateId => {
  return useQuery({
    queryKey: ['cities', stateId],
    queryFn: () =>
      lookupService.getCities({
        state_id: stateId,
      }),
    enabled: !!stateId,
  });
};