/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */

import React, { useEffect, useRef, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import ConfettiCannon from 'react-native-confetti-cannon';
import LottieView from 'lottie-react-native';

import { colors, fonts } from '../../theme';
import Button from '../../components/common/Button';
import { useTranslation } from 'react-i18next';

function InfoRow({ icon, label, value }) {
  if (!value) {
    return null;
  }

  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Feather name={icon} size={16} color={colors.darkPrimary} />
      </View>

      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>

        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function BookingSuccessScreen({ navigation, route }) {
  const { appointment, dataShare } = route?.params || {};

  const { t } = useTranslation();

  const scale = useRef(new Animated.Value(0)).current;

  const opacity = useRef(new Animated.Value(0)).current;

  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),

      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowConfetti(false);
    }, 4000);

    return () => clearTimeout(timeout);
  }, []);

  const doctor = appointment?.doctor;
  const doctorName = doctor?.name || 'Doctor';
  const specialization = (doctor?.qualification_specializations || 'Specialist') + ', ' + doctor.qualifications;

  const initials =
    doctor?.initials ||
    doctorName
      ?.split(' ')
      .filter(Boolean)
      .map(item => item.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase() ||
    'DR';

  const appointmentDate = appointment?.date;
  const appointmentTime = appointment?.slot_text;
  const consultType = appointment?.consult_type;
  const tokenNumber = appointment?.token_number;
  const appointmentCode = appointment?.appointment_code;
  const amount = appointment?.amount;
  const paymentMode = appointment?.payment_mode;
  const paymentStatus = appointment?.payment_status;
  const clinic = appointment?.clinic;

  const formatAppointmentDate = dateString => {
    if (!dateString) {
      return '';
    }

    const [year, month, day] = dateString.split('-').map(Number);

    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatPaymentMode = value => {
    if (!value) {
      return '';
    }

    if (value === 'cash') {
      return 'Pay at Clinic';
    }

    if (value === 'online') {
      return 'Online Payment';
    }

    return value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  };

  const formatPaymentStatus = value => {
    if (!value) {
      return '';
    }

    if (value === 'pending') {
      return 'Payment Pending';
    }

    if (value === 'not_required') {
      return 'No Payment Required';
    }

    if (value === 'paid') {
      return 'Paid';
    }

    return value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  };

  const isClinic = consultType === 'offline';

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* CONFETTI */}
        {showConfetti && (
          <ConfettiCannon
            count={80}
            origin={{
              x: 200,
              y: 0,
            }}
            fadeOut
            explosionSpeed={350}
            fallSpeed={2500}
          />
        )}
        {/* SUCCESS ANIMATION */}
        <LottieView
          source={require('../../assets/animations/Success.json')}
          autoPlay
          loop={false}
          style={styles.lottie}
        />

        <Text style={styles.title}>
          {t('bookingConfirmed') || 'Booking Confirmed'}
        </Text>

        <Text style={styles.subtitle}>
          Your appointment has been successfully booked.
        </Text>

        {/* MAIN CARD */}

        <View style={styles.card}>
          {/* DOCTOR */}

          <View style={styles.doctorRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>

            <View style={styles.doctorInfo}>
              <Text style={styles.docName}>{doctorName}</Text>

              <Text style={styles.docMeta}>{specialization}</Text>
            </View>

            {/* CONFIRMED BADGE */}

            {/* <View style={styles.confirmedBadge}>
              <Feather name="check" size={13} color="#16A34A" />

              <Text style={styles.confirmedText}>Confirmed</Text>
            </View> */}
          </View>

          <View style={styles.divider} />

          {/* TOKEN */}
          {tokenNumber && (
            <View style={styles.tokenBox}>
              <View>
                <Text style={styles.tokenLabel}>Your Token</Text>
                <Text style={styles.tokenValue}>{tokenNumber}</Text>
              </View>

              <View style={styles.tokenIcon}>
                <Feather name="hash" size={22} color={colors.darkPrimary} />
              </View>
            </View>
          )}
          <View style={styles.divider} />

          {/* APPOINTMENT */}

          <InfoRow
            icon="calendar"
            label="Date"
            value={formatAppointmentDate(appointmentDate)}
          />

          <InfoRow
            icon="clock"
            label="Time"
            value={appointmentTime ? appointmentTime : ''}
          />

          <InfoRow
            icon={isClinic ? 'map-pin' : 'video'}
            label="Consultation"
            value={isClinic ? 'Clinic Visit' : 'Video Consultation'}
          />

          {/* CLINIC */}

          {isClinic && (
            <>
              <InfoRow
                icon="home"
                label="Clinic"
                value={clinic?.name || doctor?.clinic_name}
              />

              <InfoRow
                icon="navigation"
                label="Address"
                value={clinic?.address}
              />
            </>
          )}
        </View>

        {/* BOOKING DETAILS */}

        <View style={styles.bookingCard}>
          <View style={styles.bookingItem}>
            <Text style={styles.bookingLabel}>Booking ID</Text>

            <Text style={styles.bookingValue}>
              {appointmentCode || `#${appointment?.appointment_id}`}
            </Text>
          </View>

         {amount && <View style={styles.bookingItem}>
            <Text style={styles.bookingLabel}>Amount</Text>

            <Text style={styles.bookingValue}>₹{amount ?? 0}</Text>
          </View>}

          <View style={styles.bookingItem}>
            <Text style={styles.bookingLabel}>Payment</Text>

            <Text
              style={[
                styles.bookingValue,
                {
                  color: paymentMode === 'cash' ? '#D97706' : '#16A34A',
                },
              ]}
            >
              {formatPaymentMode(paymentMode)}
            </Text>
          </View>

          {paymentStatus && (
            <View style={styles.bookingItem}>
              <Text style={styles.bookingLabel}>Status</Text>

              <Text style={styles.bookingValue}>
                {formatPaymentStatus(paymentStatus)}
              </Text>
            </View>
          )}
        </View>

        {/* DATA SHARE */}
        {dataShare?.granted && (
          <View style={styles.shareBox}>
            <View style={styles.shareIcon}>
              <Feather name="shield" size={17} color="#16A34A" />
            </View>

            <View
              style={{
                flex: 1,
              }}
            >
              <Text style={styles.shareTitle}>Medical Records Shared</Text>

              <Text style={styles.shareText}>
                Your selected medical records were securely shared with the
                doctor.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ACTIONS */}

      <View style={styles.actions}>
        <Button
          title={t('viewAppointments') || 'View Appointments'}
          containerStyle={{
            width: '100%',
          }}
          onPress={() =>
            navigation.replace('MainTabs', {
              screen: 'Appointments',
            })
          }
        />

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.replace('MainTabs')}
        >
          <Text style={styles.secondaryText}>
            {t('backToHome') || 'Back to Home'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FD',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    alignItems: 'center',
    paddingTop: 175,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  lottie: {
    position: 'absolute',
    width: 210,
    height: 210,
    top: 5,
    zIndex: 1,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
    zIndex: 2,
  },

  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 18,
    zIndex: 2,
  },

  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    marginBottom: 12,
    shadowRadius: 8,
  },

  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  avatarText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 15,
  },

  doctorInfo: {
    flex: 1,
  },

  docName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },

  docMeta: {
    marginTop: 1,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },

  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF3',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
  },

  confirmedText: {
    marginLeft: 4,
    fontFamily: fonts.semiBold,
    fontSize: 10,
    color: '#16A34A',
  },

  divider: {
    backgroundColor: '#E8EDF3',
    marginVertical: 10,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EEF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 2,
  },

  infoValue: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },

  tokenBox: {
    marginTop: 2,
    backgroundColor: '#EEF4FF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  tokenLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#64748B',
  },

  tokenValue: {
    marginTop: 2,
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.darkPrimary,
  },

  tokenIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCE8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* BOOKING DETAILS */

  bookingCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 12,
    shadowRadius: 6,
  },

  bookingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },

  bookingLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#64748B',
  },

  bookingValue: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.textPrimary,
    maxWidth: '60%',
    textAlign: 'right',
  },

  /* DATA SHARE */

  shareBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF3',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },

  shareIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  shareTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: '#166534',
    marginBottom: 2,
  },

  shareText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#15803D',
    lineHeight: 16,
  },

  /* ACTIONS */

  actions: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    backgroundColor: '#F4F7FD',
  },

  secondaryBtn: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: colors.darkPrimary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#FFFFFF',
  },

  secondaryText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.darkPrimary,
  },
});
