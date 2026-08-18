import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';

import { colors, fonts } from '../../theme';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ManageProfilesModal from '../../components/common/ManageProfilesModal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import {
  useProfilesQuery,
  useActiveProfileQuery,
} from '../../hooks/queries/useProfileQueries';

import { useUpdateProfileMutation } from '../../hooks/queries/useProfileMutations';

import {
  useStatesQuery,
  useCitiesQuery,
} from '../../hooks/queries/useLookupQueries';
import { setFamilyMemberFlow } from '../../store/authSlice';
import { useDispatch } from 'react-redux';

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();

  const { data: profilesResponse, isLoading: profilesLoading } =
    useProfilesQuery();
  const { data: activeProfileResponse, isLoading: activeProfileLoading } =
    useActiveProfileQuery();
  const { mutateAsync: updateProfile, isPending: updatingProfile } =
    useUpdateProfileMutation();
  const profiles =
    profilesResponse?.profiles || profilesResponse?.data?.profiles || [];
  const activeProfile =
    activeProfileResponse?.profile ||
    activeProfileResponse?.data?.profile ||
    activeProfileResponse?.data ||
    activeProfileResponse;

  const [profileModal, setProfileModal] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showRelationshipModal, setShowRelationshipModal] = useState(false);

  const genderOptions = ['Male', 'Female', 'Other'];

  const [form, setForm] = useState({
    fullName: '',
    dob: '',
    gender: '',
    relationship: '',
    guardianType: '',
    guardianName: '',
    email: '',
    mobile: '',
    emergencyPhone: '',
    emergencyName: '',
    emergencyRelation: '',
    area: '',
    street: '',
    state: '',
    stateId: null,
    city: '',
    cityId: null,
    tehsil: '',
    district: '',
    pincode: '',
    aadhaar: '',
    abha: '',
  });

  useEffect(() => {
    if (!activeProfile) {
      return;
    }

    const address = activeProfile.address || {};
    const emergency = activeProfile.emergency_contact || {};
    const identity = activeProfile.identity || {};

    setForm({
      fullName: activeProfile.full_name || '',
      dob: activeProfile.dob ? formatDateForDisplay(activeProfile.dob) : '',
      gender: activeProfile.gender || '',
      relationship: activeProfile.relationship || '',
      guardianType: activeProfile.guardian_type || '',
      guardianName: activeProfile.guardian_name || '',
      email: activeProfile.email || '',
      mobile: activeProfile.mobile || '',
      emergencyPhone: emergency.mobile || '',
      emergencyName: emergency.name || '',
      emergencyRelation: emergency.relation || '',
      area: address.street || '',
      street: address.street || '',
      state: address.state_name || '',
      stateId: address.state_id || null,
      city: address.city_name || '',
      cityId: address.city_id || null,
      tehsil: address.tehsil || '',
      district: address.district || '',
      pincode: address.pin_code || '',
      aadhaar: identity.aadhaar_mask || '',
      abha: identity.abha_mask || '',
    });

    if (address.state_id) {
      setSelectedStateId(address.state_id);
    }
  }, [activeProfile]);

  const formatDateForDisplay = date => {
    if (!date) {
      return '';
    }

    const [year, month, day] = date.split('-');

    return `${day}/${month}/${year}`;
  };

  const convertDobToApiFormat = dob => {
    if (!dob) {
      return null;
    }

    const parts = dob.split('/');

    if (parts.length !== 3) {
      return dob;
    }

    const [day, month, year] = parts;

    return `${year}-${month}-${day}`;
  };

  const handleChange = (key, value) => {
    setForm(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const relationshipOptions = [
    { label: 'Spouse', value: 'spouse' },
    { label: 'Child', value: 'child' },
    { label: 'Parent', value: 'parent' },
    { label: 'Sibling', value: 'sibling' },
    { label: 'Other Dependent', value: 'other_dependent' },
  ];

  const guardianTypeOptions = [
    { label: 'S/O', value: 'S/O' },
    { label: 'D/O', value: 'D/O' },
    { label: 'W/O', value: 'W/O' },
    { label: 'C/O', value: 'C/O' },
  ];

  const [selectedStateId, setSelectedStateId] = useState(null);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showGuardianTypeModal, setShowGuardianTypeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { data: statesResponse } = useStatesQuery();
  const { data: citiesResponse } = useCitiesQuery(selectedStateId);

  const states = statesResponse?.data?.states || [];
  const cities = citiesResponse?.data?.cities || [];

  const handleSaveProfile = async () => {
    const aadhaar = (form.aadhaar || '').replace(/\s/g, '');
    const abha = (form.abha || '').replace(/\D/g, '');
    try {
      const payload = {
        full_name: form.fullName,
        dob: convertDobToApiFormat(form.dob),
        gender: form.gender,
        email: form.email || undefined,
        guardian_type: form.guardianType || '',
        guardian_name: form.guardianName || '',
        mobile: form.mobile,

        address: {
          street: form.area || '',
          area: '',
          city_id: form.cityId,
          state_id: form.stateId,
          district: form.district || '',
          tehsil: form.tehsil || '',
          pin_code: form.pincode || '',
        },

        emergency_contact: {
          name: form.emergencyName || '',
          mobile: form.emergencyPhone || '',
          relation: form.emergencyRelation || '',
        },
      };

      if (aadhaar && !aadhaar.includes('*') && aadhaar.length === 12) {
        payload.aadhaar_no = aadhaar;
      }

      if (abha && !abha.includes('*') && abha.length === 14) {
        payload.abha_no = abha;
      }

      await updateProfile(payload);
      setShowSuccessModal(true);
    } catch (error) {
      console.log('UPDATE PROFILE ERROR:', error);

      Alert.alert(
        'Error',
        error?.error?.message || error?.message || 'Unable to update profile.',
      );
    }
  };

  if (activeProfileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />

        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={colors.gradient}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Feather name="arrow-left" size={22} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingBtn}
              onPress={() => navigation.navigate('SettingsScreen')}
            >
              <Feather name="settings" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setProfileModal(true)}
          >
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(activeProfile?.full_name || 'P')
                    .split(' ')
                    .map(x => x[0])
                    .join('')
                    .toUpperCase()}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={[styles.row, { gap: 5 }]}>
                  <Text style={styles.name}>
                    {activeProfile?.full_name || 'Complete Profile'}
                  </Text>
                  <Feather name="chevron-down" size={22} color="#fff" />
                </View>

                <Text style={styles.phone}>
                  {activeProfile?.mobile ? `+91 ${activeProfile.mobile}` : ''}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.statsRow}>
            {[
              {
                value: activeProfile?.stats?.appointments_count,
                label: 'APPOINTMENTS',
              },
              {
                value: activeProfile?.stats?.prescriptions_count,
                label: 'PRESCRIPTIONS',
              },
              { value: activeProfile?.stats?.reports_count, label: 'REPORTS' },
            ].map((item, i) => (
              <View key={i} style={styles.statBox}>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>

      <KeyboardAwareScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 180 }}
      >
        {/* PERSONAL DETAILS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Details</Text>

          <Input
            label="FULL NAME"
            value={form.fullName}
            onChangeText={text => handleChange('fullName', text)}
          />

          <Input
            label="MOBILE"
            keyboardType="number-pad"
            maxLength={10}
            value={form.mobile}
            onChangeText={text =>
              handleChange('mobile', text.replace(/\D/g, '').slice(0, 10))
            }
          />

          {activeProfile?.relationship !== 'self' && (
            <TouchableOpacity activeOpacity={1}>
              <View pointerEvents="none">
                <Input
                  label="RELATIONSHIP"
                  value={
                    relationshipOptions.find(
                      item => item.value === form.relationship,
                    )?.label || ''
                  }
                  placeholder="Select Relationship"
                  editable={false}
                  disabled
                />
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                label="DOB"
                type="date"
                value={form.dob}
                onChangeText={text => handleChange('dob', text)}
              />
            </View>
            <View style={{ width: 10 }} />
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => setShowGenderModal(true)}
              >
                <View pointerEvents="none">
                  <Input
                    label="GENDER"
                    value={form.gender}
                    placeholder="Select Gender"
                    editable={false}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            {/* GUARDIAN TYPE */}
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => setShowGuardianTypeModal(true)}
              >
                <View pointerEvents="none">
                  <Input
                    label="GUARDIAN TYPE (OPTIONAL)"
                    value={form.guardianType}
                    placeholder="Select"
                    editable={false}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <View style={{ width: 12 }} />

            {/* GUARDIAN NAME */}
            <View style={{ flex: 1 }}>
              <Input
                label="GUARDIAN NAME (OPTIONAL)"
                placeholder="Guardian Name"
                value={form.guardianName}
                onChangeText={text => handleChange('guardianName', text)}
              />
            </View>
          </View>

          <Input
            label="EMAIL"
            value={form.email}
            onChangeText={text => handleChange('email', text)}
          />

          <Input
            label="EMERGENCY CONTACT NUMBER"
            keyboardType="number-pad"
            maxLength={10}
            value={form.emergencyPhone}
            onChangeText={text =>
              handleChange(
                'emergencyPhone',
                text.replace(/\D/g, '').slice(0, 10),
              )
            }
          />
        </View>

        {/* ADDRESS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Address</Text>

          <Input
            label="ADDRESS"
            value={form.area}
            onChangeText={text => handleChange('area', text)}
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => setShowStateModal(true)}
              >
                <View pointerEvents="none">
                  <Input
                    label="STATE"
                    value={form.state}
                    placeholder="Select State"
                    editable={false}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ width: 10 }} />
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                activeOpacity={1}
                disabled={!form.state}
                onPress={() => setShowCityModal(true)}
              >
                <View pointerEvents="none">
                  <Input
                    label="CITY"
                    value={form.city}
                    placeholder="Select City"
                    editable={false}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                label="TEHSIL"
                value={form.tehsil}
                onChangeText={text => handleChange('tehsil', text)}
              />
            </View>
            <View style={{ width: 10 }} />
            <View style={{ flex: 1 }}>
              <Input
                label="DISTRICT"
                value={form.district}
                onChangeText={text => handleChange('district', text)}
              />
            </View>
          </View>

          <Input
            label="PIN CODE"
            keyboardType="number-pad"
            maxLength={6}
            value={form.pincode}
            onChangeText={text =>
              handleChange('pincode', text.replace(/\D/g, '').slice(0, 6))
            }
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Identity</Text>
          <Input
            label="AADHAAR"
            value={form.aadhaar}
            maxLength={12}
            onChangeText={text =>
              handleChange('aadhaar', text.replace(/\D/g, '').slice(0, 12))
            }
          />

          <Input
            label="ABHA"
            value={form.abha}
            onChangeText={text =>
              handleChange('abha', text.replace(/\D/g, '').slice(0, 14))
            }
          />
        </View>
      </KeyboardAwareScrollView>
      <View style={styles.buttonWrap}>
        <Button
          title={updatingProfile ? 'Saving...' : 'Save Changes'}
          onPress={handleSaveProfile}
          disabled={updatingProfile}
        />
      </View>

      <Modal
        visible={showGuardianTypeModal}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setShowGuardianTypeModal(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowGuardianTypeModal(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <View style={styles.handle} />

            <Text style={[styles.cardTitle, { fontSize: 20 }]}>
              Select Guardian Type
            </Text>

            {guardianTypeOptions.map(item => (
              <TouchableOpacity
                key={item.value}
                style={styles.menuRow}
                onPress={() => {
                  handleChange('guardianType', item.value);

                  setShowGuardianTypeModal(false);
                }}
              >
                <Text style={styles.menuTitle}>{item.label}</Text>

                {form.guardianType === item.value && (
                  <Feather name="check" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.successOverlay}>
          <View style={styles.successModal}>
            {/* SUCCESS ICON */}
            <View style={styles.successIcon}>
              <Feather name="check" size={32} color="#fff" />
            </View>

            <Text style={styles.successTitle}>Profile Updated</Text>

            <Text style={styles.successMessage}>
              Your profile details have been updated successfully.
            </Text>

            <TouchableOpacity
              style={styles.successButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.successButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* gender modal */}
      <Modal
        visible={showGenderModal}
        transparent
        animationType="slide"
        statusBarTranslucent
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowGenderModal(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <View style={styles.handle} />

            <Text style={[styles.cardTitle, { fontSize: 20 }]}>
              Select Gender
            </Text>

            {genderOptions.map(item => (
              <TouchableOpacity
                key={item}
                style={styles.menuRow}
                onPress={() => {
                  handleChange('gender', item);
                  setShowGenderModal(false);
                }}
              >
                <Text style={styles.menuTitle}>{item}</Text>

                {form.gender === item && (
                  <Feather name="check" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* relationship modal */}
      <Modal
        visible={showRelationshipModal}
        transparent
        animationType="slide"
        statusBarTranslucent
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowRelationshipModal(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <View style={styles.handle} />

            <Text style={[styles.cardTitle, { fontSize: 20 }]}>
              Select Relationship
            </Text>

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => {
                handleChange('relationship', '');
                setShowRelationshipModal(false);
              }}
            >
              <Text style={styles.menuTitle}>Select Relationship</Text>

              {form.relationship === '' && (
                <Feather name="check" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>

            {relationshipOptions.map(item => (
              <TouchableOpacity
                key={item.value}
                style={styles.menuRow}
                onPress={() => {
                  handleChange('relationship', item.value);
                  setShowRelationshipModal(false);
                }}
              >
                <Text style={styles.menuTitle}>{item.label}</Text>

                {form.relationship === item.value && (
                  <Feather name="check" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* state modal */}
      <Modal
        visible={showStateModal}
        transparent
        animationType="slide"
        statusBarTranslucent
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowStateModal(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <View style={styles.handle} />

            <Text style={[styles.cardTitle, { fontSize: 20 }]}>
              Select State
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {states.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuRow}
                  onPress={() => {
                    handleChange('state', item.name);
                    handleChange('stateId', item.id);

                    handleChange('city', '');
                    handleChange('cityId', null);

                    setSelectedStateId(item.id);
                    setShowStateModal(false);
                  }}
                >
                  <Text style={styles.menuTitle}>{item.name}</Text>

                  {form.state === item.name && (
                    <Feather name="check" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* city modal */}
      <Modal
        visible={showCityModal}
        transparent
        animationType="slide"
        statusBarTranslucent
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowCityModal(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <View style={styles.handle} />

            <Text style={[styles.cardTitle, { fontSize: 20 }]}>
              Select City
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {cities.map(item => (
                <TouchableOpacity
                  key={item.name}
                  style={styles.menuRow}
                  onPress={() => {
                    handleChange('city', item.name);
                    handleChange('cityId', item.id);

                    setShowCityModal(false);
                  }}
                >
                  <Text style={styles.menuTitle}>{item.name}</Text>

                  {form.city === item.name && (
                    <Feather name="check" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* manage profiles modal */}
      <ManageProfilesModal
        visible={profileModal}
        profiles={profiles}
        activeProfile={activeProfile}
        onClose={() => setProfileModal(false)}
        onSelect={profile => {
          console.log('PROFILE CHANGED:', profile);
        }}
        onAddProfile={() => {
          setProfileModal(false);

          dispatch(
            setFamilyMemberFlow({
              phone: form.mobile,
            }),
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FD' },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  header: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 20 },

  backBtn: {
    padding: 6,
    borderRadius: 10,
    marginBottom: 16,
  },

  row: { flexDirection: 'row', alignItems: 'center' },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4FA3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  avatarText: { color: '#fff', fontSize: 18, fontFamily: fonts.semiBold, },

  name: { color: '#fff', fontSize: 24, fontFamily: fonts.semiBold, },

  phone: { color: '#fff', fontSize: 14 },

  statsRow: { flexDirection: 'row', marginTop: 16 },

  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  statValue: { color: '#fff', fontSize: 18, fontFamily: fonts.semiBold, },
  statLabel: { color: '#fff', fontSize: Platform.OS === 'ios' ? 8 : 11, fontFamily: fonts.semiBold, },

  content: { padding: 16 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },

  cardTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    marginBottom: 14,
    color: colors.textPrimary,
  },

  modalSubtitle: {
    fontSize: 14,
    color: '#7A879E',
    marginBottom: 14,
    lineHeight: 20,
  },

  lockText: {
    marginTop: 10,
    fontSize: 12,
    color: '#7A879E',
  },

  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  buttonWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    // paddingBottom: 90,
    backgroundColor: '#F4F7FD',
    borderTopWidth: 1,
    borderTopColor: '#E6EBF5',
  },

  sheet: {
    backgroundColor: '#ffffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 30,
    maxHeight: '80%',
  },

  handle: {
    width: 50,
    height: 5,
    borderRadius: 10,
    backgroundColor: '#DADADA',
    alignSelf: 'center',
    marginBottom: 18,
  },

  title: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    textAlign: 'left',
    marginBottom: 20,
    color: 'black',
  },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },

  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },

  subtitle: {
    marginTop: 3,
    color: 'black',
  },

  addProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    borderTopWidth: 1,
    borderColor: '#EEE',
    paddingTop: 18,
  },

  plusCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EEF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  addText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: '#2E76FF',
  },

  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },

  successModal: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 25,
    alignItems: 'center',
  },

  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  successTitle: {
    fontSize: 21,
    fontFamily: fonts.semiBold,
    color: '#111827',
    marginBottom: 8,
  },

  successMessage: {
    fontSize: 14,
    lineHeight: 21,
    color: '#667085',
    textAlign: 'center',
    marginBottom: 22,
  },

  successButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.darkPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  successButtonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: fonts.semiBold,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F4F7FD',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
