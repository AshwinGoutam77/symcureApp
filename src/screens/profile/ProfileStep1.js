/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { colors, fonts } from '../../theme';
import Button from '../../components/common/Button';
import FormCard from '../../components/common/FormCard';
import Input from '../../components/common/Input';
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DatePicker from 'react-native-date-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';

export default function ProfileStep1({navigation, route}) {
  const scrollRef = useRef(null);
const {
  existingAccount: routeExistingAccount = false,
  patientAccountId = null,
} = route?.params || {};

const {
  familyMemberFlow,
  familyMemberPhone,
} = useSelector(state => state.auth);

const existingAccount =
  routeExistingAccount || familyMemberFlow;

const initialPhone =
  route?.params?.phone ||
  familyMemberPhone ||
  '';


const [form, setForm] = useState({
  fullName: '',
  dob: '',
  gender: '',
  guardianType:'',
  guardianName:'',
  email: '',
  relationship: '',
  emergencyName: '',
  phone: initialPhone,
  emergencyPhone: '',
});

useEffect(() => {
  const loadPhone = async () => {
    // Family member flow should use the phone
    // entered on the OTP screen
    if (familyMemberFlow && familyMemberPhone) {
      setForm(prev => ({
        ...prev,
        phone: familyMemberPhone,
      }));

      return;
    }

    // Normal onboarding flow
    if (route?.params?.phone) {
      setForm(prev => ({
        ...prev,
        phone: route.params.phone,
      }));

      return;
    }

    try {
      const savedPhone =
        await AsyncStorage.getItem('registration_phone');

      if (savedPhone) {
        setForm(prev => ({
          ...prev,
          phone: savedPhone,
        }));
      }
    } catch (error) {
      console.log('LOAD PHONE ERROR:', error);
    }
  };

  loadPhone();
}, [
  familyMemberFlow,
  familyMemberPhone,
  route?.params?.phone,
]);

  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showRelationshipModal, setShowRelationshipModal] = useState(false);
  const [showGuardianTypeModal, setShowGuardianTypeModal] = useState(false);

  const genderOptions = ['Male', 'Female', 'Other'];

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

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validate = () => {
    let newErrors = {};

    if (!form.fullName.trim()) {
      scrollRef.current?.scrollToPosition(0, 0, true);
      newErrors.fullName = 'Full name is required';
    }

    if (!form.dob) {
      scrollRef.current?.scrollToPosition(0, 180, true);
      newErrors.dob = 'Date of birth is required';
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(form.dob)) {
      newErrors.dob = 'Format should be DD/MM/YYYY';
    }

    if (!form.gender) {
      scrollRef.current?.scrollToPosition(0, 180, true);
      newErrors.gender = 'Gender is required';
    }

    if (existingAccount && !form.relationship) {
      newErrors.relationship = 'Relationship is required';
    }

    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = 'Invalid email';
    }

    // if (!form.emergencyName.trim()) {
    //   newErrors.emergencyName = 'Emergency name is required';
    // }

    if (!form.phone) {
      newErrors.phone = 'Phone is required';
    } else if (!/^[6-9]\d{9}$/.test(form.phone)) {
      newErrors.phone = 'Enter valid 10-digit number';
    }

    if (form.emergencyPhone && !/^[6-9]\d{9}$/.test(form.emergencyPhone)) {
      newErrors.emergencyPhone = 'Enter valid 10-digit number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) {
      return;
    }

    navigation.navigate('ProfileStep2', {
      form,
      existingAccount,
      patientAccountId,
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={colors.gradient}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Your Profile</Text>
          <Text style={styles.subtitle}>Step 1 of 2 — Basic Information</Text>

          <View style={styles.progress}>
            <View style={[styles.bar, styles.active]} />
            <View style={styles.bar} />
            {/* <View style={styles.bar} /> */}
          </View>
        </View>
      </LinearGradient>

      <KeyboardAwareScrollView
      ref={scrollRef}
        enableOnAndroid
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* <TouchableOpacity
          style={styles.infoBox}
          onPress={() => navigation.navigate('Login')}>
          <Text>
            Already have an account? <Text style={styles.link}>Sign in</Text>
          </Text>
        </TouchableOpacity> */}

        <FormCard>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Basic Information</Text>
          </View>

          <Input
            label="FULL NAME"
            placeholder="Full name"
            value={form.fullName}
            onChangeText={text => handleChange('fullName', text)}
            required
          />
          {errors.fullName && (
            <Text style={styles.errorLabel}>{errors.fullName}</Text>
          )}

          <Input
            keyboardType="number-pad"
            maxLength={10}
            label="PHONE NUMBER"
            placeholder="10-digit number"
            value={form.phone}
            editable={false}
            disabled={true}
            onChangeText={text =>
              handleChange('phone', text.replace(/[^0-9]/g, '').slice(0, 10))
            }
            required
          />
          {errors.phone && (
            <Text style={styles.errorLabel}>{errors.phone}</Text>
          )}

          {existingAccount && (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setShowRelationshipModal(true)}
            >
              <View pointerEvents="none">
                <Input
                  label="RELATIONSHIP"
                  value={
                    relationshipOptions.find(x => x.value === form.relationship)
                      ?.label || ''
                  }
                  placeholder="Select Relationship"
                  editable={false}
            required
                />

                {errors.relationship && (
                  <Text style={styles.errorLabel}>{errors.relationship}</Text>
                )}
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <TouchableOpacity activeOpacity={1} onPress={() => setOpen(true)}>
                <View pointerEvents="none">
                  <Input
                    label="DATE OF BIRTH"
                    value={form.dob}
                    placeholder="DD/MM/YYYY"
                    editable={false}
            required
                  />
                </View>
              </TouchableOpacity>

              {errors.dob && (
                <Text style={styles.errorLabel}>{errors.dob}</Text>
              )}
            </View>

            <View style={{ width: 12 }} />

            <View style={{ flex: 1 }}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => { Keyboard.dismiss(); setShowGenderModal(true)}}
              >
                <View pointerEvents="none">
                  <Input
                    label="GENDER"
                    value={form.gender}
                    placeholder="Select"
                    editable={false}
            required
                  />
                </View>
              </TouchableOpacity>

              {errors.gender && (
                <Text style={styles.errorLabel}>{errors.gender}</Text>
              )}
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
            label="EMAIL (OPTIONAL)"
            value={form.email}
            onChangeText={text => handleChange('email', text)}
            placeholder="you@example.com"
          />
          {errors.email && (
            <Text style={styles.errorLabel}>{errors.email}</Text>
          )}
        </FormCard>

        <FormCard>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Emergency Contact</Text>
          </View>

          <View style={styles.phoneBox}>
            <Input
              label="EMERGENCY CONTACT NUMBER (OPTIONAL)"
              value={form.emergencyPhone}
              onChangeText={text =>
                handleChange(
                  'emergencyPhone',
                  text.replace(/[^0-9]/g, '').slice(0, 10),
                )
              }
              placeholder="10-digit number"
            />
            {errors.emergencyPhone && (
              <Text style={styles.errorLabel}>{errors.emergencyPhone}</Text>
            )}
          </View>
        </FormCard>
      </KeyboardAwareScrollView>

      <View style={styles.buttonWrap}>
        <Button title="Continue" icon="arrow-right" onPress={handleContinue} />
      </View>

      <DatePicker
        modal
        open={open}
        date={date}
        mode="date"
        maximumDate={new Date()}
        onConfirm={selectedDate => {
          setOpen(false);
          setDate(selectedDate);

          const day = String(selectedDate.getDate()).padStart(2, '0');
          const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
          const year = selectedDate.getFullYear();

          handleChange('dob', `${day}/${month}/${year}`);
        }}
        onCancel={() => setOpen(false)}
      />

      {showGenderModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setShowGenderModal(false)}
          />

          <View style={styles.modalContainer}>
            <View style={styles.dragBar} />

            {genderOptions.map(item => (
              <TouchableOpacity
                key={item}
                style={styles.modalItem}
                onPress={() => {
                  handleChange('gender', item?.value);
                  setShowGenderModal(false);
                }}
              >
                <Text style={styles.modalText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {showGenderModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setShowGenderModal(false)}
          />

          <View style={styles.modalContainer}>
            <View style={styles.dragBar} />

            <Text
              style={[
                styles.modalText,
                {
                  fontFamily: fonts.semiBold,
                  marginBottom: 4,
                  paddingHorizontal: 20,
                },
              ]}
            >
              Select Gender
            </Text>

            {genderOptions.map(item => (
              <TouchableOpacity
                key={item}
                style={styles.modalItem}
                onPress={() => {
                  handleChange('gender', item);
                  setShowGenderModal(false);
                }}
              >
                <Text style={styles.modalText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {showRelationshipModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setShowRelationshipModal(false)}
          />

          <View style={styles.modalContainer}>
            <View style={styles.dragBar} />

            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                handleChange('relationship', '');
                setShowRelationshipModal(false);
              }}
            >
              <Text style={styles.modalText}>Select Relationship</Text>
            </TouchableOpacity>

            {relationshipOptions.map(item => (
              <TouchableOpacity
                key={item.value}
                style={styles.modalItem}
                onPress={() => {
                  handleChange('relationship', item.value);
                  setShowRelationshipModal(false);
                }}
              >
                <Text style={styles.modalText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {showGuardianTypeModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setShowGuardianTypeModal(false)}
          />

          <View style={styles.modalContainer}>
            <View style={styles.dragBar} />

            <Text
              style={[
                styles.modalText,
                {
                  fontFamily: fonts.semiBold,
                  marginBottom: 4,
                  paddingHorizontal: 20,
                },
              ]}
            >
              Select Guardian Type
            </Text>

            {guardianTypeOptions.map(item => (
              <TouchableOpacity
                key={item.value}
                style={styles.modalItem}
                onPress={() => {
                  handleChange('guardianType', item.value);
                  setShowGuardianTypeModal(false);
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text style={styles.modalText}>{item.label}</Text>

                  {form.guardianType === item.value && (
                    <Text
                      style={{
                        color: colors.primary,
                        fontFamily: fonts.bold,
                        fontSize: 18,
                      }}
                    >
                      ✓
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },

  header: {
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: '#ffffffff',
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

  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 20,
    padding: 16,
    elevation: 1,
  },

  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 20,
  },

  label: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: '#7A879E',
    marginBottom: 6,
    marginTop: 10,
  },

  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E6EBF5',
    justifyContent: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#F9FAFC',
  },

  infoBox: {
    backgroundColor: '#E6EBF5',
    padding: 12,
    borderRadius: 5,
    marginTop: 14,
    marginHorizontal: 16,
  },

  link: {
    color: colors.darkPrimary,
    fontFamily: fonts.bold,
    fontSize: 14,
    fontWeight: 'bold',
  },

  inputText: {
    fontFamily: fonts.medium,
    color: '#060D1F',
  },

  placeholder: {
    color: '#A0AEC0',
    fontFamily: fonts.medium,
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
    fontFamily: fonts.medium,
    marginBottom: 12,
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
  },

  modalText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: '#000000',
    paddingHorizontal: 10,
  },
});
