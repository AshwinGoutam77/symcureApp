/* eslint-disable react-native/no-inline-styles */

import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import { colors, fonts } from '../../theme';
import Button from '../../components/common/Button';
import { useTranslation } from 'react-i18next';

import { useBookAppointment } from '../../hooks/queries/useAppoitmentQueries';

import {
  useDoctorPaymentDetailQuery,
  useGrantDataShareMutation,
} from '../../hooks/queries/useDoctorQueries';

import { useQueryClient } from '@tanstack/react-query';

function RowItem({ label, value, bold, blue, green }) {
  return (
    <View style={styles.rowBetween}>
      <Text style={styles.label}>{label}</Text>

      <Text
        style={[
          styles.value,
          bold && { fontFamily: fonts.bold },
          blue && { color: colors.darkPrimary },
          green && { color: colors.secondary },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function PaymentOption({ selected, onPress, icon, title, subtitle }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.option, selected && styles.optionActive]}
    >
      <View style={[styles.iconBox, selected && styles.iconBoxActive]}>
        <MIcon
          name={icon}
          size={20}
          color={selected ? colors.darkPrimary : '#7A8A9A'}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.optionTitle}>{title}</Text>

        <Text style={styles.optionSub}>{subtitle}</Text>
      </View>

      <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
}

export default function PaymentScreen({ navigation, route }) {
  const queryClient = useQueryClient();

  const {
    doctorId,
    consultType,
    date,
    selectedSlot,
    reasonForVisit,
    notes,
    mode,
    time,
  } = route?.params || {};

  console.log('selectedSlot', selectedSlot);

  const { t } = useTranslation();
  const [method, setMethod] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [showConsentModal, setShowConsentModal] = useState(false);
  const { mutateAsync: bookAppointment, isPending: isBooking } =
    useBookAppointment();

  const {
    data: bookingContext,
    isLoading: bookingContextLoading,
    isFetching: bookingContextFetching,
    error: bookingContextError,
    refetch: refetchBookingContext,
  } = useDoctorPaymentDetailQuery(doctorId);

  const { mutateAsync: grantDataShare, isPending: isGrantingDataShare } =
    useGrantDataShareMutation();

  const doctor = bookingContext?.doctor;
  const payment = bookingContext?.payment;
  const dataShare = bookingContext?.data_share;
  const amount = payment?.amount ?? 0;
  const paymentMethods = payment?.methods || [];
  const defaultPaymentMethod = payment?.default || null;
  const shouldAskForConsent =
    dataShare?.needs_consent === true && dataShare?.already_granted === false;

  useEffect(() => {
    if (defaultPaymentMethod) {
      setMethod(defaultPaymentMethod);
    }
  }, [defaultPaymentMethod]);

  const formatDate = value => {
    if (!value) {
      return '--';
    }

    try {
      const [year, month, day] = value.split('-');

      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
      ).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch (error) {
      return value;
    }
  };

  const displayTime = selectedSlot?.label || '--';

  const handleShareAndContinue = async () => {
    try {
      await grantDataShare(doctorId);

      setShowConsentModal(false);

      // Continue booking
      await handlePayNow();
    } catch (error) {
      console.log('DATA SHARE ERROR:', error?.response?.data || error);

      const message =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to share medical records.';

      setBookingError(message);
      setShowErrorModal(true);
    }
  };

  const handlePayNow = async consentValue => {
    if (!doctorId) {
      setBookingError('Doctor information is missing.');

      setShowErrorModal(true);

      return;
    }

    if (!date) {
      setBookingError('Please select an appointment date.');

      setShowErrorModal(true);

      return;
    }

    if (!selectedSlot?.start) {
      setBookingError('Please select an appointment slot.');

      setShowErrorModal(true);

      return;
    }

    if (!selectedSlot?.end) {
      setBookingError('Please select a valid appointment slot.');

      setShowErrorModal(true);

      return;
    }

    try {
      const payload = {
        doctor_id: doctorId,

        consult_type: consultType || 'offline',

        date,

        slot_start: selectedSlot.start,

        slot_end: selectedSlot.end,
      };

      if (reasonForVisit) {
        payload.reason_for_visit = reasonForVisit;
      }

      if (notes) {
        payload.notes = notes;
      }

      /*
       * SEND CONSENT ONLY WHEN USER
       * ACTUALLY SELECTED SOMETHING
       */
      if (consentValue !== undefined) {
        payload.share_records = consentValue;
      }

      console.log('BOOKING PAYLOAD:', payload);

      const response = await bookAppointment(payload);

      /*
       * API LEVEL ERROR
       */
      if (!response?.success) {
        const message =
          response?.error?.message ||
          response?.message ||
          'Unable to complete your booking. Please try again.';

        setBookingError(message);

        setShowErrorModal(true);

        return;
      }

      /*
       * REFRESH APPOINTMENTS
       */
      await queryClient.invalidateQueries({
        queryKey: ['appointments'],
      });

      /*
       * REFRESH DASHBOARD
       */
      await queryClient.invalidateQueries({
        queryKey: ['dashboard'],
      });

      /*
       * NAVIGATE SUCCESS
       */
      navigation.replace('BookingSuccessScreen', {
        mode: 'clinic',

        appointment: response?.data?.appointment,

        dataShare: response?.data?.data_share,
      });
    } catch (error) {
      console.log('BOOKING ERROR:', error?.response?.data || error);

      const message =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.error?.message ||
        error?.message ||
        'Unable to complete your booking. Please try again.';

      setBookingError(message);

      setShowErrorModal(true);
    }
  };

  const handleBookPress = () => {
    if (shouldAskForConsent) {
      setShowConsentModal(true);

      return;
    }

    handlePayNow();
  };

  if (bookingContextLoading || bookingContextFetching) {
    return (
     <>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.back}
        >
          <Feather name="arrow-left" size={19} color="#060D1F" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {t('securePayment') || 'Confirm Booking'}
        </Text>
      </View>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading payment details...</Text>
      </View>
     </>
    );
  }

  if (bookingContextError || !bookingContext) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingErrorIcon}>
          <Feather name="alert-circle" size={30} color="#DC2626" />
        </View>

        <Text style={styles.loadingErrorTitle}>
          Unable to load booking details
        </Text>

        <Text style={styles.loadingErrorText}>Please try again.</Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetchBookingContext()}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.goBackButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.back}
        >
          <Feather name="arrow-left" size={19} color="#060D1F" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {t('securePayment') || 'Confirm Booking'}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: 150,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* BOOKING SUMMARY */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {t('bookingSummary') || 'Booking Summary'}
            </Text>

            {/* DOCTOR */}
            <View style={styles.row}>
              <View style={styles.avatar}>
                {doctor?.initials ? (
                  <Text style={styles.avatarText}>{doctor.initials}</Text>
                ) : (
                  <Feather name="user" size={21} color="#fff" />
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.docName}>{doctor?.name || 'Doctor'}</Text>

                <Text style={styles.docMeta}>
                  {doctor?.qualification_specializations || ''},{' '}
                  {doctor?.qualifications}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* CONSULTATION */}
            <RowItem label="Consultation" value="Clinic Visit" />

            {/* DATE */}
            <RowItem label="Date" value={formatDate(date)} />

            {/* TIME */}
            <RowItem label="Slot" value={displayTime} />

            {/* CLINIC */}
            <RowItem label="Clinic" value={doctor?.clinic?.name || '--'} />

            {/* FEE */}
            <RowItem label="Consultation Fee" value={`₹${amount}`} />

            <View style={styles.divider} />

            {/* TOTAL */}
            <RowItem label="Total" value={`₹${amount}`} bold blue />
          </View>

          {/* CLINIC DETAILS */}
          <View style={styles.clinicCard}>
            <View style={styles.clinicIcon}>
              <Feather name="map-pin" size={20} color={colors.darkPrimary} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.clinicTitle}>
                {doctor?.clinic?.name || 'Clinic'}
              </Text>

              <Text style={styles.clinicAddress}>
                {doctor?.clinic?.address || 'Clinic address unavailable'}
              </Text>
            </View>
          </View>

          {/* PAYMENT METHOD */}
          <Text style={styles.section}>
            {t('paymentMethod') || 'Payment Method'}
          </Text>

          {paymentMethods.includes('pay_at_clinic') && (
            <PaymentOption
              selected={method === 'pay_at_clinic'}
              onPress={() => setMethod('pay_at_clinic')}
              icon="cash"
              title="Pay at Clinic"
              subtitle="Pay the consultation fee at the clinic"
            />
          )}

          {/* PAYMENT INFO */}
          {/* <View style={styles.paymentInfo}>
            <View style={styles.paymentInfoIcon}>
              <Feather name="info" size={17} color="#2563EB" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.paymentInfoTitle}>Payment at Clinic</Text>

              <Text style={styles.paymentInfoText}>
                You will pay ₹{amount} at the clinic during your appointment.
              </Text>
            </View>
          </View> */}

          {/* DATA SHARE INFO */}
          {dataShare?.already_granted === true && (
            <View style={styles.sharedInfo}>
              <Feather name="check-circle" size={18} color="#16A34A" />

              <Text style={styles.sharedInfoText}>
                Your previous medical records have already been shared with this
                doctor.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* STICKY BOOK BUTTON */}
      <View style={styles.StickyBtn}>
        <View style={styles.stickySummary}>
          <View style={styles.stickyMethod}>
            <Feather name="credit-card" size={16} color="#000000ff" />

            <Text style={styles.stickyMethodText}>Pay at Clinic</Text>
          </View>
          <View>
            <Text style={styles.stickyLabel}>Total</Text>
            <Text style={styles.stickyAmount}>₹{amount}</Text>
          </View>
        </View>

        <Button
          title={isBooking ? 'Booking...' : 'Confirm Booking'}
          onPress={handleBookPress}
          disabled={
            isBooking || !method || !selectedSlot?.start || !selectedSlot?.end
          }
          containerStyle={{
            marginHorizontal: 16,
            marginTop: 8,
            marginBottom: 12,
            paddingVertical: 14,
          }}
        />
      </View>

      {/* BOOKING ERROR MODAL */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.errorModal}>
            <View style={styles.errorIcon}>
              <Feather name="alert-circle" size={30} color="#DC2626" />
            </View>

            <Text style={styles.errorTitle}>Booking Failed</Text>

            <Text style={styles.errorMessage}>{bookingError}</Text>

            <TouchableOpacity
              style={styles.errorButton}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.errorButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* DATA SHARE CONSENT MODAL */}
      <Modal
        transparent
        visible={showConsentModal}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setShowConsentModal(false)}
      >
        <View style={styles.consentOverlay}>
          <View style={styles.consentSheet}>
            <View style={styles.handle} />

            {/* ICON */}
            <View style={styles.consentIcon}>
              <Feather name="shield" size={24} color="#2563EB" />
            </View>

            <Text style={styles.consentTitle}>Share Medical Records?</Text>

            <Text style={styles.consentDescription}>
              Help your doctor understand your medical history by securely
              sharing your previous consultation records.
            </Text>

            <View style={styles.securityRow}>
              <View style={styles.lockCircle}>
                <Feather name="lock" size={18} color="#2563EB" />
              </View>

              <Text style={styles.securityText}>
                Only the doctor for this appointment will be able to access the
                records you choose to share.
              </Text>
            </View>

            {/* CONTINUE */}
            <Button
              title="Continue"
              onPress={handleShareAndContinue}
              containerStyle={{
                marginTop: 20,
              }}
            />

            {/* SKIP */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => {
                setShowConsentModal(false);

                handlePayNow(false);
              }}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FD',
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },

  back: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F4F7FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.textPrimary,
  },

  /* CONTENT */

  content: {
    padding: 16,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
  },

  cardTitle: {
    fontFamily: fonts.semiBold,
    marginBottom: 16,
    fontSize: 18,
    color: colors.textPrimary,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.darkPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: '#fff',
    fontFamily: fonts.bold,
    fontSize: 16,
  },

  docName: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
  },

  docMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
    fontFamily: fonts.medium,
  },

  divider: {
    height: 1,
    backgroundColor: '#E6EBF5',
    marginVertical: 14,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 9,
  },

  label: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: fonts.medium,
    flex: 1,
  },

  value: {
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    textAlign: 'right',
    maxWidth: '65%',
  },

  /* CLINIC */

  clinicCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  clinicIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EEF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  clinicTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },

  clinicAddress: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },

  /* PAYMENT */

  section: {
    marginTop: 20,
    marginBottom: 10,
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E6EBF5',
    marginBottom: 10,
    backgroundColor: '#fff',
  },

  optionActive: {
    borderColor: colors.darkPrimary,
    backgroundColor: '#EEF4FF',
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F3F5F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  iconBoxActive: {
    backgroundColor: '#DDE9FF',
  },

  optionTitle: {
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    fontSize: 15,
  },

  optionSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 17,
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  radioOuterActive: {
    borderColor: colors.darkPrimary,
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.darkPrimary,
  },

  /* PAYMENT INFO */

  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF4FF',
    borderRadius: 14,
    padding: 13,
    marginTop: 4,
  },

  paymentInfoIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DDE9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  paymentInfoTitle: {
    fontFamily: fonts.semiBold,
    color: '#1E3A8A',
    fontSize: 13,
  },

  paymentInfoText: {
    marginTop: 2,
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },

  /* ALREADY SHARED */

  sharedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF3',
    borderRadius: 14,
    padding: 13,
    marginTop: 12,
  },

  sharedInfoText: {
    flex: 1,
    marginLeft: 9,
    color: '#166534',
    fontSize: 12,
    lineHeight: 18,
  },

  /* STICKY */

  StickyBtn: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
    paddingBottom: 20,
  },

  stickySummary: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  stickyLabel: {
    fontSize: 11,
    fontFamily: fonts.medium,
  },

  stickyAmount: {
    fontSize: 20,
    color: colors.textPrimary,
    fontFamily: fonts.bold,
  },

  stickyMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  stickyMethodText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },

  /* LOADING */

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F7FD',
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: fonts.medium,
  },

  loadingErrorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  loadingErrorTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
  },

  loadingErrorText: {
    marginTop: 5,
    color: colors.textSecondary,
    fontSize: 14,
  },

  retryButton: {
    marginTop: 20,
    backgroundColor: colors.darkPrimary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },

  retryButtonText: {
    color: '#fff',
    fontFamily: fonts.semiBold,
  },

  goBackButton: {
    marginTop: 12,
    paddingVertical: 10,
  },

  goBackText: {
    color: colors.darkPrimary,
    fontFamily: fonts.semiBold,
  },

  /* ERROR MODAL */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  errorModal: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },

  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  errorTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: 'center',
  },

  errorMessage: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 22,
  },

  errorButton: {
    width: '100%',
    backgroundColor: colors.darkPrimary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },

  errorButtonText: {
    color: '#fff',
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },

  /* CONSENT */

  consentOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  consentSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 30,
  },

  handle: {
    width: 42,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 20,
  },

  consentIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#EEF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },

  consentTitle: {
    fontFamily: fonts.bold,
    fontSize: 21,
    color: colors.textPrimary,
    textAlign: 'center',
  },

  consentDescription: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 14,
    // lineHeight: 21,
    textAlign: 'center',
  },

  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 13,
    marginTop: 18,
  },

  lockCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  securityText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },

  skipButton: {
    alignItems: 'center',
    paddingVertical: 15,
  },

  skipText: {
    color: '#64748B',
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
});
