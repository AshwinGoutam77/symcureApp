import {useQuery} from '@tanstack/react-query';
import profileService from '../../services/profileService';

export const useProfilesQuery = () => {
  return useQuery({
    queryKey: ['patient-profiles'],
    queryFn: profileService.getProfiles,
  });
};

export const useActiveProfileQuery = () => {
  return useQuery({
    queryKey: ['active-profile'],
    queryFn: profileService.getActiveProfile,
  });
};