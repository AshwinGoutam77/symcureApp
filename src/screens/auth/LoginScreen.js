/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/self-closing-comp */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ImageBackground,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { colors, fonts, spacing } from '../../theme';
import Button from '../../components/common/Button';
import Feather from 'react-native-vector-icons/Feather';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  useSendOtpMutation,
  usePinLoginMutation,
} from '../../hooks/queries/useAuthMutations';

import pinStorage from '../../utils/pinStorage';

import { useDispatch } from 'react-redux';

import {
  setSession,
  setActiveProfile,
  setFamilyMemberFlow,
} from '../../store/authSlice';

export default function LoginScreen({ route, navigation }) {
  const dispatch = useDispatch();

  const { phone: previousPhone } = route?.params || {};

  const [phone, setPhone] = useState(previousPhone || '');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const [pinAvailable, setPinAvailable] = useState(false);
  const [pinLocked, setPinLocked] = useState(false);
  const [checkingPinStatus, setCheckingPinStatus] = useState(true);

  const [loginMethod, setLoginMethod] = useState('otp');

  // Multiple profile handling
  const [profileModal, setProfileModal] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [loginResponse, setLoginResponse] = useState(null);

  const { mutateAsync: sendOtp, isPending } =
    useSendOtpMutation();

  const {
    mutateAsync: pinLogin,
    isPending: pinLoginPending,
  } = usePinLoginMutation();

  // =========================================================
  // LOAD PIN STATUS
  // =========================================================

  useEffect(() => {
    const loadPinStatus = async () => {
      try {
        const [pinSet, savedMobile] = await Promise.all([
          pinStorage.getPinSet(),
          pinStorage.getLoginMobile(),
        ]);

        console.log('==============================');
        console.log('LOGIN PIN STATUS');
        console.log('pinSet:', pinSet);
        console.log('savedMobile:', savedMobile);
        console.log('==============================');

        setPinAvailable(pinSet);

        if (!phone && savedMobile) {
          setPhone(savedMobile);
        }

        /*
         * PIN should be the default login method
         * whenever the account has a PIN.
         */
        if (pinSet) {
          setLoginMethod('pin');
        } else {
          setLoginMethod('otp');
        }
      } catch (err) {
        console.log(
          'LOAD PIN STATUS ERROR:',
          err,
        );

        setLoginMethod('otp');
      } finally {
        setCheckingPinStatus(false);
      }
    };

    loadPinStatus();
  }, []);

  // =========================================================
  // PHONE VALIDATION
  // =========================================================

  const validatePhone = () => {
    const value = phone.trim();

    if (!value) {
      setError('Phone number is required');
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(value)) {
      setError(
        'Enter a valid 10-digit mobile number',
      );
      return false;
    }

    setError('');

    return true;
  };

  // =========================================================
  // SEND OTP
  // =========================================================

  const handleSendOtp = async () => {
    if (!validatePhone()) {
      return;
    }

    try {
      setError('');

      const response = await sendOtp({
        mobile: phone.trim(),
      });

      console.log(
        'SEND OTP RESPONSE:',
        JSON.stringify(response, null, 2),
      );

      const otpRequestId =
        response?.data?.otp_request_id ||
        response?.otp_request_id;

      if (!otpRequestId) {
        setError(
          'Unable to start OTP verification. Please try again.',
        );

        return;
      }

      const resendAvailableInSeconds =
        response?.data?.resend_available_in_seconds ??
        response?.resend_available_in_seconds ??
        30;

      navigation.navigate('Otp', {
        phone: phone.trim(),
        otpRequestId,
        resendAvailableInSeconds,
      });
    } catch (err) {
      console.log(
        'SEND OTP ERROR:',
        JSON.stringify(err, null, 2),
      );

      const errorCode =
        err?.error?.code ||
        err?.code ||
        err?.response?.data?.error?.code;

      if (
        errorCode ===
        'OTP_SERVICE_UNAVAILABLE'
      ) {
        setError(
          'SMS service is temporarily unavailable. Please try again in a moment.',
        );

        return;
      }

      if (errorCode === 'OTP_RATE_LIMIT') {
        setError(
          err?.error?.message ||
          'Too many OTP requests. Please try again later.',
        );

        return;
      }

      if (errorCode === 'INVALID_MOBILE') {
        setError(
          'Please enter a valid mobile number.',
        );

        return;
      }

      setError(
        err?.error?.message ||
        err?.response?.data?.error?.message ||
        err?.message ||
        'Unable to send OTP. Please try again.',
      );
    }
  };

  // =========================================================
  // PIN LOGIN
  // =========================================================

  const handlePinLogin = async () => {
    const mobile = phone.trim();

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError(
        'Enter a valid 10-digit mobile number',
      );

      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setError('Enter your 4-digit PIN');

      return;
    }

    try {
      setError('');
      setPinLocked(false);

      const response = await pinLogin({
        mobile,
        pin,
        // device_id: deviceId,
      });

      console.log(
        '====================================',
      );

      console.log(
        'PIN LOGIN RESPONSE:',
        JSON.stringify(response, null, 2),
      );

      console.log(
        '====================================',
      );

      /*
       * pin-login has the same success response
       * structure as verify-otp.
       */
      const data =
        response?.data?.data ||
        response?.data;

      if (!data?.access_token) {
        setError(
          'Unable to login. Please try again.',
        );

        return;
      }

      // =====================================================
      // SAVE PIN STATUS
      // =====================================================

      await pinStorage.setPinSet(
        data?.user?.pin_set ?? true,
      );

      // =====================================================
      // SAVE LOGIN MOBILE
      // =====================================================

      await pinStorage.setLoginMobile(mobile);

      await AsyncStorage.setItem(
        'registration_phone',
        String(mobile),
      );

      // =====================================================
      // SAVE ACCESS TOKEN
      // =====================================================

      if (data?.access_token) {
        await AsyncStorage.setItem(
          'access_token',
          data.access_token,
        );
      }

      // =====================================================
      // SAVE REFRESH TOKEN
      // =====================================================

      if (data?.refresh_token) {
        await AsyncStorage.setItem(
          'refresh_token',
          data.refresh_token,
        );
      }

      // =====================================================
      // CHECK ONBOARDING
      // =====================================================

      const basicDetailsRequired =
        data?.onboarding?.basic_details_required ===
        true;

      console.log(
        'PIN LOGIN BASIC DETAILS REQUIRED:',
        basicDetailsRequired,
      );

      // =====================================================
      // PROFILE INCOMPLETE
      // =====================================================

      if (basicDetailsRequired) {
        const patientAccountId =
          data?.primary_account
            ?.patient_account_id;

        console.log(
          'PIN LOGIN PRIMARY ACCOUNT ID:',
          patientAccountId,
        );

        if (patientAccountId) {
          await AsyncStorage.setItem(
            'patient_account_id',
            String(patientAccountId),
          );

          await AsyncStorage.setItem(
            'active_profile',
            JSON.stringify(
              data.primary_account,
            ),
          );
        }

        /*
         * AuthNavigator should now handle
         * the onboarding/profile flow.
         */
        dispatch(setSession(data));

        return;
      }

      // =====================================================
      // PROFILE COMPLETE
      // =====================================================

      const profilesFromApi =
        data?.profiles || [];

      console.log(
        'PIN LOGIN AVAILABLE PROFILES:',
        JSON.stringify(
          profilesFromApi,
          null,
          2,
        ),
      );

      // =====================================================
      // NO PROFILE
      // =====================================================

      if (profilesFromApi.length === 0) {
        setError(
          'No patient profile found.',
        );

        return;
      }

      // =====================================================
      // ONE PROFILE
      // =====================================================

      if (profilesFromApi.length === 1) {
        const profile =
          profilesFromApi[0];

        const patientAccountId =
          profile?.patient_account_id;

        console.log(
          'PIN LOGIN ONLY PROFILE:',
          patientAccountId,
        );

        if (!patientAccountId) {
          setError(
            'Patient account ID is missing.',
          );

          return;
        }

        // Save selected patient account
        await AsyncStorage.setItem(
          'patient_account_id',
          String(patientAccountId),
        );

        // Save active profile
        await AsyncStorage.setItem(
          'active_profile',
          JSON.stringify(profile),
        );

        // Save Redux session
        dispatch(
          setSession({
            ...data,
            active_profile: profile,
          }),
        );

        // Also explicitly set active profile
        dispatch(
          setActiveProfile(profile),
        );

        console.log(
          'PIN LOGIN SUCCESS:',
          patientAccountId,
        );

        return;
      }

      // =====================================================
      // MULTIPLE PROFILES
      // =====================================================

      console.log(
        'PIN LOGIN MULTIPLE PROFILES',
      );

      setProfiles(profilesFromApi);
      setLoginResponse(data);
      setProfileModal(true);
    } catch (err) {
      console.log(
        '====================================',
      );

      console.log(
        'PIN LOGIN ERROR:',
        JSON.stringify(err, null, 2),
      );

      console.log(
        '====================================',
      );

      const errorCode =
        err?.error?.code ||
        err?.code ||
        err?.response?.data?.error?.code;

      const details =
        err?.error?.details ||
        err?.response?.data?.error?.details ||
        {};

      // =====================================================
      // INVALID PIN
      // =====================================================

      if (errorCode === 'PIN_INVALID') {
        const remaining =
          details?.remaining_attempts;

        setError(
          remaining !== undefined
            ? `Incorrect PIN. ${remaining} attempts remaining.`
            : 'Incorrect PIN.',
        );

        return;
      }

      // =====================================================
      // PIN LOCKED
      // =====================================================

      if (errorCode === 'PIN_LOCKED') {
        setPinLocked(true);

        setError(
          'PIN login is locked for today. Please login with OTP.',
        );

        return;
      }

      // =====================================================
      // PIN NOT SET
      // =====================================================

      if (errorCode === 'PIN_NOT_SET') {
        await pinStorage.setPinSet(false);

        setPinAvailable(false);
        setLoginMethod('otp');
        setPin('');

        setError(
          'PIN is not set up. Please login with OTP.',
        );

        return;
      }

      // =====================================================
      // ACCOUNT NOT FOUND
      // =====================================================

      if (
        errorCode ===
        'PIN_LOGIN_NO_ACCOUNT'
      ) {
        setLoginMethod('otp');
        setPin('');

        setError(
          'No account found. Please login with OTP.',
        );

        return;
      }

      // =====================================================
      // ACCOUNT SUSPENDED
      // =====================================================

      if (
        errorCode ===
        'ACCOUNT_SUSPENDED'
      ) {
        setError(
          'Your account is suspended. Please contact support.',
        );

        return;
      }

      // =====================================================
      // GENERIC ERROR
      // =====================================================

      setError(
        err?.error?.message ||
        err?.response?.data?.error?.message ||
        err?.message ||
        'Unable to login with PIN. Please try again.',
      );
    }
  };

  // =========================================================
  // SELECT PROFILE AFTER PIN LOGIN
  // =========================================================

  const handleSelectProfile = async profile => {
    try {
      const patientAccountId =
        profile?.patient_account_id;

      if (!patientAccountId) {
        setError(
          'Patient account ID is missing.',
        );

        return;
      }

      await AsyncStorage.setItem(
        'patient_account_id',
        String(patientAccountId),
      );

      await AsyncStorage.setItem(
        'active_profile',
        JSON.stringify(profile),
      );

      dispatch(
        setSession({
          ...loginResponse,
          active_profile: profile,
        }),
      );

      dispatch(
        setActiveProfile(profile),
      );

      setProfileModal(false);

      console.log(
        'PIN LOGIN ACTIVE PATIENT ACCOUNT:',
        patientAccountId,
      );
    } catch (err) {
      console.log(
        'PIN SELECT PROFILE ERROR:',
        err,
      );

      setError(
        'Unable to select profile. Please try again.',
      );
    }
  };

  // =========================================================
  // ADD FAMILY MEMBER AFTER PIN LOGIN
  // =========================================================

  const handleAddFamilyMember = () => {
    setProfileModal(false);

    dispatch(
      setSession(loginResponse),
    );

    dispatch(
      setFamilyMemberFlow({
        phone: phone.trim(),
      }),
    );
  };

  // =========================================================
  // SWITCH TO PIN
  // =========================================================

  const switchToPin = () => {
    setLoginMethod('pin');
    setError('');
    setPinLocked(false);
  };

  // =========================================================
  // SWITCH TO OTP
  // =========================================================

  const switchToOtp = () => {
    setLoginMethod('otp');
    setError('');
    setPin('');
    setPinLocked(false);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : 'height'
      }>

      <ImageBackground
        source={require('../../assets/images/login-bg.png')}
        style={styles.top}
        resizeMode="cover"
      />

      <View style={styles.bottomContainer}>
        <View style={styles.card}>

          <Text style={styles.title}>
            Welcome to{' '}
            <Text style={styles.highlightText}>
              Symcure
            </Text>
          </Text>

          <Text style={styles.subtitle}>
            {loginMethod === 'otp'
              ? 'Enter your phone number to get started'
              : 'Login securely using your PIN'}
          </Text>

          {/* =================================================
              OTP LOGIN
          ================================================= */}

          {loginMethod === 'otp' ? (
            <>
              <View style={styles.inputBox}>
                <Text style={styles.prefix}>
                  +91
                </Text>

                <TextInput
                  placeholder="10-digit number"
                  placeholderTextColor="#A0AEC0"
                  style={styles.input}
                  keyboardType="number-pad"
                  value={phone}
                  maxLength={10}
                  editable={!isPending}
                  onChangeText={text => {
                    setPhone(
                      text.replace(
                        /[^0-9]/g,
                        '',
                      ),
                    );

                    if (error) {
                      setError('');
                    }
                  }}
                />

                {phone.length === 10 &&
                  !isPending && (
                    <Feather
                      name="check"
                      size={18}
                      color="#16A34A"
                    />
                  )}
              </View>

              {error ? (
                <Text style={styles.error}>
                  {error}
                </Text>
              ) : null}

              <Button
                title={
                  isPending
                    ? 'Sending OTP...'
                    : 'Continue with OTP'
                }
                onPress={handleSendOtp}
                disabled={
                  phone.length !== 10 ||
                  isPending
                }
                containerStyle={{
                  marginTop: 16,
                }}
              />

              {pinAvailable && (
                <>
                  <View style={styles.orContainer}>
                    <View style={styles.orLine} />

                    <Text style={styles.orText}>
                      OR
                    </Text>

                    <View style={styles.orLine} />
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.pinButton}
                    onPress={switchToPin}>

                    <View style={styles.pinIcon}>
                      <Feather
                        name="lock"
                        size={17}
                        color={
                          colors.darkPrimary
                        }
                      />
                    </View>

                    <Text style={styles.pinButtonText}>
                      Login with PIN
                    </Text>

                    <Feather
                      name="chevron-right"
                      size={18}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </>
              )}
            </>
          ) : (
            /* =================================================
               PIN LOGIN
            ================================================= */

            <>
              <View style={styles.inputBox}>
                <Text style={styles.prefix}>
                  +91
                </Text>

                <TextInput
                  placeholder="10-digit number"
                  placeholderTextColor="#A0AEC0"
                  style={styles.input}
                  keyboardType="number-pad"
                  value={phone}
                  maxLength={10}
                  onChangeText={text => {
                    setPhone(
                      text.replace(
                        /[^0-9]/g,
                        '',
                      ),
                    );

                    if (error) {
                      setError('');
                    }
                  }}
                />
              </View>

              <Text style={styles.fieldLabel}>
                LOGIN PIN
              </Text>

              <View style={styles.inputBox}>
                <Feather
                  name="lock"
                  size={17}
                  color="#64748B"
                  style={styles.inputIcon}
                />

                <TextInput
                  placeholder="Enter 4-digit PIN"
                  placeholderTextColor="#A0AEC0"
                  style={[
                    styles.input,
                    styles.pinInput,
                  ]}
                  keyboardType="number-pad"
                  secureTextEntry
                  value={pin}
                  maxLength={4}
                  onChangeText={text => {
                    setPin(
                      text.replace(
                        /[^0-9]/g,
                        '',
                      ),
                    );

                    if (error) {
                      setError('');
                    }
                  }}
                />
              </View>

              {error ? (
                <Text style={styles.error}>
                  {error}
                </Text>
              ) : null}

              <Button
                title={
                  pinLoginPending
                    ? 'Logging in...'
                    : 'Login with PIN'
                }
                onPress={handlePinLogin}
                disabled={
                  phone.length !== 10 ||
                  pin.length !== 4 ||
                  pinLoginPending ||
                  pinLocked
                }
                containerStyle={{
                  marginTop: 16,
                }}
              />

              {pinLocked && (
                <View style={styles.lockedBox}>
                  <Feather
                    name="lock"
                    size={16}
                    color="#DC2626"
                  />

                  <Text style={styles.lockedText}>
                    PIN login is locked for today.
                    You can login using OTP instead.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.forgotPinButton}
                onPress={switchToOtp}>

                <Text style={styles.forgotPinText}>
                  Forgot PIN? Login with OTP instead
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* TERMS */}

          <Text style={styles.or}>
            By continuing you confirm you are agree
            to our
            <Text
              style={styles.highlightText}
              onPress={() =>
                navigation.navigate(
                  'DataPrivacyScreen',
                  {
                    slug: 'terms',
                  },
                )
              }>
              {' '}
              Terms of Service
            </Text>
            {' & '}
            <Text
              style={styles.highlightText}
              onPress={() =>
                navigation.navigate(
                  'DataPrivacyScreen',
                  {
                    slug: 'privacy_policy',
                  },
                )
              }>
              Privacy Policy
            </Text>
          </Text>

          {/* TRUST */}

          <View style={styles.trustBox}>
            <View style={styles.trustItem}>
              <MIcon
                name="hospital-building"
                size={14}
                color={
                  colors.textSecondary
                }
              />

              <Text style={styles.trustText}>
                MoHFW 2020
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.trustItem}>
              <Feather
                name="lock"
                size={14}
                color={
                  colors.textSecondary
                }
              />

              <Text style={styles.trustText}>
                DPDP
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.trustItem}>
              <MIcon
                name="credit-card-outline"
                size={14}
                color={
                  colors.textSecondary
                }
              />

              <Text style={styles.trustText}>
                Razorpay
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* =====================================================
          PROFILE SELECTION MODAL
      ===================================================== */}

      <Modal
        visible={profileModal}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() =>
          setProfileModal(false)
        }>

        <View style={styles.overlay}>
          <View style={styles.modal}>

            <Text style={styles.modalTitle}>
              Select Patient Profile
            </Text>

            <Text style={styles.modalSubtitle}>
              Choose the patient profile you want
              to continue with.
            </Text>

            <ScrollView
              style={styles.profileScroll}
              contentContainerStyle={
                styles.profileScrollContent
              }
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled>

              {profiles.map(item => (
                <TouchableOpacity
                  key={
                    item.patient_account_id
                  }
                  style={styles.profileCard}
                  activeOpacity={0.8}
                  onPress={() =>
                    handleSelectProfile(item)
                  }>

                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {(item.full_name ||
                        'P')
                        .split(' ')
                        .map(
                          x => x[0],
                        )
                        .join('')
                        .toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.profileInfo}>
                    <Text
                      style={styles.profileName}
                      numberOfLines={1}>
                      {item.full_name ||
                        'Complete Profile'}
                    </Text>

                    <Text
                      style={
                        styles.profileRelation
                      }>
                      {item.relationship ===
                        'self'
                        ? 'Self'
                        : item.relationship
                          ? item.relationship
                            .replace(
                              /_/g,
                              ' ',
                            )
                            .replace(
                              /\b\w/g,
                              char =>
                                char.toUpperCase(),
                            )
                          : 'Patient'}

                      {item.age
                        ? ` • ${item.age}`
                        : ''}
                    </Text>
                  </View>

                  <Feather
                    name="chevron-right"
                    size={20}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.stickyFooter}>
              <TouchableOpacity
                style={
                  styles.addFamilyButton
                }
                activeOpacity={0.8}
                onPress={
                  handleAddFamilyMember
                }>

                <View
                  style={
                    styles.addFamilyIcon
                  }>
                  <Feather
                    name="user-plus"
                    size={18}
                    color={
                      colors.darkPrimary
                    }
                  />
                </View>

                <View
                  style={
                    styles.addFamilyInfo
                  }>
                  <Text
                    style={
                      styles.addFamilyTitle
                    }>
                    Add Family Member
                  </Text>

                  <Text
                    style={
                      styles.addFamilySubtitle
                    }>
                    Add a spouse, child,
                    parent or dependent
                  </Text>
                </View>

                <Feather
                  name="chevron-right"
                  size={20}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
    paddingBottom: 24,
  },

  title: {
    fontSize: 24,
    fontFamily: fonts.bold,
    textAlign: 'center',
    color: '#060D1F',
  },

  subtitle: {
    textAlign: 'center',
    marginTop: 6,
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: fonts.medium,
  },

  highlightText: {
    color: colors.darkPrimary,
    fontFamily: fonts.bold,
  },

  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 52,
    marginTop: 20,
  },

  prefix: {
    fontFamily: fonts.bold,
    marginRight: 10,
    color: '#060D1F',
  },

  inputIcon: {
    marginRight: 8,
  },

  input: {
    flex: 1,
    fontFamily: fonts.medium,
    color: '#060D1F',
    fontSize: 14,
  },

  pinInput: {
    letterSpacing: 8,
  },

  fieldLabel: {
    marginTop: 18,
    marginBottom: -10,
    fontSize: 11,
    color: '#64748B',
    fontFamily: fonts.bold,
    letterSpacing: 0.5,
  },

  error: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 6,
    fontFamily: fonts.medium,
  },

  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 14,
  },

  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },

  orText: {
    marginHorizontal: 12,
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: fonts.bold,
  },

  pinButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#D9E1EC',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  pinIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  pinButtonText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#060D1F',
    fontFamily: fonts.semiBold,
  },

  forgotPinButton: {
    alignItems: 'center',
    marginTop: 14,
  },

  forgotPinText: {
    fontSize: 13,
    color: colors.darkPrimary,
    fontFamily: fonts.semiBold,
  },

  backToOtp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },

  backToOtpText: {
    marginLeft: 6,
    fontSize: 13,
    color: colors.darkPrimary,
    fontFamily: fonts.semiBold,
  },

  lockedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },

  lockedText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: '#B91C1C',
    fontFamily: fonts.medium,
  },

  or: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
    fontFamily: fonts.medium,
  },

  trustBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.lg,
  },

  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  trustText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: fonts.medium,
  },

  divider: {
    width: 1,
    height: 14,
    backgroundColor: colors.border,
    marginHorizontal: 8,
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

  profileScroll: {
    flexGrow: 0,
  },

  profileScrollContent: {
    paddingBottom: 8,
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

  stickyFooter: {
    paddingTop: 4,
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