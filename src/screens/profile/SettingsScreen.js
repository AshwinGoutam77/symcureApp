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
import { useSwitchProfileMutation } from '../../hooks/queries/useProfileMutations';

export default function SettingsScreen({ navigation }) {
  const dispatch = useDispatch();

  const [settings, setSettings] = useState({
    whatsapp: true,
    sms: true,
    reminder: true,
  });

  const [profileModal, setProfileModal] = useState(false);

  const { data: profilesResponse, isLoading: profilesLoading } =
    useProfilesQuery();

  const { data: activeProfileResponse, isLoading: activeProfileLoading } =
    useActiveProfileQuery();

  const { mutateAsync: switchProfile, isPending: switchingProfile } =
    useSwitchProfileMutation();

  const profiles =
    profilesResponse?.profiles || profilesResponse?.data?.profiles || [];

  const activeProfile =
    activeProfileResponse?.profile ||
    activeProfileResponse?.data?.profile ||
    activeProfileResponse?.data ||
    activeProfileResponse;

  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();

  /*
   * Clear everything locally.
   *
   * This MUST happen even when logout API returns:
   *
   * INVALID_TOKEN
   *
   * because an expired/invalid token already means
   * the user is effectively logged out.
   */
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
  /*
   * Logout
   *
   * onSettled runs for BOTH:
   *
   * 1. API success
   * 2. API error / INVALID_TOKEN
   */
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

  const toggle = key => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  /*
   * Reusable menu row
   */
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
          <Text style={styles.heading}>Privacy</Text>

          <MenuRow
            icon="shield"
            title="Privacy & Data"
            onPress={() => navigation.navigate('DataPrivacyScreen')}
          />
        </View>

        {/* SUPPORT */}
        <View style={styles.card}>
          <Text style={styles.heading}>Support</Text>

          <MenuRow
            icon="help-circle"
            title="Help & Support"
            onPress={() => navigation.navigate('HelpSupportScreen')}
          />

        </View>

        {/* ABOUT */}
        <View style={styles.card}>
          <Text style={styles.heading}>About</Text>

          <MenuRow
            icon="info"
            title="Version"
            value="1.0.0"
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
});
