/* eslint-disable no-catch-shadow */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/self-closing-comp */

import React, { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ImageBackground,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { colors, fonts, spacing } from '../../theme';
import Button from '../../components/common/Button';
import Feather from 'react-native-vector-icons/Feather';
import {
  useVerifyOtpMutation,
  useResendOtpMutation,
} from '../../hooks/queries/useAuthMutations';
import { useDispatch } from 'react-redux';
import {
  setSession,
  setActiveProfile,
  setFamilyMemberFlow,
} from '../../store/authSlice';

export default function OtpScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const {
  phone,
  otpRequestId: initialOtpRequestId,
  resendAvailableInSeconds = 30,
} = route.params || {};
  const OTP_LENGTH = 4;

const [otp, setOtp] = useState(
  Array(OTP_LENGTH).fill(''),
);
  const [otpRequestId, setOtpRequestId] = useState(
  initialOtpRequestId,
);

const [timer, setTimer] = useState(
  resendAvailableInSeconds,
);
  const [error, setError] = useState('');
  const [profileModal, setProfileModal] = useState(false);
  const inputs = useRef([]);
  const {
  mutateAsync: verifyOtp,
  isPending: loading,
} = useVerifyOtpMutation();

const {
  mutateAsync: resendOtp,
  isPending: resending,
} = useResendOtpMutation();
  const [verifyResponse, setVerifyResponse] = useState(null);
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    if (timer <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [timer]);

  const handleChange = (text, index) => {
    if (!/^\d?$/.test(text)) {
      return;
    }

    const newOtp = [...otp];

    newOtp[index] = text;

    setOtp(newOtp);
    if (error) {
      setError('');
    }
    if (text && index < OTP_LENGTH - 1) {
  inputs.current[index + 1]?.focus();
}
  };

  const handleBackspace = (key, index) => {
    if (key !== 'Backspace') {
      return;
    }

    const newOtp = [...otp];

    if (otp[index]) {
      newOtp[index] = '';

      setOtp(newOtp);
    } else if (index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const validateOtp = () => {
    const otpValue = otp.join('');

   if (otpValue.length !== OTP_LENGTH) {
  setError(`Please enter complete ${OTP_LENGTH}-digit OTP`);
  return false;
}

    return true;
  };

  const handleVerify = async () => {
    if (!validateOtp()) {
      return;
    }

    const otpValue = otp.join('');

    try {
      setError('');

if (!otpRequestId) {
  setError(
    'OTP session expired. Please request a new OTP.',
  );
  return;
}

const payload = {
  mobile: phone,
  otp: otpValue,
  otp_request_id: otpRequestId,
};

      const response = await verifyOtp(payload);
      const data = response?.data;

      if (!data) {
        setError('Invalid response from server.');
        return;
      }

      await AsyncStorage.setItem('registration_phone', String(phone));

      const basicDetailsRequired =
        data?.onboarding?.basic_details_required === true;

      console.log('BASIC DETAILS REQUIRED:', basicDetailsRequired);

      // PROFILE INCOMPLETE

      if (basicDetailsRequired) {
        const patientAccountId = data?.primary_account?.patient_account_id;

        console.log('REGISTRATION PATIENT ACCOUNT ID:', patientAccountId);

        if (patientAccountId) {
          await AsyncStorage.setItem(
            'patient_account_id',
            String(patientAccountId),
          );

          await AsyncStorage.setItem(
            'active_profile',
            JSON.stringify(data.primary_account),
          );
        }

        if (data?.access_token) {
          await AsyncStorage.setItem('access_token', data.access_token);
        }

        if (data?.refresh_token) {
          await AsyncStorage.setItem('refresh_token', data.refresh_token);
        }
        await AsyncStorage.setItem('registration_phone', String(phone));

        dispatch(setSession(data));

        return;
      } else {
        if (data?.access_token) {
          await AsyncStorage.setItem('access_token', data.access_token);
        }

        if (data?.refresh_token) {
          await AsyncStorage.setItem('refresh_token', data.refresh_token);
        }
      }

      // PROFILE COMPLETE

      const profilesFromApi = data?.profiles || [];

      console.log(
        'AVAILABLE PROFILES:',
        JSON.stringify(profilesFromApi, null, 2),
      );

      // NO PROFILE

      if (profilesFromApi.length === 0) {
        setError('No patient profile found.');

        return;
      }

      // ONE PROFILE

      if (profilesFromApi.length === 1) {
        const profile = profilesFromApi[0];

        const patientAccountId = profile?.patient_account_id;

        console.log('ONLY ONE PROFILE:', patientAccountId);

        if (!patientAccountId) {
          setError('Patient account ID is missing.');

          return;
        }

        // Save selected profile
        await AsyncStorage.setItem(
          'patient_account_id',
          String(patientAccountId),
        );

        await AsyncStorage.setItem('active_profile', JSON.stringify(profile));

        dispatch(
          setSession({
            ...data,
            active_profile: profile,
          }),
        );

        return;
      }
      // MULTIPLE PROFILES

      console.log('MULTIPLE PROFILES - SHOW PROFILE MODAL');

      setProfiles(profilesFromApi);
      setVerifyResponse(data);
      setProfileModal(true);
    } catch (err) {
      console.log('====================================');

      console.log('VERIFY OTP ERROR:', err);

      console.log('====================================');

      const errorMessage =
        err?.error?.message ||
        err?.error ||
        err?.errors?.[0]?.message ||
        err?.message ||
        'Invalid OTP. Please try again.';

      setError(errorMessage);
    }
  };

const handleResend = async () => {
  if (timer > 0 || loading || resending) {
    return;
  }

  if (!otpRequestId) {
    setError(
      'OTP session expired. Please request a new OTP.',
    );
    return;
  }

  try {
    setError('');

    const response = await resendOtp({
      mobile: phone,
      otp_request_id: otpRequestId,
    });

    console.log(
      'RESEND OTP RESPONSE:',
      JSON.stringify(response, null, 2),
    );

    const newOtpRequestId =
      response?.data?.otp_request_id ||
      response?.otp_request_id;

    if (!newOtpRequestId) {
      setError(
        'Unable to resend OTP. Please try again.',
      );
      return;
    }

    // IMPORTANT:
    // Use the latest request ID for the next verification.
    setOtpRequestId(newOtpRequestId);

    const cooldown =
      response?.data?.resend_available_in_seconds ??
      response?.resend_available_in_seconds ??
      30;

    setTimer(cooldown);

    setOtp(Array(OTP_LENGTH).fill(''));

    inputs.current[0]?.focus();
  } catch (err) {
    console.log(
      'RESEND OTP ERROR:',
      JSON.stringify(err, null, 2),
    );

    const errorCode =
      err?.error?.code ||
      err?.code;

    if (errorCode === 'OTP_RESEND_COOLDOWN') {
      const retryAfter =
        err?.error?.details?.retry_after_seconds ??
        err?.details?.retry_after_seconds ??
        30;

      setTimer(retryAfter);

      setError(
        `Please wait ${retryAfter} seconds before requesting another OTP.`,
      );

      return;
    }

    if (errorCode === 'OTP_INVALID') {
      setError(
        'This OTP session has expired. Please request a new OTP.',
      );

      return;
    }

    if (errorCode === 'OTP_SERVICE_UNAVAILABLE') {
      setError(
        'SMS service is temporarily unavailable. Please try again in a moment.',
      );

      return;
    }

    setError(
      err?.error?.message ||
        err?.message ||
        'Unable to resend OTP. Please try again.',
    );
  }
};

  const handleSelectProfile = async profile => {
    try {
      console.log('====================================');
      console.log('SELECTED PROFILE:', JSON.stringify(profile, null, 2));

      const patientAccountId = profile?.patient_account_id;

      console.log('SELECTED PATIENT ACCOUNT ID:', patientAccountId);

      if (!patientAccountId) {
        setError('Patient account ID is missing.');

        return;
      }

      await AsyncStorage.setItem(
        'patient_account_id',
        String(patientAccountId),
      );

      await AsyncStorage.setItem('active_profile', JSON.stringify(profile));

      dispatch(setSession(verifyResponse));
      dispatch(setActiveProfile(profile));
      setProfileModal(false);

      console.log('ACTIVE PATIENT ACCOUNT ID:', patientAccountId);
      console.log('====================================');
    } catch (error) {
      console.log('SELECT PROFILE ERROR:', error);

      setError('Unable to select profile. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* BACKGROUND */}

      <ImageBackground
        source={require('../../assets/images/login-bg.png')}
        style={styles.top}
        resizeMode="cover"
      />

      {/* KEYBOARD FIX */}

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.bottomContainer}>
          <View style={styles.card}>
            {/* TITLE */}

            <Text style={styles.title}>Verify number</Text>

            {/* PHONE NUMBER */}

            <TouchableOpacity
              style={styles.editPhone}
              onPress={() => navigation.navigate('Login', {
                phone: phone,
              })}
              activeOpacity={0.7}
            >
              <Text style={styles.bold}>Code sent to +91 {phone}</Text>

              <Feather name="edit" size={16} color={colors.primary} />
            </TouchableOpacity>

            {/* OTP */}

            <View style={styles.otpRow}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => {
                    inputs.current[index] = ref;
                  }}
                  style={[styles.otpBox, digit && styles.activeBox]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={text => handleChange(text, index)}
                  onKeyPress={({ nativeEvent }) =>
                    handleBackspace(nativeEvent.key, index)
                  }
                  returnKeyType={
  index === OTP_LENGTH - 1 ? 'done' : 'next'
}
                  textContentType="oneTimeCode"
                  autoComplete="sms-otp"
                />
              ))}
            </View>

            {/* ERROR */}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* RESEND */}

            <Text style={styles.resend}>
              Didn't get it?{' '}
              {timer > 0 ? (
                <Text style={styles.resendLink}>Resend in {timer}s</Text>
              ) : (
                <Text style={styles.resendLink} onPress={handleResend}>
                  Resend OTP
                </Text>
              )}
            </Text>

            {/* VERIFY BUTTON */}

            <Button
              title={loading ? 'Verifying...' : 'Verify & Continue'}
              onPress={handleVerify}
              disabled={
  loading ||
  otp.join('').length !== OTP_LENGTH
}
            />
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* PROFILE MODAL */}

      <Modal
        visible={profileModal}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setProfileModal(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            {/* HEADER */}
            <View>
              <Text style={styles.modalTitle}>Select Patient Profile</Text>

              <Text style={styles.modalSubtitle}>
                Choose the patient profile you want to continue with.
              </Text>
            </View>

            {/* ONLY PROFILES SCROLL */}
            <ScrollView
              style={styles.profileScroll}
              contentContainerStyle={styles.profileScrollContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              {profiles.map(item => (
                <TouchableOpacity
                  key={item.patient_account_id}
                  style={styles.profileCard}
                  activeOpacity={0.8}
                  onPress={() => handleSelectProfile(item)}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {(item.full_name || 'P')
                        .split(' ')
                        .map(x => x[0])
                        .join('')
                        .toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName} numberOfLines={1}>
                      {item.full_name || 'Complete Profile'}
                    </Text>

                    <Text style={styles.profileRelation}>
                      {item.relationship === 'self'
                        ? 'Self'
                        : item.relationship
                          ? item.relationship
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, char => char.toUpperCase())
                          : 'Patient'}
                      {item.age ? ` • ${item.age}` : ''}
                    </Text>
                  </View>

                  <Feather name="chevron-right" size={20} color="#94A3B8" />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* STICKY ADD FAMILY MEMBER */}
            <View style={styles.stickyFooter}>
              <TouchableOpacity
                style={styles.addFamilyButton}
                activeOpacity={0.8}
                onPress={() => {
                  setProfileModal(false);

                  dispatch(setSession(verifyResponse));

                  dispatch(
                    setFamilyMemberFlow({
                      phone,
                    }),
                  );
                }}
              >
                <View style={styles.addFamilyIcon}>
                  <Feather
                    name="user-plus"
                    size={18}
                    color={colors.darkPrimary}
                  />
                </View>

                <View style={styles.addFamilyInfo}>
                  <Text style={styles.addFamilyTitle}>Add Family Member</Text>

                  <Text style={styles.addFamilySubtitle}>
                    Add a spouse, child, parent or dependent
                  </Text>
                </View>

                <Feather name="chevron-right" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  top: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  keyboardContainer: {
    flex: 1,
  },

  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  card: {
    width: '100%',
    backgroundColor: '#fff',

    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,

    padding: 20,

    paddingTop: 48,
    paddingBottom: 40,
  },

  title: {
    fontSize: 24,

    fontFamily: fonts.bold,

    textAlign: 'center',

    color: '#060D1F',
  },

  editPhone: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    marginTop: 8,

    gap: 5,
  },

  bold: {
    fontFamily: fonts.semiBold,

    color: colors.textPrimary,

    fontSize: 13,
  },

  otpRow: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    marginTop: spacing.lg,
    paddingHorizontal: 50,
  },

  otpBox: {
    width: 50,

    height: 50,

    borderRadius: 12,

    borderWidth: 1.5,

    borderColor: colors.border,

    textAlign: 'center',

    fontSize: 18,

    fontFamily: fonts.bold,

    backgroundColor: colors.white,

    color: colors.textPrimary,
  },

  activeBox: {
    borderColor: colors.primary,
  },

  errorText: {
    color: '#DC2626',

    textAlign: 'center',

    marginTop: 10,

    fontSize: 12,

    fontFamily: fonts.medium,
  },

  resend: {
    textAlign: 'center',

    marginTop: spacing.md,

    fontSize: 12,

    color: colors.textSecondary,

    fontFamily: fonts.medium,

    marginBottom: spacing.md,
  },

  resendLink: {
    color: colors.primary,

    fontFamily: fonts.semiBold,
  },

  overlay: {
    flex: 1,

    backgroundColor: 'rgba(0,0,0,0.45)',

    justifyContent: 'flex-end',
  },

  modal: {
    backgroundColor: '#fff',

    borderTopLeftRadius: 28,

    borderTopRightRadius: 28,

    paddingHorizontal: 20,

    paddingTop: 34,

    paddingBottom: 80,
    maxHeight: '82%',
  },

  modalTitle: {
    fontSize: 22,

    fontFamily: fonts.bold,

    color: '#060D1F',
  },

  modalSubtitle: {
    fontSize: 14,

    color: '#7A879E',

    marginBottom: 24,

    lineHeight: 20,
  },

  profileCard: {
    flexDirection: 'row',

    alignItems: 'center',

    paddingVertical: 14,

    paddingHorizontal: 12,

    borderRadius: 16,

    backgroundColor: '#F8FAFC',

    marginBottom: 12,

    borderWidth: 1,

    borderColor: '#EEF2F7',
  },

  avatar: {
    width: 52,

    height: 52,

    borderRadius: 26,

    backgroundColor: colors.primary,

    justifyContent: 'center',

    alignItems: 'center',

    marginRight: 14,
  },

  avatarText: {
    color: '#fff',

    fontSize: 18,

    fontFamily: fonts.bold,
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 16,

    color: '#060D1F',

    fontFamily: fonts.semiBold,
  },

  profileRelation: {
    marginTop: 2,

    fontSize: 13,

    color: '#7A879E',

    fontFamily: fonts.medium,
  },

  addFamilyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.darkPrimary,
    borderRadius: 14,
    backgroundColor: '#F8FAFF',
  },

  addFamilyIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  addFamilyInfo: {
    flex: 1,
  },

  addFamilyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.darkPrimary,
  },

  addFamilySubtitle: {
    marginTop: 3,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
