import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVE_PROFILE_ID =
  'patient_account_id';

const ACTIVE_PROFILE =
  'active_profile';

const activeProfileService = {
  setProfile: async profile => {
    if (!profile?.patient_account_id) {
      throw new Error(
        'Invalid patient profile.',
      );
    }

    await AsyncStorage.multiSet([
      [
        ACTIVE_PROFILE_ID,
        String(
          profile.patient_account_id,
        ),
      ],
      [
        ACTIVE_PROFILE,
        JSON.stringify(profile),
      ],
    ]);
  },

  getProfileId: async () => {
    return AsyncStorage.getItem(
      ACTIVE_PROFILE_ID,
    );
  },

  getProfile: async () => {
    const value =
      await AsyncStorage.getItem(
        ACTIVE_PROFILE,
      );

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  },

  clear: async () => {
    await AsyncStorage.multiRemove([
      ACTIVE_PROFILE_ID,
      ACTIVE_PROFILE,
    ]);
  },
};

export default activeProfileService;