import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import activeProfileService from '../services/activeProfileService';

const useActiveProfile = () => {
  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const loadProfile = useCallback(
    async () => {
      try {
        const stored =
          await activeProfileService.getProfile();

        setProfile(stored);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const setActiveProfile =
    useCallback(async nextProfile => {
      await activeProfileService.setProfile(
        nextProfile,
      );

      setProfile(nextProfile);
    }, []);

  const clearActiveProfile =
    useCallback(async () => {
      await activeProfileService.clear();

      setProfile(null);
    }, []);

  return {
    profile,
    profileId:
      profile?.patient_account_id ?? null,

    loading,

    setActiveProfile,
    clearActiveProfile,
  };
};

export default useActiveProfile;