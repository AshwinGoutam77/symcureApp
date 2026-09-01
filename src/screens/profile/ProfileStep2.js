/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import { colors, fonts } from '../../theme';
import Button from '../../components/common/Button';
import FormCard from '../../components/common/FormCard';
import Input from '../../components/common/Input';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { State, City } from 'country-state-city';
import Feather from 'react-native-vector-icons/Feather';
import {
  useStatesQuery,
  useCitiesQuery,
} from '../../hooks/queries/useLookupQueries';
import {
  useAddFamilyMemberMutation,
  useCompleteProfileMutation,
} from '../../hooks/queries/useAuthMutations';
import { useDispatch } from 'react-redux';
import { clearFamilyMemberFlow, setActiveProfile, setAuthUser, setProfileComplete } from '../../store/authSlice';

export default function ProfileStep2({ navigation, route }) {
  const dispatch = useDispatch();
  const {
    form: step1Form = {},
    existingAccount = false,
    patientAccountId = null,
  } = route?.params || {};

  const [form, setForm] = useState({
    street: '',
    area: '',
    state: '',
    stateId: null,
    city: '',
    cityId: null,
    district: '',
    tehsil: '',
    pincode: '',
    aadhaar: '',
    abha: '',
  });

  const [showState, setShowState] = useState(false);
  const [showCity, setShowCity] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [errors, setErrors] = useState({});
  const { data: statesResponse, isLoading: statesLoading } = useStatesQuery();

  const states = statesResponse?.data?.states || [];

  const { data: citiesResponse, isLoading: citiesLoading } = useCitiesQuery(
    form.stateId,
  );

  const cities = citiesResponse?.data?.cities || [];

  const { mutateAsync: completeProfile, isPending: loading } =
    useCompleteProfileMutation();

  const { mutateAsync: addFamilyMember } = useAddFamilyMemberMutation();

  const handleChange = (key, value) => {
    setForm(prev => ({
      ...prev,
      [key]: value,
    }));

    if (errors[key]) {
      setErrors(prev => ({
        ...prev,
        [key]: '',
      }));
    }
  };

  const formatAadhaar = text => {
    const cleaned = text.replace(/\D/g, '').slice(0, 12);

    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const validate = () => {
    const newErrors = {};

    const aadhaar = form.aadhaar.replace(/\s/g, '');

    if (aadhaar && aadhaar.length !== 12) {
      newErrors.aadhaar = 'Aadhaar number must be 12 digits';
    }

    const abha = form.abha.replace(/\D/g, '');

    if (abha && abha.length !== 14) {
      newErrors.abha = 'ABHA number must be 14 digits';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleCompleteProfile = async () => {
    if (!validate()) {
      return;
    }

    try {
      setErrors({});
      const aadhaar = form.aadhaar.replace(/\s/g, '');
      const abha = form.abha.replace(/\D/g, '');

      const payload = {
        // STEP 1
        full_name: step1Form.fullName,
        dob: convertDobToApiFormat(step1Form.dob),
        gender: step1Form.gender,
        guardian_type: step1Form.guardianType || undefined,
        guardian_name: step1Form.guardianName || undefined,

        ...(step1Form.email
          ? {
            email: step1Form.email,
          }
          : {}),

        // STEP 2
        address: {
          street: form.street,
          area: form.area,
          city_id: form.cityId,
          state_id: form.stateId,
          district: form.district,
          tehsil: form.tehsil,
          pin_code: form.pincode,
        },

        emergency_contact: {
          name: step1Form.emergencyName || '',
          mobile: step1Form.emergencyPhone || '',
          relation: step1Form.relationship || '',
        },
      };

      if (existingAccount) {
        payload.relationship = step1Form.relationship;
      }

      if (aadhaar) {
        payload.aadhaar_no = aadhaar;
      }

      if (abha) {
        payload.abha_no = abha;
      }

      // console.log(
      //   'PROFILE COMPLETE PAYLOAD:',
      //   JSON.stringify(payload, null, 2),
      // );
      // return

      let response;

      if (existingAccount) {
        // Family member
        payload.relationship = step1Form.relationship;

        // console.log('FAMILY MEMBER PAYLOAD:', {
        //   payload,
        // });

        response = await addFamilyMember(payload);
      } else {
        // Primary patient
        response = await completeProfile(payload);
      }
      //       if (response?.success) {
      //   setProfileResponse(response);
      //   setShowSuccess(true);
      //   return;
      // }
      if (response?.success) {
        console.log('PROFILE CREATED SUCCESS');

        const newProfile = response?.data?.profile;

        console.log(
          'NEW PROFILE:',
          JSON.stringify(newProfile, null, 2),
        );

        // -----------------------------------------
        // SHOW SUCCESS MODAL FIRST
        // -----------------------------------------

        setShowSuccess(true);

        // -----------------------------------------
        // UPDATE PROFILE STORAGE / REDUX
        // -----------------------------------------

        if (newProfile?.patient_account_id) {
          const newPatientAccountId = String(
            newProfile.patient_account_id,
          );

          try {
            await AsyncStorage.setItem(
              'patient_account_id',
              newPatientAccountId,
            );

            await AsyncStorage.setItem(
              'active_profile',
              JSON.stringify(newProfile),
            );

            dispatch(
              setActiveProfile(newProfile),
            );

            console.log(
              'PATIENT ACCOUNT ID UPDATED:',
              newPatientAccountId,
            );
          } catch (storageError) {
            console.log(
              'PROFILE STORAGE UPDATE ERROR:',
              storageError,
            );
          }
        }

        return;
      }
      // setErrors({
      //   api:
      //     response?.error?.message ||
      //     response?.message ||
      //     'Unable to create profile.',
      // });
      const message =
        response?.error?.message ||
        response?.message ||
        'Unable to create profile.';

      setErrorMessage(message);
      setShowError(true);
    } catch (error) {
      console.log('PROFILE API ERROR:', error);
      console.log('PROFILE API ERROR DATA:', error?.response?.data);
      const apiData = error?.response?.data || error;
      const apiError = apiData?.error;
      const validationErrors = apiData?.error?.data;
      if (validationErrors) {
        console.log('PROFILE VALIDATION ERRORS:', apiError);
        setErrorMessage(
          apiError?.message || 'Please check the entered details.',
        );
        setShowError(true);
        return;
      }

      // setErrors({
      //   api:
      //     apiError?.message ||
      //     apiData?.message ||
      //     error?.message ||
      //     'Unable to create profile.',
      // });
      const message =
        apiError?.message ||
        apiData?.message ||
        error?.message ||
        'Unable to create profile.';

      setErrorMessage(message);
      setShowError(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <LinearGradient colors={colors.gradient}>
  <View style={styles.header}>

    <TouchableOpacity
      style={styles.backButton}
      onPress={() => navigation.goBack()}
      activeOpacity={0.8}>
      <Feather
        name="arrow-left"
        size={20}
        color="#fff"
      />
    </TouchableOpacity>

    <Text style={styles.title}>Create Your Profile</Text>

    <Text style={styles.subtitle}>
      Step 2 of 2 — Address & Identity
    </Text>

    <View style={styles.progress}>
      <View style={[styles.bar, styles.active]} />
      <View style={[styles.bar, styles.active]} />
    </View>

  </View>
</LinearGradient>

      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 140,
        }}
      >
        {/* ADDRESS */}

        <FormCard>
          <Text style={styles.cardTitle}>Address</Text>

          {/* STREET */}

          <Input
            label="STREET (OPTIONAL)"
            value={form.street}
            onChangeText={t => handleChange('street', t)}
            placeholder="Street address"
          />

          {errors.street && (
            <Text style={styles.errorLabel}>{errors.street}</Text>
          )}

          {/* AREA */}

          <Input
            label="AREA / LOCALITY (OPTIONAL)"
            value={form.area}
            onChangeText={t => handleChange('area', t)}
            placeholder="Area / locality"
          />

          {errors.area && <Text style={styles.errorLabel}>{errors.area}</Text>}

          {/* STATE + CITY */}

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => setShowState(true)}
              >
                <View pointerEvents="none">
                  <Input
                    label="STATE (OPTIONAL)"
                    value={form.state}
                    placeholder="Select"
                    editable={false}
                  />
                </View>
              </TouchableOpacity>

              {errors.state && (
                <Text style={styles.errorLabel}>{errors.state}</Text>
              )}
            </View>

            <View style={{ width: 12 }} />

            <View style={{ flex: 1 }}>
              <TouchableOpacity
                activeOpacity={1}
                disabled={!form.stateId}
                onPress={() => setShowCity(true)}
              >
                <View pointerEvents="none">
                  <Input
                    label="CITY (OPTIONAL)"
                    value={form.city}
                    placeholder={form.stateId ? 'Select' : 'Select state first'}
                    editable={false}
                  />
                </View>
              </TouchableOpacity>

              {errors.city && (
                <Text style={styles.errorLabel}>{errors.city}</Text>
              )}
            </View>
          </View>

          {/* DISTRICT + TEHSIL */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                label="DISTRICT (OPTIONAL)"
                value={form.district}
                onChangeText={text => handleChange('district', text)}
                placeholder="District"
              />

              {errors.district && (
                <Text style={styles.errorLabel}>
                  {errors.district}
                </Text>
              )}
            </View>

            <View style={{ width: 12 }} />

            <View style={{ flex: 1 }}>
              <Input
                label="TEHSIL (OPTIONAL)"
                value={form.tehsil}
                onChangeText={text => handleChange('tehsil', text)}
                placeholder="Tehsil"
              />

              {errors.tehsil && (
                <Text style={styles.errorLabel}>
                  {errors.tehsil}
                </Text>
              )}
            </View>
          </View>

          {/* PINCODE */}

          <Input
            label="PIN CODE (OPTIONAL)"
            value={form.pincode}
            keyboardType="number-pad"
            maxLength={6}
            onChangeText={t =>
              handleChange('pincode', t.replace(/[^0-9]/g, '').slice(0, 6))
            }
            placeholder="6-digit pin code"
          />

          {errors.pincode && (
            <Text style={styles.errorLabel}>{errors.pincode}</Text>
          )}
        </FormCard>

        {/* IDENTITY */}

        <FormCard>
          <Text style={styles.cardTitle}>Identity</Text>

          <Input
            label="AADHAAR NUMBER (OPTIONAL)"
            value={form.aadhaar}
            keyboardType="number-pad"
            maxLength={14}
            onChangeText={t => handleChange('aadhaar', formatAadhaar(t))}
            placeholder="XXXX XXXX XXXX"
          />

          {errors.aadhaar && (
            <Text style={styles.errorLabel}>{errors.aadhaar}</Text>
          )}

          <Input
            label="ABHA NUMBER (OPTIONAL)"
            value={form.abha}
            keyboardType="number-pad"
            maxLength={14}
            onChangeText={t =>
              handleChange('abha', t.replace(/[^0-9]/g, '').slice(0, 14))
            }
            placeholder="14-digit ABHA number"
          />

          {errors.abha && <Text style={styles.errorLabel}>{errors.abha}</Text>}
        </FormCard>

        {/* API ERROR */}

        {/* {errors.api && (
          <Text
            style={[
              styles.errorLabel,
              {
                marginHorizontal: 16,
                marginTop: 5,
              },
            ]}
          >
            {errors.api}
          </Text>
        )} */}
      </KeyboardAwareScrollView>

      {/* BUTTON */}

      <View style={styles.buttonWrap}>
        <Button
          title={loading ? 'Creating Profile...' : 'Complete Profile'}
          onPress={handleCompleteProfile}
          disabled={loading}
        />
      </View>

      {/* STATE MODAL */}
      {showState && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setShowState(false)}
          />

          <View style={styles.modalContainer}>
            <View style={styles.dragBar} />

            <ScrollView showsVerticalScrollIndicator={false}>
              {states.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.modalItem}
                  onPress={() => {
                    handleChange('state', item.name);
                    handleChange('stateId', item.id);
                    handleChange('city', '');
                    handleChange('cityId', '');
                    setShowState(false);
                  }}
                >
                  <Text style={styles.modalText}>{item.name}</Text>

                  {form.stateId === item.id && (
                    <Feather name="check" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* CITY MODAL */}
      {showCity && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setShowCity(false)}
          />

          <View style={styles.modalContainer}>
            <View style={styles.dragBar} />

            <ScrollView showsVerticalScrollIndicator={false}>
              {cities.map(item => (
                <TouchableOpacity
                  key={`${item.name}-${item.id}`}
                  style={styles.modalItem}
                  onPress={() => {
                    handleChange('city', item.name);
                    handleChange('cityId', item.id);
                    setShowCity(false);
                  }}
                >
                  <Text style={styles.modalText}>{item.name}</Text>

                  {form.city === item.name && (
                    <Feather name="check" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* SUCCESS */}
      {showSuccess && (
        <View style={styles.centerModalOverlay}>
          <View style={styles.centerModalContainer}>
            <View style={styles.iconWrap}>
              <Feather name="check-circle" size={70} color="#22C55E" />
            </View>

            <Text style={styles.successTitle}>Profile Created</Text>

            <Text style={styles.successDesc}>
              Your profile has been successfully created. You can now continue
              to the app.
            </Text>

            <Button
              title="Continue"
              containerStyle={{
                width: '100%',
              }}
              onPress={() => {
                setShowSuccess(false);

                if (existingAccount) {
                  dispatch(clearFamilyMemberFlow());
                }

                dispatch(setProfileComplete());
              }}
            />
          </View>
        </View>
      )}

      {/* ERROR MODAL */}
      {showError && (
        <View style={styles.centerModalOverlay}>
          <View style={styles.centerModalContainer}>
            <View style={styles.iconWrap}>
              <Feather
                name="alert-circle"
                size={70}
                color="#EF4444"
              />
            </View>

            <Text style={styles.errorTitle}>
              Unable to Create Profile
            </Text>

            <Text style={styles.errorDesc}>
              {errorMessage}
            </Text>

            <Button
              title="OK"
              containerStyle={{
                width: '100%',
              }}
              onPress={() => {
                setShowError(false);
                setErrorMessage('');
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

/*
 * ------------------------------------------
 * DOB CONVERTER
 * ------------------------------------------
 *
 * UI:
 * DD/MM/YYYY
 *
 * API:
 * YYYY-MM-DD
 */

const convertDobToApiFormat = dob => {
  if (!dob) {
    return undefined;
  }

  const parts = dob.split('/');

  if (parts.length !== 3) {
    return undefined;
  }

  const [day, month, year] = parts;

  return `${year}-${month}-${day}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  backButton: {
  width: 40,
  height: 40,
  borderRadius: 12,
  backgroundColor: 'rgba(255,255,255,0.15)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.25)',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 16,
},

  title: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: '#fff',
  },

  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.white,
    marginTop: 4,
  },

  progress: {
    flexDirection: 'row',
    marginTop: 22,
  },

  bar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E6EBF5',
    borderRadius: 10,
    marginRight: 6,
  },

  active: {
    backgroundColor: colors.darkPrimary,
  },

  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  row: {
    flexDirection: 'row',
    marginTop: 8,
  },

  buttonWrap: {
    paddingHorizontal: 16,
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
  },

  errorLabel: {
    color: colors.error,
    fontSize: 12,
    marginTop: 0,
    fontFamily: fonts.medium,
    marginBottom: 6,
    fontWeight: '600',
  },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },

  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    paddingTop: 10,
    maxHeight: '65%',
  },

  dragBar: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 10,
  },

  modalItem: {
    padding: 16,
    borderBottomWidth: 0.5,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  modalText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: '#000',
  },

  centerModalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  centerModalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },

  iconWrap: {
    marginBottom: 16,
  },

  successTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },

  successDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },

  errorTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },

  errorDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
});
