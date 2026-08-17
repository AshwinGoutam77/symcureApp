import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  profiles: [],
  primaryProfile: null,
  activeProfile: null,
  activePatientAccountId: null,
  onboarding: null,
};

const profileSlice = createSlice({
  name: 'profile',

  initialState,

  reducers: {
    setProfileContext: (state, action) => {
      const payload = action.payload || {};

      state.profiles = payload.profiles || [];

      state.primaryProfile = payload.primary_account || null;

      state.activeProfile = payload.active_profile || null;

      state.activePatientAccountId =
        payload.active_profile?.patient_account_id ||
        payload.activePatientAccountId ||
        null;

      state.onboarding = payload.onboarding || null;
    },

    setProfiles: (state, action) => {
      state.profiles = action.payload || [];
    },

    setPrimaryProfile: (state, action) => {
      state.primaryProfile = action.payload || null;
    },

    setActiveProfile: (state, action) => {
      const profile = action.payload?.profile || action.payload || null;

      state.activeProfile = profile;

      state.activePatientAccountId = profile?.patient_account_id || null;
    },

    setActivePatientAccountId: (state, action) => {
      const id = action.payload || null;

      state.activePatientAccountId = id;

      const selectedProfile = state.profiles.find(
        profile => String(profile.patient_account_id) === String(id),
      );

      if (selectedProfile) {
        state.activeProfile = selectedProfile;
      }
    },

    setOnboarding: (state, action) => {
      state.onboarding = action.payload || null;
    },

    clearActiveProfile: state => {
      state.profiles = [];
      state.primaryProfile = null;
      state.activeProfile = null;
      state.activePatientAccountId = null;
      state.onboarding = null;
    },
  },
});

export const {
  setProfileContext,
  setProfiles,
  setPrimaryProfile,
  setActiveProfile,
  setActivePatientAccountId,
  setOnboarding,
  clearActiveProfile,
} = profileSlice.actions;

export default profileSlice.reducer;
