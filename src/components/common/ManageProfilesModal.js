/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';

import { colors } from '../../theme';
import { setActiveProfile } from '../../store/authSlice';
import { useQueryClient } from '@tanstack/react-query';

export default function ManageProfilesModal({
  visible,
  profiles = [],
  activeProfile,
  onClose,
  onSelect,
  onAddProfile,
}) {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [selectedProfileId, setSelectedProfileId] = useState(null);

  /*
   * Keep local selected profile in sync
   * with activeProfile from Redux/parent.
   */
  useEffect(() => {
    if (activeProfile?.patient_account_id) {
      setSelectedProfileId(activeProfile.patient_account_id);
    }
  }, [activeProfile]);

  /*
   * Get initials
   */
  const getInitials = fullName => {
    if (!fullName) {
      return 'P';
    }

    return fullName
      .trim()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  /*
   * Check selected profile
   */
  const isSelected = item => {
    return item?.patient_account_id === selectedProfileId;
  };

  const [switchingProfile, setSwitchingProfile] = useState(true);

  const handleSelectProfile = async profile => {
    try {
      const patientAccountId = profile?.patient_account_id;

      if (!patientAccountId) {
        return;
      }
      setSwitchingProfile(true);

      await AsyncStorage.setItem(
        'patient_account_id',
        String(patientAccountId),
      );

      await AsyncStorage.setItem('active_profile', JSON.stringify(profile));

      dispatch(setActiveProfile(profile));

      /* Refetch APIs */
      queryClient.invalidateQueries({
        refetchType: 'active',
      });

      setSelectedProfileId(patientAccountId);

      onClose?.();
    } catch (error) {
      console.log('PROFILE SWITCH ERROR:', error);
    } finally {
      setSwitchingProfile(false);
    }
  };

//   const handleSelectProfile = profile => {
//   if (!profile?.patient_account_id) {
//     return;
//   }

//   onSelect?.(profile);
// };

  const renderProfile = ({ item }) => {
    const selected = isSelected(item);

    return (
      <TouchableOpacity
        style={[styles.userRow, selected && styles.selectedUserRow]}
        activeOpacity={0.8}
        onPress={() => handleSelectProfile(item)}
      >
        {/* AVATAR */}
        <View style={[styles.avatar, selected && styles.selectedAvatar]}>
          <Text style={styles.avatarText}>{getInitials(item?.full_name)}</Text>
        </View>

        {/* PROFILE DETAILS */}
        <View style={styles.profileInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {item?.full_name || 'Complete Profile'}
          </Text>

          <Text style={styles.userInfo}>
            {item?.relationship === 'self'
              ? 'Self'
              : item?.relationship || 'Patient'}

            {item?.age ? ` • ${item.age}` : ''}
          </Text>
        </View>

        {/* SELECTED */}
        {selected ? (
          <View style={styles.checkCircle}>
            <Feather name="check" size={16} color="#fff" />
          </View>
        ) : (
          <Feather name="chevron-right" size={20} color="#A0A8B5" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* TAP OUTSIDE */}
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* BOTTOM SHEET */}
        <View style={styles.sheet}>
          {/* HANDLE */}
          <View style={styles.handle} />

          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Manage Profiles</Text>

              <Text style={styles.subtitle}>
                Switch between profiles or create a new one.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Feather name={Platform.OS === 'ios' ? 'x-circle' : 'x'} size={20} color="#667085" />
            </TouchableOpacity>
          </View>

          {/* PROFILES */}
          <FlatList
            data={profiles}
            keyExtractor={item => String(item?.patient_account_id)}
            renderItem={renderProfile}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              profiles.length === 0
                ? styles.emptyContainer
                : styles.listContainer
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <Feather name="users" size={28} color={colors.primary} />
                </View>

                <Text style={styles.emptyTitle}>No profiles found</Text>

                <Text style={styles.emptyText}>
                  Create a new patient profile to continue.
                </Text>
              </View>
            }
          />

          {/* ADD PROFILE */}
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={onAddProfile}
          >
            <View style={styles.plusCircle}>
              <Feather name="plus" size={20} color={colors.primary} />
            </View>

            <View style={styles.addTextContainer}>
              <Text style={styles.addText}>Add New Profile</Text>

              <Text style={styles.addSubText}>
                Create a profile for a family member
              </Text>
            </View>

            <Feather name="chevron-right" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },

  overlayTouchable: {
    flex: 1,
  },

  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
    maxHeight: '82%',
  },

  handle: {
    width: 48,
    height: 5,
    borderRadius: 10,
    backgroundColor: '#D6D9DE',
    alignSelf: 'center',
    marginBottom: 18,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  headerText: {
    flex: 1,
    paddingRight: 15,
  },

  title: {
    fontSize: 21,
    fontWeight: '700',
    color: '#111827',
  },

  subtitle: {
    marginTop: 5,
    fontSize: 13,
    color: '#7A879E',
    lineHeight: 19,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F5F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  listContainer: {
    paddingBottom: 8,
  },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F4',
    borderRadius: 14,
  },

  selectedUserRow: {
    backgroundColor: '#F5F9FF',
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#4FA3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  selectedAvatar: {
    backgroundColor: colors.primary,
  },

  avatarText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },

  profileInfo: {
    flex: 1,
  },

  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  userInfo: {
    marginTop: 4,
    color: '#667085',
    fontSize: 13,
    fontWeight: '500',
  },

  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 16,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },

  plusCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  addTextContainer: {
    flex: 1,
  },

  addText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },

  addSubText: {
    marginTop: 3,
    fontSize: 12,
    color: '#7A879E',
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  empty: {
    alignItems: 'center',
    paddingVertical: 30,
  },

  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  emptyText: {
    marginTop: 5,
    fontSize: 13,
    color: '#7A879E',
    textAlign: 'center',
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },

  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 25,
    borderRadius: 18,
    backgroundColor: '#fff',
  },

  loadingTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  loadingText: {
    marginTop: 4,
    fontSize: 13,
    color: '#7A879E',
  },
});
