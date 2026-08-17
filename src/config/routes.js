// src/config/routes.js

export const API_ROUTES = {
  auth: {
    sendOtp: '/patient/auth/send-otp',
    verifyOtp: '/patient/auth/verify-otp',
    me: '/patient/auth/me',
    logout: '/patient/auth/logout',
  },

  profile: {
    list: '/patient/profiles',
    active: '/patient/profiles/active',
    switch: '/patient/profiles/switch',
    complete: '/patient/profile',
  },

  lookups: {
    states: '/patient/lookups/states',
    cities: '/patient/lookups/cities',
    specializations: '/patient/lookups/specializations',
  },

  patient: {
    dashboard: '/patient/dashboard',
  },

  dashboard: {
    home: '/patient/dashboard',
  },

  appointments: {
    list: '/patient/appointments',
    detail: id => `/patient/appointments/${id}`,
    create: '/patient/appointments',
    cancel: id => `/patient/appointments/${id}/cancel`,
  },

  doctors: {
    list: '/patient/doctors',
    detail: id => `/patient/doctors/${id}`,
    search: '/patient/doctors/search',
  },

  prescriptions: {
    list: '/patient/prescriptions',
    detail: id => `/patient/prescriptions/${id}`,
  },

  records: {
    list: '/patient/records',
    detail: id => `/patient/records/${id}`,
  },
};

export default API_ROUTES;
