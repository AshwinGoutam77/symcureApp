import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  accessToken: null,
  refreshToken: null,
  tokenType: 'Bearer',
  expiresInSeconds: null,

  user: null,
  profileStatus: null,

  patientAccountId: null,
  activeProfile: null,
  profiles: [],

  // Onboarding
  onboardingRequired: false,
  onboarding: null,

  // Family member flow
  familyMemberFlow: false,
  familyMemberPhone: null,

  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',

  initialState,

  reducers: {
    // LOGIN / VERIFY OTP
    setSession: (state, action) => {
      const payload = action.payload || {};

      // -----------------------------------------
      // AUTH
      // -----------------------------------------

      state.accessToken =
        payload.access_token ?? null;

      state.refreshToken =
        payload.refresh_token ?? null;

      state.tokenType =
        payload.token_type ?? 'Bearer';

      state.expiresInSeconds =
        payload.expires_in_seconds ?? null;

      state.user =
        payload.user ?? null;

      state.profileStatus =
        payload.profile_status ?? null;

      state.isAuthenticated =
        Boolean(payload.access_token);

      // -----------------------------------------
      // PATIENT PROFILES
      // -----------------------------------------

      state.patientAccountId =
        payload?.active_profile?.patient_account_id ??
        payload?.primary_account?.patient_account_id ??
        null;

      state.activeProfile =
        payload?.active_profile ??
        payload?.primary_account ??
        null;

      state.profiles =
        payload?.profiles ?? [];

      // -----------------------------------------
      // ONBOARDING
      // -----------------------------------------

      state.onboarding =
        payload?.onboarding ?? null;

      state.onboardingRequired =
        payload?.onboarding?.basic_details_required === true;
    },

    // UPDATE USER
    setAuthUser: (state, action) => {
      const payload = action.payload || {};

      state.user =
        payload.user ?? null;

      state.profileStatus =
        payload.profile_status ?? null;

        if (payload.profile) {
    state.activeProfile = payload.profile;

    state.patientAccountId =
      payload.profile.patient_account_id ?? null;
  }

      // -----------------------------------------
      // ACTIVE PROFILE
      // -----------------------------------------

      if (payload.active_profile) {
        state.activeProfile =
          payload.active_profile;

        state.patientAccountId =
          payload.active_profile.patient_account_id;
      }

      // -----------------------------------------
      // PRIMARY ACCOUNT
      // -----------------------------------------

      if (payload.primary_account) {
        state.patientAccountId =
          payload.primary_account.patient_account_id;

        if (!state.activeProfile) {
          state.activeProfile =
            payload.primary_account;
        }
      }

      // -----------------------------------------
      // ALL PROFILES
      // -----------------------------------------

      if (payload.profiles) {
        state.profiles =
          payload.profiles;
      }

      // -----------------------------------------
      // ONBOARDING
      // -----------------------------------------

      if (payload.onboarding) {
        state.onboarding =
          payload.onboarding;

        state.onboardingRequired =
          payload.onboarding
            .basic_details_required === true;
      }

      // -----------------------------------------
      // ACCESS TOKEN
      // -----------------------------------------

      if (payload.access_token) {
        state.accessToken =
          payload.access_token;

        state.isAuthenticated = true;
      }
    },

    // CHANGE ACTIVE PATIENT PROFILE
    setActiveProfile: (state, action) => {
      const profile =
        action.payload;

      state.activeProfile =
        profile;

      state.patientAccountId =
        profile?.patient_account_id ?? null;
    },

    // PROFILE COMPLETED
    setProfileComplete: state => {
      state.onboardingRequired = false;

      if (state.onboarding) {
        state.onboarding.basic_details_required =
          false;
      }

      state.profileStatus = 'complete';
    },

    // Family member
    setFamilyMemberFlow: (state, action) => {
    state.familyMemberFlow = true;
    state.familyMemberPhone = action.payload?.phone ?? null;

    state.onboardingRequired = true;

    if (!state.onboarding) {
      state.onboarding = {};
    }

    state.onboarding.basic_details_required = true;
  },

  clearFamilyMemberFlow: state => {
  state.familyMemberFlow = false;
  state.familyMemberPhone = null;
},

    // =========================================
    // LOGOUT
    // =========================================
    clearSession: () => initialState,
  },
});

export const {
  setSession,
  setAuthUser,
  setActiveProfile,
  setProfileComplete,
  setFamilyMemberFlow,
  clearFamilyMemberFlow,
  clearSession,
} = authSlice.actions;

export default authSlice.reducer;