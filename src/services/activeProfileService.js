import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVE_PROFILE_KEY = 'active_profile';
const ACTIVE_PROFILE_ID_KEY = 'patient_account_id';

const activeProfileService = {
  async setProfile(profile) {
    if (!profile?.patient_account_id) {
      throw new Error(
        'Invalid patient profile.',
      );
    }

    await AsyncStorage.multiSet([
      [
        ACTIVE_PROFILE_ID_KEY,
        String(profile.patient_account_id),
      ],
      [
        ACTIVE_PROFILE_KEY,
        JSON.stringify(profile),
      ],
    ]);
  },

  async getProfileId() {
    return AsyncStorage.getItem(
      ACTIVE_PROFILE_ID_KEY,
    );
  },

  async getProfile() {
    const value =
      await AsyncStorage.getItem(
        ACTIVE_PROFILE_KEY,
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

  async clear() {
    await AsyncStorage.multiRemove([
      ACTIVE_PROFILE_KEY,
      ACTIVE_PROFILE_ID_KEY,
    ]);
  },
};

export default activeProfileService;