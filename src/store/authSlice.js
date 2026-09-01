import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  accessToken: null,
  refreshToken: null,
  tokenType: 'Bearer',
  expiresInSeconds: null,

  user: null,
  profileStatus: null,

  primaryAccount: null,

  patientAccountId: null,
  activeProfile: null,
  profiles: [],

  onboardingRequired: false,
  onboarding: null,

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

      // =========================================
      // AUTH
      // =========================================

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

      // =========================================
      // PATIENT PROFILES
      // =========================================

      state.profiles =
        payload.profiles ?? [];

      // IMPORTANT:
      // Backend can return active_profile = null
      // when the user needs to choose a profile.
      state.activeProfile =
        payload.active_profile ?? null;

      state.patientAccountId =
        payload.active_profile?.patient_account_id ??
        null;

      // =========================================
      // ONBOARDING
      // =========================================

      state.onboarding =
        payload.onboarding ?? null;

      state.onboardingRequired =
        payload?.onboarding?.basic_details_required === true;

      // =========================================
      // FAMILY MEMBER FLOW
      // =========================================

      state.familyMemberFlow = false;
      state.familyMemberPhone = null;
    },

    // UPDATE USER
    setAuthUser: (state, action) => {
      const payload = action.payload || {};

      // =========================================
      // USER
      // =========================================

      if (payload.user !== undefined) {
        state.user = payload.user;
      }

      if (payload.profile_status !== undefined) {
        state.profileStatus =
          payload.profile_status;
      }

      // =========================================
      // ACTIVE PROFILE
      // =========================================

      const profile =
        payload.active_profile ??
        payload.profile ??
        null;

      if (profile) {
        state.activeProfile = profile;

        state.patientAccountId =
          profile.patient_account_id ?? null;
      }

      // =========================================
      // ALL PROFILES
      // =========================================

      if (payload.profiles) {
        state.profiles =
          payload.profiles;
      }

      // =========================================
      // PRIMARY ACCOUNT
      // =========================================

      if (payload.primary_account) {
        state.primaryAccount =
          payload.primary_account;
      }

      // =========================================
      // ONBOARDING
      // =========================================

      if (payload.onboarding) {
        state.onboarding =
          payload.onboarding;

        state.onboardingRequired =
          payload.onboarding
            .basic_details_required === true;
      }

      // =========================================
      // ACCESS TOKEN
      // =========================================

      if (payload.access_token) {
        state.accessToken =
          payload.access_token;

        state.isAuthenticated = true;
      }

      if (payload.refresh_token) {
        state.refreshToken =
          payload.refresh_token;
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