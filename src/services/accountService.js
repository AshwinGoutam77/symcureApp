import apiClient from './apiClient';

const accountService = {
  sendDeletionOtp: async () => {
    return await apiClient.post(
      '/patient/account/deletion/send-otp',
    );
  },

  verifyDeletionOtp: async ({
    otp,
    otp_request_id,
  }) => {
    return await apiClient.post(
      '/patient/account/deletion/verify-otp',
      {
        otp,
        otp_request_id,
      },
    );
  },
};

export default accountService;