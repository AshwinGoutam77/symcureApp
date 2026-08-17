/* eslint-disable react-native/no-inline-styles */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Linking,
  ActivityIndicator,
  Platform,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { colors, fonts } from '../../theme';
import Button from '../../components/common/Button';
import { useDoctorDetailQuery } from '../../hooks/queries/useDoctorQueries';

const DoctorDetailScreen = ({ navigation, route }) => {
  const { t } = useTranslation();

  const doctorId = route?.params?.doctorId;

  const [selected, setSelected] = useState(null);

  /*
   * ==========================================
   * DOCTOR DETAIL API
   * ==========================================
   */

  const { data, isLoading, isFetching, isError } =
    useDoctorDetailQuery(doctorId);

  /*
   * API response:
   *
   * {
   *   doctor: {
   *      doctor_id,
   *      name,
   *      initials,
   *      specialization,
   *      qualifications,
   *      experience_years,
   *      languages: [],
   *      bio,
   *      clinic: {},
   *      consultation_options: {}
   *   }
   * }
   */

  const doctor = data?.data?.doctor;
  console.log(data);

  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (isLoading || isFetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />

        <Text style={styles.loadingText}>Loading doctor...</Text>
      </View>
    );
  }

  /*
   * ==========================================
   * ERROR
   * ==========================================
   */

  if (isError || !doctor) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="user-x" size={40} color={colors.primary} />

        <Text style={styles.errorTitle}>Doctor not found</Text>

        <Text style={styles.errorText}>
          This doctor is currently unavailable.
        </Text>

        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /*
   * ==========================================
   * CONSULTATION OPTIONS
   * ==========================================
   */

  const clinicOption = doctor?.consultation_options?.clinic;

  const onlineOption = doctor?.consultation_options?.online;

  /*
   * Select first available option
   */

  const getDefaultOption = () => {
    if (onlineOption?.available) {
      return 'video';
    }

    if (clinicOption?.available) {
      return 'clinic';
    }

    return null;
  };

  const currentSelected = selected || getDefaultOption();

  /*
   * ==========================================
   * LOCATION
   * ==========================================
   */

  const clinic = doctor?.clinic;

  const locationText = [clinic?.area, clinic?.city_name, clinic?.state_name]
    .filter(Boolean)
    .join(', ');

  const languages = doctor?.languages?.length
    ? doctor.languages.join(', ')
    : 'Not specified';

  const openLocation = () => {
    const query = [
      clinic?.name,
      clinic?.address,
      clinic?.area,
      clinic?.city_name,
      clinic?.state_name,
      clinic?.pincode,
    ]
      .filter(Boolean)
      .join(', ');

    if (!query) {
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      query,
    )}`;

    Linking.openURL(url);
  };

  const handleBookAppointment = () => {
    if (!currentSelected) {
      return;
    }

    navigation.navigate('SelectSlotScreen', {
      doctorId: doctor?.doctor_id,
      selected: currentSelected,
      doctorDetail: doctor,
      doctor,
    });
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={
          doctor?.profile_photo_url
            ? { uri: doctor.profile_photo_url }
            : require('../../assets/images/doctor.jpg')
        }
        style={styles.header}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.2)', '#0F478C']}
          style={styles.overlay}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.back}
          >
            <Feather name="arrow-left" size={20} color="#060D1F" />
          </TouchableOpacity>

          <View style={styles.centerContent}>
            {/* STATUS */}

            <View style={styles.onlineBadgeTop}>
              <Text style={styles.onlineText}>
                {doctor?.is_bookable ? t('onlineNow') : 'Currently unavailable'}
              </Text>
            </View>

            {/* NAME */}

            <Text style={styles.name}>{doctor?.name || 'Doctor'}</Text>

            {/* SPECIALIZATION */}

            <Text style={styles.sub}>
              {!!doctor?.qualification_specializations && `${doctor.qualification_specializations}`} 
              {doctor.qualifications ? ',' : ''} {doctor.qualifications}
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>

      {/* ======================================
          CONTENT
      ====================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        {/* ====================================
            ABOUT
        ==================================== */}

        <View style={styles.card}>
          {!!doctor?.bio && <Text style={styles.desc}>{doctor.bio}</Text>}

          {!doctor?.bio && (
            <Text style={styles.desc}>
              {doctor?.name} is a qualified{' '}
              {doctor?.specialization || 'medical specialist'}
              {doctor?.experience_years
                ? ` with ${doctor.experience_years}+ years of experience.`
                : '.'}
            </Text>
          )}

          <View style={styles.divider} />

          <View style={styles.infoGrid}>
            {/* LANGUAGES */}

            <InfoBox title={t('speaks')} value={languages} />

            {/* LOCATION */}

            <InfoBox
              title={t('location')}
              value={locationText || clinic?.address || 'Location unavailable'}
              onPress={
                locationText || clinic?.address ? openLocation : undefined
              }
            />
          </View>
        </View>

        {/* ====================================
            CONSULTATION OPTIONS
        ==================================== */}

        <View style={styles.card}>
          <Text style={styles.title}>Consultation Options</Text>

          {/* VIDEO */}

          {onlineOption?.available && (
            <OptionCard
              type="video"
              selected={currentSelected === 'video'}
              onPress={() => setSelected('video')}
              title={t('videoConsultation')}
              subtitle={t('videoSubtitle')}
              price={
                onlineOption?.fee !== null && onlineOption?.fee !== undefined
                  ? `₹${onlineOption.fee}`
                  : 'Price unavailable'
              }
            />
          )}

          {/* CLINIC */}

          {clinicOption?.available && (
            <OptionCard
              type="clinic"
              selected={currentSelected === 'clinic'}
              onPress={() => setSelected('clinic')}
              title="Clinic Consultation"
              subtitle={locationText}
              price={
                clinicOption?.fee !== null && clinicOption?.fee !== undefined
                  ? `₹${clinicOption.fee}`
                  : 'Price unavailable'
              }
            />
          )}

          {/* NO OPTION */}

          {!onlineOption?.available && !clinicOption?.available && (
            <View style={styles.noOption}>
              <Feather name="calendar" size={20} color="#7A879E" />

              <Text style={styles.noOptionText}>
                No consultation options are currently available.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ======================================
          BOOK BUTTON
      ====================================== */}

      <View style={styles.cta}>
        <Button
          title={doctor?.is_bookable ? 'Book Appointment' : 'Not Available'}
          disabled={!doctor?.is_bookable || !currentSelected}
          onPress={handleBookAppointment}
        />
      </View>
    </View>
  );
};

export default DoctorDetailScreen;

/* ==========================================
   INFO BOX
========================================== */

const InfoBox = ({ title, value, onPress }) => (
  <TouchableOpacity
    style={styles.infoBox}
    activeOpacity={onPress ? 0.7 : 1}
    disabled={!onPress}
    onPress={onPress}
  >
    <Text style={styles.infoTitle}>{title}</Text>

    <Text style={styles.infoValue} numberOfLines={3}>
      {value}
    </Text>
  </TouchableOpacity>
);

/* ==========================================
   OPTION CARD
========================================== */

const OptionCard = ({ selected, onPress, title, subtitle, price, type }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={[styles.option, selected && styles.optionActive]}
  >
    {/* LEFT CONTENT */}
    <View style={styles.optionContent}>
      <Feather
        name={type === 'video' ? 'camera' : 'map-pin'}
        size={18}
        color={selected ? colors.darkPrimary : '#7A8A9A'}
        style={styles.optionIcon}
      />

      <View style={styles.optionTextContainer}>
        <Text style={styles.optionTitle} numberOfLines={1}>
          {title}
        </Text>

        {!!subtitle && (
          <Text style={styles.optionSub} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>

    {/* PRICE */}
    <Text style={styles.price}>{price}</Text>
  </TouchableOpacity>
);

/* ==========================================
   STYLES
   YOUR EXISTING DESIGN
========================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },

  header: {
    height: 300,
    justifyContent: 'flex-end',
  },

  overlay: {
    flex: 1,
    padding: Platform.OS === 'ios'? 0: 16,
    justifyContent: 'flex-end',
  },

  centerContent: {
    alignItems: 'center',
    marginBottom: 10,
  },

  onlineBadgeTop: {
    backgroundColor: '#DFF5E8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },

  name: {
    color: '#fff',
    fontFamily: fonts.bold,
    fontSize: 24,
  },

  sub: {
    color: '#ffffffff',
    fontSize: 13,
    marginTop: Platform.OS === 'ios' ? 4: 0,
    paddingBottom: Platform.OS !== 'ios'? 0 : 16,
    textAlign: 'center',
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 12,
  },

  back: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ffffffcc',
    justifyContent: 'center',
    alignItems: 'center',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4DA3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#fff',
    fontFamily: fonts.semiBold,
    fontSize: 18,
  },

  docInfo: {
    borderBottomWidth: 1,
    borderBottomColor: '#ffffffff',
    paddingBottom: 12,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },

  onlineBadge: {
    backgroundColor: '#DFF5E8',
    paddingHorizontal: 10,
    borderRadius: 10,
    marginRight: 8,
  },

  onlineText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '800',
  },

  mrn: {
    color: '#ffffffff',
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },

  stat: {
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb91',
    paddingRight: 18,
  },

  statValue: {
    color: '#fff',
    fontFamily: fonts.semiBold,
    fontSize: 16,
  },

  statLabel: {
    color: '#ffffffff',
    fontSize: 12,
    fontFamily: fonts.semiBold,
    marginTop: 4,
  },

  card: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },

  title: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: '#000000',
  },

  desc: {
    color: '#151515ff',
    lineHeight: 20,
    fontFamily: fonts.semiBold,
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },

  infoGrid: {
    flexDirection: 'row',
    gap: 10,
  },

  infoBox: {
    flex: 1,
    backgroundColor: '#F4F6F8',
    padding: 10,
    borderRadius: 10,
  },

  infoTitle: {
    fontSize: 12,
    color: '#000000',
    fontFamily: fonts.semiBold,
  },

  infoValue: {
    fontFamily: fonts.semiBold,
    marginTop: 2,
  },

  option: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    borderRadius: 14,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  optionActive: {
    borderColor: colors.darkPrimary,
    backgroundColor: '#EAF2FF',
  },

  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  optionTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  optionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: '#000000',
  },

  optionSub: {
    fontSize: 12,
    color: '#000000',
    marginTop: 1,
  },

  optionIcon: {
    marginRight: 8,
  },

  price: {
    fontFamily: fonts.semiBold,
    color: colors.darkPrimary,
    marginLeft: 10,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  link: {
    color: colors.darkPrimary,
    fontWeight: '600',
    fontSize: 12,
  },

  review: {
    backgroundColor: '#F4F6F8',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },

  reviewName: {
    fontFamily: fonts.semiBold,
  },

  reviewText: {
    color: '#6B7280',
    marginTop: 4,
  },

  reviewTime: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 6,
  },

  cta: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
  },

  ctaText: {
    color: '#fff',
    fontFamily: fonts.semiBold,
    fontSize: 16,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F4F6F8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    color: '#7A879E',
    fontSize: 14,
  },

  errorContainer: {
    flex: 1,
    backgroundColor: '#F4F6F8',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  errorTitle: {
    marginTop: 14,
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: '#111827',
  },

  errorText: {
    marginTop: 6,
    fontSize: 14,
    color: '#7A879E',
    textAlign: 'center',
  },

  errorButton: {
    marginTop: 20,
    backgroundColor: colors.darkPrimary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },

  errorButtonText: {
    color: '#fff',
    fontFamily: fonts.semiBold,
  },

  noOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    padding: 12,
    backgroundColor: '#F4F6F8',
    borderRadius: 12,
  },

  noOptionText: {
    flex: 1,
    marginLeft: 10,
    color: '#7A879E',
    fontSize: 13,
  },
});
