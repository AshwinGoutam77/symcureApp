/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { colors, fonts } from '../../theme';

import ManageProfilesModal from '../../components/common/ManageProfilesModal';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useLogoutMutation } from '../../hooks/queries/useAuthMutations';

import { clearSession, setFamilyMemberFlow } from '../../store/authSlice';
import { useDispatch } from 'react-redux';
import {
  useActiveProfileQuery,
  useProfilesQuery,
} from '../../hooks/queries/useProfileQueries';
import {
  useSwitchProfileMutation,
  useSetPinMutation,
} from '../../hooks/queries/useProfileMutations';
import pinStorage from '../../utils/pinStorage';

export default function SettingsScreen({ navigation }) {
  const dispatch = useDispatch();

  const [settings, setSettings] = useState({
    whatsapp: true,
    sms: true,
    reminder: true,
  });

  const [profileModal, setProfileModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPinValue] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');

  const { data: profilesResponse, isLoading: profilesLoading } =
    useProfilesQuery();

  const { data: activeProfileResponse, isLoading: activeProfileLoading } =
    useActiveProfileQuery();

  const { mutateAsync: switchProfile, isPending: switchingProfile } =
    useSwitchProfileMutation();

  const { mutateAsync: setPin, isPending: settingPin } =
    useSetPinMutation();

  const profiles =
    profilesResponse?.profiles || profilesResponse?.data?.profiles || [];

  const activeProfile =
    activeProfileResponse?.profile ||
    activeProfileResponse?.data?.profile ||
    activeProfileResponse?.data ||
    activeProfileResponse;

  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();

  const finishLogout = async () => {
    try {
      console.log('STARTING LOCAL LOGOUT');

      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('patient_account_id');
      await AsyncStorage.removeItem('active_profile');
      await AsyncStorage.removeItem('registration_phone');

      console.log('LOCAL STORAGE CLEARED');

      dispatch(clearSession());

      console.log('REDUX SESSION CLEARED');
    } catch (error) {
      console.log('LOCAL LOGOUT ERROR:', error);

      // Always clear Redux even if storage cleanup fails
      try {
        dispatch(clearSession());
      } catch (reduxError) {
        console.log('REDUX LOGOUT ERROR:', reduxError);
      }
    }
  };

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: response => {
        console.log('LOGOUT API SUCCESS:', response);
      },

      onError: error => {
        console.log('LOGOUT API ERROR:', error);
      },

      onSettled: async () => {
        console.log('LOGOUT API SETTLED');

        await finishLogout();
      },
    });
  };

  const handleSetPin = async () => {
    setPinError('');

    if (!/^\d{4}$/.test(pin)) {
      setPinError('PIN must be exactly 4 digits.');
      return;
    }

    if (pin !== confirmPin) {
      setPinError('PINs do not match.');
      return;
    }

   try {
  await setPin(pin);

  // Save PIN availability
  await pinStorage.setPinSet(true);

  // Save login mobile
  const mobile =
    activeProfile?.mobile ||
    activeProfile?.account?.mobile ||
    activeProfile?.phone;

  if (mobile) {
    await pinStorage.setLoginMobile(mobile);
  }

  console.log(
    'PIN SET SUCCESS - STATUS:',
    await pinStorage.getPinSet(),
  );

  console.log(
    'PIN SET SUCCESS - MOBILE:',
    await pinStorage.getLoginMobile(),
  );

  setPinValue('');
  setConfirmPin('');
  setPinError('');
  setShowPinModal(false);

  Alert.alert(
    activeProfile?.pin_set
      ? 'PIN Updated'
      : 'PIN Set',
    activeProfile?.pin_set
      ? 'Your login PIN has been updated successfully.'
      : 'Your 4-digit login PIN has been set successfully.',
  );
} catch (error) {
  console.log('SET PIN ERROR:', error);

  setPinError(
    error?.error?.message ||
      error?.response?.data?.error?.message ||
      error?.message ||
      'Unable to set PIN. Please try again.',
  );
}
  };

  const toggle = key => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const MenuRow = ({ icon, title, value, onPress, showArrow = true }) => {
    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={styles.left}>
          <Feather name={icon} size={20} color={colors.primary} />

          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.right}>
          {value ? <Text style={styles.value}>{value}</Text> : null}

          {showArrow ? (
            <Feather name="chevron-right" size={18} color="#999" />
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  const handleSelectProfile = async profile => {
    try {
      const patientAccountId = profile?.patient_account_id;

      if (!patientAccountId) {
        Alert.alert('Error', 'Unable to switch this profile.');
        return;
      }

      console.log('SWITCHING PROFILE:', profile);

      await switchProfile({
        patient_account_id: patientAccountId,
      });

      // Keep the active profile locally
      await AsyncStorage.setItem(
        'patient_account_id',
        String(patientAccountId),
      );

      await AsyncStorage.setItem('active_profile', JSON.stringify(profile));

      setProfileModal(false);

      // Optional: reload current screen
      navigation.goBack();
    } catch (error) {
      console.log('SWITCH PROFILE ERROR:', error?.error?.message || error);

      Alert.alert(
        'Error',
        error?.error?.message || error?.message || 'Unable to switch profile.',
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient
        colors={['#5CA8E8', '#8DD66B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={23} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Settings</Text>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 40,
        }}
      >
        {/* ACCOUNT */}
        <View style={styles.card}>
          <Text style={styles.heading}>Account</Text>

          <MenuRow
            icon="users"
            title="Manage Profiles"
            onPress={() => setProfileModal(true)}
          />

          <MenuRow
            icon="lock"
            title="Login PIN"
            value={
              activeProfile?.pin_set
                ? 'Update'
                : 'Set up'
            }
            onPress={() => {
              setPinValue('');
              setConfirmPin('');
              setPinError('');
              setShowPinModal(true);
            }}
          />

          <MenuRow
            icon="trash-2"
            title="Delete Account"
            onPress={() =>
              navigation.navigate('DeleteAccountScreen')
            }
          />
        </View>

        {/* NOTIFICATIONS */}
        <View style={styles.card}>
          <Text style={styles.heading}>Notifications</Text>

          {/* WHATSAPP */}
          <View style={styles.switchRow}>
            <View style={styles.left}>
              <Feather name="message-circle" size={20} color={colors.primary} />

              <Text style={styles.title}>WhatsApp</Text>
            </View>

            <Switch
              value={settings.whatsapp}
              onValueChange={() => toggle('whatsapp')}
              trackColor={{
                false: '#D1D5DB',
                true: colors.primary,
              }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#D1D5DB"
            />
          </View>

          {/* SMS */}
          <View style={styles.switchRow}>
            <View style={styles.left}>
              <Feather name="mail" size={20} color={colors.primary} />

              <Text style={styles.title}>SMS</Text>
            </View>

            <Switch
              value={settings.sms}
              onValueChange={() => toggle('sms')}
              trackColor={{
                false: '#D1D5DB',
                true: colors.primary,
              }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#D1D5DB"
            />
          </View>

          {/* APPOINTMENT REMINDERS */}
          <View style={styles.switchRow}>
            <View style={styles.left}>
              <Feather name="bell" size={20} color={colors.primary} />

              <Text style={styles.title}>Appointment Reminders</Text>
            </View>

            <Switch
              value={settings.reminder}
              onValueChange={() => toggle('reminder')}
              trackColor={{
                false: '#D1D5DB',
                true: colors.primary,
              }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#D1D5DB"
            />
          </View>
        </View>

        {/* PRIVACY */}
        <View style={styles.card}>
          <Text style={styles.heading}>Privacy and Terms</Text>

          <MenuRow
            icon="shield"
            title="Privacy & Data"
            onPress={() =>
              navigation.navigate('DataPrivacyScreen', {
                slug: 'privacy_policy',
              })
            }
          />

          <MenuRow
            icon="help-circle"
            title="Terms and Condition"
            onPress={() =>
              navigation.navigate('DataPrivacyScreen', {
                slug: 'terms',
              })
            }
          />
        </View>

        {/* ABOUT */}
        <View style={styles.card}>
          <Text style={styles.heading}>About</Text>

          <MenuRow
            icon="info"
            title="Version"
            value="1.0.1"
            showArrow={false}
          />
        </View>

        {/* LOGOUT */}
        <TouchableOpacity
          style={[styles.logoutBtn, isLoggingOut && styles.logoutBtnDisabled]}
          onPress={handleLogout}
          disabled={isLoggingOut}
          activeOpacity={0.8}
        >
          <Feather name="log-out" size={20} color="#fff" />

          <Text style={styles.logoutText}>
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>

      <Modal
        visible={showPinModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          if (!settingPin) {
            setShowPinModal(false);
          }
        }}
      >
        <View style={styles.pinOverlay}>
          <View style={styles.pinModal}>

            <View style={styles.pinIcon}>
              <Feather
                name="lock"
                size={26}
                color={colors.primary}
              />
            </View>

            <Text style={styles.pinTitle}>
              {activeProfile?.pin_set
                ? 'Update Login PIN'
                : 'Set Login PIN'}
            </Text>

            <Text style={styles.pinSubtitle}>
              {activeProfile?.pin_set
                ? 'Create a new 4-digit PIN for faster login.'
                : 'Set a 4-digit PIN to login faster next time.'}
            </Text>

            <View style={styles.pinInputWrapper}>
              <Text style={styles.pinLabel}>
                NEW PIN
              </Text>

              <View style={styles.pinInputBox}>
                <Feather
                  name="lock"
                  size={17}
                  color="#64748B"
                />

                <TextInput
                  style={styles.pinInput}
                  placeholder="Enter 4-digit PIN"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={4}
                  value={pin}
                  onChangeText={text => {
                    setPinValue(
                      text.replace(/\D/g, '').slice(0, 4),
                    );
                    setPinError('');
                  }}
                />
              </View>
            </View>

            <View style={styles.pinInputWrapper}>
              <Text style={styles.pinLabel}>
                CONFIRM PIN
              </Text>

              <View style={styles.pinInputBox}>
                <Feather
                  name="lock"
                  size={17}
                  color="#64748B"
                />

                <TextInput
                  style={styles.pinInput}
                  placeholder="Re-enter 4-digit PIN"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={4}
                  value={confirmPin}
                  onChangeText={text => {
                    setConfirmPin(
                      text.replace(/\D/g, '').slice(0, 4),
                    );
                    setPinError('');
                  }}
                />
              </View>
            </View>

            {pinError ? (
              <Text style={styles.pinError}>
                {pinError}
              </Text>
            ) : null}

            <View style={styles.pinActions}>
              <TouchableOpacity
                style={styles.pinCancelButton}
                disabled={settingPin}
                onPress={() => {
                  setShowPinModal(false);
                  setPinValue('');
                  setConfirmPin('');
                  setPinError('');
                }}
              >
                <Text style={styles.pinCancelText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.pinSaveButton,
                  settingPin && { opacity: 0.7 },
                ]}
                disabled={
                  settingPin ||
                  pin.length !== 4 ||
                  confirmPin.length !== 4
                }
                onPress={handleSetPin}
              >
                {settingPin ? (
                  <ActivityIndicator
                    size="small"
                    color="#fff"
                  />
                ) : (
                  <Text style={styles.pinSaveText}>
                    {activeProfile?.pin_set
                      ? 'Update PIN'
                      : 'Set PIN'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

      {/* MANAGE PROFILES MODAL */}
      <ManageProfilesModal
        visible={profileModal}
        profiles={profiles}
        activeProfile={activeProfile}
        switchingProfile={switchingProfile}
        onClose={() => setProfileModal(false)}
        onSelect={handleSelectProfile}
        onAddProfile={async () => {
          setProfileModal(false);

          const phone = await AsyncStorage.getItem('registration_phone');

          console.log('REGISTRATION PHONE:', phone);

          dispatch(
            setFamilyMemberFlow({
              phone: phone || null,
            }),
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FD',
  },

  header: {
    paddingTop: 75,
    paddingBottom: 20,
    paddingHorizontal: 18,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backBtn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginRight: 10,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontFamily: fonts.bold,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: 16,
  },

  heading: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    marginVertical: 10,
    color: '#222',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 56,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#EFEFEF',
  },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: '#EFEFEF',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    marginLeft: 14,
    fontSize: 15,
    color: '#222',
    fontWeight: '600',
  },

  value: {
    color: '#888',
    marginRight: 8,
    fontSize: 14,
  },

  logoutBtn: {
    backgroundColor: '#EF4444',
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 20,
  },

  logoutBtnDisabled: {
    opacity: 0.6,
  },

  logoutText: {
    color: '#fff',
    fontFamily: fonts.semiBold,
    fontSize: 16,
    marginLeft: 10,
  },

  pinOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  pinModal: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 22,
  },

  pinIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },

  pinTitle: {
    fontSize: 21,
    fontFamily: fonts.bold,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },

  pinSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#667085',
    textAlign: 'center',
    marginBottom: 18,
  },

  pinInputWrapper: {
    marginBottom: 14,
  },

  pinLabel: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: '#64748B',
    marginBottom: 6,
  },

  pinInputBox: {
    height: 50,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  pinInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#111827',
    fontFamily: fonts.medium,
    letterSpacing: 6,
  },

  pinError: {
    color: '#D92D20',
    fontSize: 13,
    marginBottom: 8,
    fontFamily: fonts.medium,
  },

  pinActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },

  pinCancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    justifyContent: 'center',
    alignItems: 'center',
  },

  pinCancelText: {
    color: '#344054',
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },

  pinSaveButton: {
    flex: 1.4,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.darkPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  pinSaveText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
});
