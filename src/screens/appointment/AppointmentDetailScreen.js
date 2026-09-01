/* eslint-disable no-catch-shadow */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Modal,
  TextInput,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { colors, fonts } from '../../theme';
import { launchImageLibrary } from 'react-native-image-picker';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import {
  useAppointmentDetail,
  useCancelAppointment,
  useReports,
  useUploadReport,
} from '../../hooks/queries/useAppoitmentQueries';
import CancelAppointmentModal from '../../components/CancelAppointmentModal';
import { useFocusEffect } from '@react-navigation/native';

const AppointmentDetailScreen = ({ navigation, route }) => {
  const { appointmentId } = route?.params || {};

  const { t } = useTranslation();
  const [renameModal, setRenameModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(13 * 60 + 38);
  const [uploadError, setUploadError] = useState('');
  const [showUploadError, setShowUploadError] = useState(false);
  const [reason, setReason] = useState('');

  const reasons = [
    'Not available at this time',
    'Booked by mistake',
    'Doctor changed',
    'Feeling better',
    'Other',
  ];

  const cancelAppointment = useCancelAppointment();

  const handleCancelAppointment = async () => {
    if (!appointment?.appointment_id) {
      return;
    }

    try {
      await cancelAppointment.mutateAsync({
        appointmentId: appointment.appointment_id,
        reason: '',
      });

      setShowCancelModal(false);

      navigation.goBack();
    } catch (error) {
      console.log('CANCEL ERROR:', error?.response?.data || error);
    }
  };

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft]);

  const SHOW_UPDATE_CARD = [
    'upcoming',
    'doctor_delayed',
    'doctor_unavailable',
    'doctor_cancelled',
    'patient_cancelled',
    'doctor_rescheduled',
    'patient_rescheduled',
    'reschedule_requested', // ADD THIS
    'patient_no_show',
    'doctor_no_show',
    'clinic_closed',
    'refund_processing',
    'refund_completed',
    'completed',
  ];

  const {
    data: appointmentResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useAppointmentDetail(appointmentId);

  const appointment = appointmentResponse?.appointment;
  // console.log('====================================');
  // console.log(appointment);
  // console.log('====================================');

  useFocusEffect(
    useCallback(() => {
      if (appointmentId) {
        refetch();
      }
    }, [appointmentId, refetch]),
  );

  const {
    data: reportsResponse,
    isLoading: reportsLoading,
    isFetching: reportsFetching,
  } = useReports({
    page: 1,
    limit: 50,
  });

  const reports = reportsResponse?.data || [];

  const appointmentReports = reports.filter(
    report =>
      String(report.appointment_id) === String(appointment?.appointment_id),
  );

  const uploadReport = useUploadReport();

  const uploadFile = async () => {
    if (!selectedFile || !appointment?.appointment_id) {
      return;
    }

    try {
      const extension = selectedFile.fileName?.split('.').pop() || '';

      const finalFileName = `${fileName || 'Report'}.${extension}`;

      const formData = new FormData();

      formData.append('file', {
        uri: selectedFile.uri,
        type: selectedFile.type || 'application/octet-stream',
        name: finalFileName,
      });

      formData.append('report_name', fileName || 'Report');

      formData.append('appointment_id', String(appointment.appointment_id));

      await uploadReport.mutateAsync(formData);

      // Success
      setRenameModal(false);
      setSelectedFile(null);
      setFileName('');
    } catch (error) {
      console.log('UPLOAD REPORT ERROR:', error?.response?.data || error);

      const apiError = error?.response?.data?.error || error?.response?.data;

      const message =
        apiError?.message ||
        error?.message ||
        'Unable to upload report. Please try again.';

      setUploadError(message);
      setShowUploadError(true);
    }
  };

  const handleUpload = () => {
    launchImageLibrary(
      {
        mediaType: 'mixed',
      },
      response => {
        if (response.didCancel || !response.assets?.length) {
          return;
        }

        const file = response.assets[0];

        setSelectedFile(file);

        const name = file.fileName?.replace(/\.[^/.]+$/, '') || 'Document';

        setFileName(name);

        setRenameModal(true);
      },
    );
  };

  const isClinic = appointment?.consult_type === 'offline';
  const isVideo = appointment?.consult_type === 'online';

  const isScheduled = appointment?.status === 'scheduled';

  const canCancel = appointment?.can_cancel === true;
  const canReschedule = appointment?.can_reschedule === true;

  const formatAppointmentDate = date => {
    if (!date) {
      return '—';
    }

    const [year, month, day] = date.split('-');

    const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

    return parsedDate.toLocaleDateString('en-IN', {
      // weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const appointmentDate = formatAppointmentDate(appointment?.date);

  const formatTime = (dateTime) => {
    if (!dateTime) return '';

    return new Date(dateTime.replace(' ', 'T')).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const startTime = formatTime(appointment?.start_at);
  const endTime = formatTime(appointment?.end_at);

  const timeRange = `${startTime} - ${endTime}`;

  const consultationType = isClinic ? 'Clinic' : 'Video';

  const paymentText =
    appointment?.payment_mode === 'free'
      ? 'Free'
      : appointment?.amount !== null && appointment?.amount !== undefined
        ? `₹${appointment.amount}`
        : '—';

  const STATUS_BADGES = {
    scheduled: {
      text: 'Scheduled',
      bg: '#DFF5E8',
      color: '#16A34A',
    },

    upcoming: {
      text: 'Upcoming',
      bg: '#DFF5E8',
      color: '#16A34A',
    },

    doctor_delayed: {
      text: 'Delayed',
      bg: '#FEF3C7',
      color: '#D97706',
    },

    doctor_unavailable: {
      text: 'Unavailable',
      bg: '#FEE2E2',
      color: '#DC2626',
    },

    doctor_cancelled: {
      text: 'Cancelled',
      bg: '#FEE2E2',
      color: '#DC2626',
    },

    patient_cancelled: {
      text: 'Cancelled',
      bg: '#FEE2E2',
      color: '#DC2626',
    },

    doctor_rescheduled: {
      text: 'Rescheduled',
      bg: '#E0F2FE',
      color: '#0284C7',
    },

    patient_rescheduled: {
      text: 'Rescheduled',
      bg: '#E0F2FE',
      color: '#0284C7',
    },

    reschedule_requested: {
      text: 'Reschedule',
      bg: '#FEF3C7',
      color: '#D97706',
    },

    patient_no_show: {
      text: 'No Show',
      bg: '#FFF7ED',
      color: '#EA580C',
    },

    doctor_no_show: {
      text: 'Doctor Missed',
      bg: '#FEE2E2',
      color: '#DC2626',
    },

    clinic_closed: {
      text: 'Clinic Closed',
      bg: '#F3F4F6',
      color: '#374151',
    },

    refund_processing: {
      text: 'Refund',
      bg: '#FEF3C7',
      color: '#D97706',
    },

    refund_completed: {
      text: 'Refunded',
      bg: '#ECFDF3',
      color: '#16A34A',
    },

    completed: {
      text: 'Completed',
      bg: '#DBEAFE',
      color: '#2563EB',
    },
  };

  const badge = STATUS_BADGES[appointment?.status] || {
    text: appointment?.status || 'Unknown',
    bg: '#F3F4F6',
    color: '#64748B',
  };

  const APPOINTMENT_STATUS = {
    upcoming: {
      type: 'info',
      icon: 'check-circle',
      title: 'Appointment Confirmed',
      description: 'Your appointment has been confirmed.',
      details: [],
      primaryButton: null,
      secondaryButton: {
        title: 'Reschedule',
        action: 'reschedule',
      },
    },

    doctor_delayed: {
      type: 'warning',
      icon: 'clock',
      title: 'Doctor Running Late',
      description: 'Your doctor is running behind schedule.',
      details: [
        { label: 'Estimated Delay', value: '20 Minutes' },
        { label: 'Patients Ahead', value: '2' },
      ],
      primaryButton: null,
      secondaryButton: {
        title: 'Contact Clinic',
        action: 'call',
      },
    },

    doctor_unavailable: {
      type: 'error',
      icon: 'alert-circle',
      title: 'Doctor Unavailable',
      description: 'The doctor is unavailable due to an emergency.',
      details: [],
      primaryButton: {
        title: 'Choose Another Time',
        action: 'reschedule',
      },
      secondaryButton: {
        title: 'Request Refund',
        action: 'refund',
      },
    },

    doctor_cancelled: {
      type: 'error',
      icon: 'x-circle',
      title: 'Appointment Cancelled',
      description: 'Your doctor cancelled this appointment.',
      details: [],
      primaryButton: {
        title: 'Book Again',
        action: 'book',
      },
      secondaryButton: {
        title: 'Request Refund',
        action: 'refund',
      },
    },

    patient_cancelled: {
      type: 'success',
      icon: 'slash',
      title: 'Appointment Cancelled',
      description: 'You cancelled this appointment successfully.',
      details: [],
      primaryButton: {
        title: 'Book Again',
        action: 'book',
      },
      secondaryButton: null,
    },

    patient_rescheduled: {
      type: 'success',
      icon: 'calendar',
      title: 'Appointment Updated',
      description: 'Your appointment has been successfully rescheduled.',
      details: [{ label: 'New Appointment', value: '25 Jul • 11:30 AM' }],
      primaryButton: {
        title: 'View Appointment',
        action: 'view',
      },
      secondaryButton: null,
    },

    patient_no_show: {
      type: 'warning',
      icon: 'user-x',
      title: 'Appointment Missed',
      description: 'You did not attend this appointment.',
      details: [],
      primaryButton: {
        title: 'Book Again',
        action: 'book',
      },
      secondaryButton: null,
    },

    doctor_no_show: {
      type: 'error',
      icon: 'user-x',
      title: 'Doctor Missed Appointment',
      description: 'The doctor could not attend your appointment.',
      details: [],
      primaryButton: {
        title: 'Reschedule',
        action: 'reschedule',
      },
      secondaryButton: {
        title: 'Request Refund',
        action: 'refund',
      },
    },

    clinic_closed: {
      type: 'warning',
      icon: 'home',
      title: 'Clinic Closed',
      description: 'The clinic is closed due to a holiday or maintenance.',
      details: [
        { label: 'Previous Appointment', value: '24 Jul • 3:00 PM' },
        { label: 'Next Available', value: '25 Jul • 10:00 AM' },
      ],
      primaryButton: {
        title: 'Book Another Day',
        action: 'book',
      },
      secondaryButton: {
        title: 'Request Refund',
        action: 'refund',
      },
    },

    refund_processing: {
      type: 'warning',
      icon: 'loader',
      title: 'Refund Processing',
      description:
        'Your refund request has been received and is being processed.',
      details: [{ label: 'Expected Time', value: '5–7 Business Days' }],
      primaryButton: {
        title: 'Track Refund',
        action: 'refund_status',
      },
      secondaryButton: null,
    },

    refund_completed: {
      type: 'success',
      icon: 'check-circle',
      title: 'Refund Completed',
      description:
        'The refund has been credited to your original payment method.',
      details: [],
      primaryButton: {
        title: 'Book Again',
        action: 'book',
      },
      secondaryButton: null,
    },

    completed: {
      type: 'success',
      icon: 'check-circle',
      title: 'Consultation Completed',
      description: 'Your consultation has been completed successfully.',
      details: [],
      primaryButton: {
        title: 'View Prescription',
        action: 'prescription',
      },
      secondaryButton: {
        title: 'Book Follow-up',
        action: 'followup',
      },
    },

    reschedule_requested: {
      type: 'warning',
      icon: 'calendar',
      title: 'Reschedule',
      description: 'Your doctor has requested to change the appointment time.',
      details: [],
      primaryButton: null,
      secondaryButton: null,
    },
  };

  const AppointmentUpdateCard = ({ status }) => {
    const item = APPOINTMENT_STATUS[status];

    if (!item) {
      return null;
    }

    const theme = {
      info: {
        bg: '#EEF4FF',
        color: '#2563EB',
      },
      warning: {
        bg: '#FFF7ED',
        color: '#F59E0B',
      },
      error: {
        bg: '#FEF2F2',
        color: '#EF4444',
      },
      success: {
        bg: '#ECFDF3',
        color: '#16A34A',
      },
    };

    const current = theme[item.type];

    return (
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: 18,
          marginBottom: 16,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            backgroundColor: current.bg,
            padding: 18,
            flexDirection: 'row',
          }}
        >
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: current.color,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Feather name={item.icon} size={22} color="#fff" />
          </View>

          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: '#0F172A',
              }}
            >
              {item.title}
            </Text>

            <Text
              style={{
                marginTop: 5,
                color: '#475569',
                lineHeight: 21,
              }}
            >
              {item.description}
            </Text>
          </View>
        </View>

        {/* <View style={{padding: 18}}>
          {item.details.map((row, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}>
              <Text
                style={{
                  color: '#64748B',
                }}>
                {row.label}
              </Text>

              <Text
                style={{
                  fontWeight: '700',
                }}>
                {row.value}
              </Text>
            </View>
          ))}

          {item.primaryButton && (
            <TouchableOpacity
              style={{
                height: 48,
                borderRadius: 12,
                backgroundColor: current.color,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: item.details.length ? 10 : 0,
              }}>
              <Text
                style={{
                  color: '#fff',
                  fontWeight: '700',
                }}>
                {item.primaryButton.title}
              </Text>
            </TouchableOpacity>
          )}

          {item.secondaryButton && (
            <TouchableOpacity
              style={{
                marginTop: 16,
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: current.color,
                  fontWeight: '700',
                }}>
                {item.secondaryButton.title}
              </Text>
            </TouchableOpacity>
          )}
        </View> */}
      </View>
    );
  };

  if (isLoading || isFetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.darkPrimary} />
        <Text style={styles.loadingText}>Loading appointments...</Text>
      </View>
    );
  }

  if (error || !appointment) {
    return (
      <View style={styles.loadingContainer}>
        <Feather name="alert-circle" size={30} color="#EF4444" />

        <Text style={styles.loadingText}>Unable to load appointment.</Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.navigate('Appointments')}
        >
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={colors.gradient}>
        <View style={styles.header}>
          <View style={[styles.row, { gap: 0 }]}>
            <TouchableOpacity
              onPress={() => navigation.navigate('MainTabs', {
                screen: 'Appointments',
              })}
              style={styles.back}
            >
              <Feather name="arrow-left" size={18} color="#060D1F" />
            </TouchableOpacity>

            <View>
              <Text style={styles.headerTitle}>Appointment</Text>
              <Text style={styles.bookingId}>
                Booking ID: {appointment?.appointment_code}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.badge,
              {
                backgroundColor: badge.bg,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color: badge.color,
                },
              ]}
            >
              {badge.text}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          {/* DOCTOR CARD */}
          <View style={styles.card}>
            <View style={styles.doctorTop}>
              <View style={styles.row}>
                <View style={styles.avatar}>
                  {appointment?.doctor?.profile_photo_url ? (
                    <Image
                      source={{
                        uri: appointment.doctor.profile_photo_url,
                      }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Text style={styles.avatarText}>
                      {appointment?.doctor?.name
                        ?.split(' ')
                        ?.map(word => word[0])
                        ?.slice(0, 2)
                        ?.join('')
                        ?.toUpperCase() || 'DR'}
                    </Text>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>
                    {appointment?.doctor?.name || 'Doctor'}
                  </Text>

                  <Text style={styles.sub}>
                    {appointment?.doctor?.qualification_specializations || appointment?.doctor?.specialization || ""},{' '}
                    {appointment?.doctor?.qualifications}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* APPOINTMENT INFORMATION */}

            <View style={styles.infoGrid}>
              {/* DATE */}
              <View style={styles.gridItem}>
                <Feather name="calendar" size={18} color={colors.primary} />

                <Text style={styles.gridLabel}>Date</Text>

                <Text style={styles.gridValue}>{appointmentDate}</Text>
              </View>

              {/* TIME */}
              <View style={styles.gridItem}>
                <Feather name="clock" size={18} color={colors.primary} />

                <Text style={styles.gridLabel}>Time</Text>

                <Text
                  style={[styles.gridValue, styles.timeValue]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                >
                  {timeRange}
                </Text>
              </View>

              {/* CONSULTATION */}
              <View style={styles.gridItem}>
                <Feather
                  name={isClinic ? 'map-pin' : 'video'}
                  size={18}
                  color={isClinic ? colors.primary : colors.success}
                />

                <Text style={styles.gridLabel}>Consultation</Text>

                <Text style={styles.gridValue}>{consultationType}</Text>
              </View>

              {/* FEES */}
              {/* <View style={[styles.gridItem, styles.lastGridItem]}>
                <Feather name="credit-card" size={18} color="#2563EB" />

                <Text style={styles.gridLabel}>Fees</Text>

                <Text style={styles.gridValue}>
                  {appointment?.payment_mode === 'free'
                    ? 'Free'
                    : `₹${appointment?.amount ?? 0}`}
                </Text>
              </View> */}
            </View>

            {/* PAYMENT STATUS */}
            {appointment?.payment_mode !== 'free' && (
              <>
                {/* PAYMENT */}
               {appointment?.amount && <View style={styles.paymentStatusRow}>
                  <View style={styles.paymentStatusLeft}>
                    <Feather
                      name={
                        appointment?.payment_status === 'paid'
                          ? 'check-circle'
                          : 'clock'
                      }
                      size={16}
                      color={'#2563EB'}
                    />

                    <Text style={styles.paymentStatusLabel}>Payment</Text>
                  </View>

                  <Text style={styles.paymentAmount}>
                    ₹{appointment?.amount ?? 0}
                  </Text>

                  <View
                    style={[
                      styles.paymentBadge,
                      appointment?.payment_status === 'paid' || appointment?.payment_status === 'refunded'
                        ? styles.paymentPaid
                        : styles.paymentPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.paymentBadgeText,
                        appointment?.payment_status === 'paid' || appointment?.payment_status === 'refunded'
                          ? styles.paymentPaidText
                          : styles.paymentPendingText,
                      ]}
                    >
                      {appointment?.payment_status}
                    </Text>
                  </View>
                </View>}

                {/* PAYMENT MODE */}
                <View style={styles.paymentStatusRow}>
                  <View style={styles.paymentStatusLeft}>
                    <Feather name="credit-card" size={16} color="#2563EB" />

                    <Text style={styles.paymentStatusLabel}>Payment Mode</Text>
                  </View>

                  <Text style={styles.paymentModeText}>
                    {appointment?.payment_mode === 'cash'
                      ? `${appointment?.payment_status == 'paid' ? 'Paid' : 'Pay'} at Clinic`
                      : appointment?.payment_mode
                        ?.replace(/_/g, ' ')
                        ?.replace(/\b\w/g, char => char.toUpperCase())}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* CLINIC APPOINTMENT */}
          {isClinic && isScheduled && (
            <View style={styles.timerCard}>
              <View style={styles.clinicHeader}>
                <View style={styles.clinicBadge}>
                  <Feather name="map-pin" size={14} color="#fff" />
                </View>

                <Text style={styles.timerLabel}>Clinic Appointment</Text>
              </View>

              {/* TOKEN */}

              {appointment?.token_number && (
                <Text style={styles.tokenTitle}>
                  Token #{appointment.token_number}
                </Text>
              )}

              {/* DATE + TIME */}

              <Text style={styles.clinicTime}>
                {appointmentDate}
              </Text>

              {/* CLINIC NAME */}

              {appointment?.clinic?.name && (
                <Text style={styles.clinicName}>{appointment.clinic.name}</Text>
              )}

              {/* ADDRESS */}

              {appointment?.clinic?.address && (
                <Text style={styles.arriveText}>
                  {appointment.clinic.address}
                </Text>
              )}

              {/* DIRECTIONS */}

              {appointment?.clinic?.address && (
                <TouchableOpacity
                  style={styles.joinBtn}
                  onPress={() => {
                    const query = encodeURIComponent(
                      appointment.clinic.address,
                    );

                    Linking.openURL(
                      `https://www.google.com/maps/search/?api=1&query=${query}`,
                    );
                  }}
                >
                  <Feather name="navigation" size={16} color={colors.success} />

                  <Text style={styles.joinText}>Get Directions</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* VIDEO APPOINTMENT */}
          {isVideo && isScheduled && (
            <View style={styles.timerCard}>
              <Text style={styles.timerLabel}>{t('consultationStartsIn')}</Text>

              <Text style={styles.timer}>
                {appointment?.start_at
                  ? appointment.start_at.split(' ')[1]?.slice(0, 5)
                  : '—'}
              </Text>

              <TouchableOpacity
                style={styles.joinBtn}
                onPress={() =>
                  navigation.navigate('JoinConsultationScreen', {
                    appointmentId: appointment.appointment_id,
                  })
                }
              >
                <Feather name="video" size={16} color={colors.success} />

                <Text style={styles.joinText}>
                  {t('joinVideoConsultation')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STATUS UPDATE */}
          {appointment?.status !== 'scheduled' &&
            SHOW_UPDATE_CARD.includes(appointment?.status) && (
              <AppointmentUpdateCard status={appointment.status} />
            )}

          {/* COMPLETED */}
          {/* {appointment?.status === 'completed' && (
            <ConsultationResultCard navigation={navigation} />
          )} */}

          {/* Cancelled */}
          {appointment?.status === 'cancelled' && (
            <BookingCancelledCard navigation={navigation} />
          )}

          {/* REASON FOR VISIT */}
          {appointment?.reason_for_visit && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Reason for Visit</Text>

              <Text style={[styles.sub, { marginTop: 8 }]}>
                {appointment.reason_for_visit}
              </Text>
            </View>
          )}

          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>{t('reportsFiles')}</Text>

              {appointment?.status === 'scheduled' && (
                <TouchableOpacity
                  style={styles.uploadBtn}
                  onPress={handleUpload}
                >
                  <Text style={styles.uploadText}>+ {t('upload')}</Text>
                </TouchableOpacity>
              )}
            </View>

            {reportsLoading || reportsFetching ? (
              <View style={styles.reportLoading}>
                <Feather name="loader" size={20} color={colors.darkPrimary} />

                <Text style={styles.reportLoadingText}>Loading reports...</Text>
              </View>
            ) : appointmentReports.length === 0 ? (
              <View style={styles.emptyReports}>
                <Feather name="file-text" size={28} color="#94A3B8" />

                <Text style={styles.emptyReportsTitle}>
                  No reports and files
                </Text>

                {appointment?.status !== 'cancelled' && (
                  <Text style={styles.emptyReportsText}>
                    Upload a medical report for this appointment.
                  </Text>
                )}
              </View>
            ) : (
              appointmentReports.map(report => (
                <FileItem key={report.report_id} report={report} t={t} />
              ))
            )}
          </View>
        </ScrollView>
      </View>

      <Modal
        visible={renameModal}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => setRenameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.renameModal}>
            <Text style={styles.renameTitle}>Rename File</Text>

            <Text style={styles.renameLabel}>File Name</Text>

            <TextInput
              value={fileName}
              onChangeText={setFileName}
              style={styles.renameInput}
              placeholder="Enter file name"
              placeholderTextColor="#94A3B8"
              autoFocus
              selectionColor={colors.primary}
            />

            <View style={styles.renameActions}>
              <TouchableOpacity
                style={[
                  styles.uploadActionBtn,
                  uploadReport.isPending && { opacity: 0.6 },
                ]}
                onPress={uploadFile}
                disabled={uploadReport.isPending}
              >
                {uploadReport.isPending ? (
                  <Text style={styles.uploadActionText}>Uploading...</Text>
                ) : (
                  <Text style={styles.uploadActionText}>Upload</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {(canCancel || canReschedule) && (
        <View style={styles.bottomBar}>
          {canCancel && (
            <TouchableOpacity
              style={[styles.secondaryAction, !canReschedule && { flex: 1 }]}
              onPress={() => setShowCancelModal(true)}
            >
              <Text style={styles.secondaryActionText}>Cancel</Text>
            </TouchableOpacity>
          )}

          {canReschedule && (
            <TouchableOpacity
              style={[styles.primaryAction, !canCancel && { flex: 1 }]}
              onPress={() => {
                navigation.navigate('RescheduleAppointmentScreen', {
                  appointmentId: appointment.appointment_id,
                  doctorId: appointment.doctor.doctor_id,
                  date: appointment.date,
                  consultType: appointment.consult_type,
                  doctor: appointment.doctor,
                });
              }}
            >
              <Text style={styles.primaryActionText}>Reschedule</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {appointment?.status === 'completed' && appointment.prescription_id && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.primaryAction, !canCancel && { flex: 1 }]}
            onPress={() =>
              navigation.navigate('PrescriptionDetail', {
                prescriptionId: appointment.prescription_id,
                doctorId: appointment.doctor.doctor_id
              })
            }
          >
            <Text style={styles.primaryActionText}>View Prescription</Text>
          </TouchableOpacity>
        </View>
      )}

      <CancelAppointmentModal
        visible={showCancelModal}
        reason={reason}
        reasons={reasons}
        isPending={cancelAppointment.isPending}
        onClose={() => setShowCancelModal(false)}
        onSelectReason={setReason}
        onConfirm={handleCancelAppointment}
        hasBottomBar={false}
      />
    </View>
  );
};

const BookingCancelledCard = () => {
  return (
    <View style={styles.card}>
      <View style={styles.resultHeader}>
        <View style={styles.cancelledIcon}>
          <Feather name="x-circle" size={22} color="#DC2626" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.resultTitle}>Booking Cancelled</Text>

          <Text style={styles.resultSub}>
            This appointment has been cancelled.
          </Text>
        </View>
      </View>
    </View>
  );
};

const FileItem = ({ report, t }) => {
  const fileName = report.report_name || 'Medical Report';

  const createdDate = report.created_at
    ? new Date(report.created_at).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    : '';

  return (
    <View style={styles.fileItem}>
      <View style={{ flex: 1 }}>
        <View style={styles.reportNameRow}>
          <View style={styles.reportIcon}>
            <Feather name="file-text" size={17} color={colors.darkPrimary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.fileName} numberOfLines={1}>
              {fileName}
            </Text>

            <Text style={styles.fileSize}>
              {report.uploaded_by_role === 'doctor'
                ? `Uploaded by ${report.doctor_name || 'Doctor'}`
                : 'Uploaded by You'}
              {createdDate ? ` · ${createdDate}` : ''}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.viewBtn}
        onPress={() => {
          if (report.file_url) {
            Linking.openURL(report.file_url);
          }
        }}
      >
        <Text style={styles.viewText}>{t('view')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AppointmentDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
    paddingBottom: 150,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingHorizontal: 16,
    paddingBottom: 20,
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
    color: colors.white,
  },

  bookingId: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.white,
  },

  content: {
    padding: 16,
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  badgeText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    textTransform: 'capitalize'
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#fff',
    fontFamily: fonts.bold,
    fontSize: 16,
  },

  name: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },

  sub: {
    color: colors.textSecondary,
    marginTop: 1,
    fontSize: 13,
  },

  cancelledIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  infoLabel: {
    color: colors.textPrimary,
    fontSize: 14,
  },

  infoValue: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },

  warningBox: {
    backgroundColor: '#FFEDED',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ff2d5354',
  },

  warningText: {
    color: colors.error,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },

  timerCard: {
    backgroundColor: colors.success,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },

  timerLabel: {
    color: '#CFF0D6',
    fontSize: 12,
    fontWeight: '600',
  },

  timer: {
    color: '#fff',
    fontSize: 40,
    fontFamily: fonts.bold,
    marginVertical: 5,
  },

  joinBtn: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  joinText: {
    color: colors.success,
    fontFamily: fonts.bold,
  },

  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },

  uploadBtn: {
    backgroundColor: '#E6F0FF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
  },

  uploadText: {
    color: colors.darkPrimary,
    fontWeight: '600',
  },

  fileItem: {
    backgroundColor: '#F4F6F8',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  fileName: {
    fontWeight: '600',
    color: colors.textPrimary,
  },

  fileSize: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },

  viewBtn: {
    backgroundColor: '#E6F0FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },

  viewText: {
    color: colors.darkPrimary,
    fontWeight: '600',
  },

  footer: {
    textAlign: 'center',
    color: '#7A8A9A',
    fontSize: 12,
    marginTop: 10,
  },
  clinicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  clinicBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  tokenTitle: {
    color: '#fff',
    fontSize: 22,
    fontFamily: fonts.bold,
    marginBottom: 2,
  },

  clinicTime: {
    color: '#EAF8ED',
    fontSize: 13,
    fontFamily: fonts.bold,
  },

  clinicName: {
    color: '#fff',
    fontSize: 13,
    fontFamily: fonts.bold,
    // marginTop: 4,
    // marginBottom: 18,
  },

  arriveText: {
    color: '#EAF8ED',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 14,
    paddingHorizontal: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },

  renameModal: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
  },

  renameTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },

  renameLabel: {
    marginTop: 20,
    marginBottom: 8,
    // color: colors.black,
    fontFamily: fonts.medium,
  },

  input: {
    flex: 1,
    fontFamily: fonts.medium,
    color: '#000000ff',
  },

  renameInput: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,

    paddingHorizontal: 16,
    fontSize: 15,

    color: colors.textPrimary,
    fontFamily: fonts.medium,

    marginBottom: 20,
  },

  renameActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    // marginTop: 24,
  },

  cancelBtn: {
    paddingHorizontal: 18,
    justifyContent: 'center',
  },

  cancelText: {
    color: '#64748B',
    fontFamily: fonts.medium,
  },

  uploadActionBtn: {
    backgroundColor: colors.darkPrimary,
    paddingHorizontal: 20,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginLeft: 12,
  },

  uploadActionText: {
    color: '#fff',
    fontFamily: fonts.bold,
  },
  doctorTop: {
    marginBottom: 4,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  ratingText: {
    marginLeft: 6,
    color: '#64748B',
    fontSize: 12,
  },

  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  gridItem: {
    paddingVertical: 6,
    marginRight: 8,
  },

  lastGridItem: {
    marginRight: 0,
  },

  gridLabel: {
    marginTop: 6,
    color: '#64748B',
    fontSize: 11,
  },

  gridValue: {
    marginTop: 3,
    fontFamily: fonts.bold,
    fontSize: 13,
    color: '#0F172A',
  },

  paymentStatusRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
    flexDirection: 'row',
    alignItems: 'center',
  },

  paymentStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  paymentStatusLabel: {
    marginLeft: 7,
    fontSize: 13,
    color: '#64748B',
    fontFamily: fonts.medium,
  },

  paymentBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },

  paymentPaid: {
    backgroundColor: '#DCFCE7',
  },

  paymentPending: {
    backgroundColor: '#FEF3C7',
  },

  paymentAmount: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    marginRight: 8,
  },

  paymentBadgeText: {
    fontSize: 10,
    fontFamily: fonts.semiBold,
    textTransform: 'capitalize',
  },

  paymentPaidText: {
    color: '#16A34A',
  },

  paymentPendingText: {
    color: '#D97706',
  },

  paymentModeText: {
    marginLeft: 8,
    fontSize: 12,
    fontFamily: fonts.bold,
  },

  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  bookingLabel: {
    color: '#64748B',
  },

  bookingValue: {
    fontFamily: fonts.bold,
    color: '#0F172A',
  },

  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  resultIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ECFDF3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  resultTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: '#0F172A',
  },

  resultSub: {
    marginTop: 3,
    color: '#64748B',
    fontSize: 13,
  },

  resultDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },

  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },

  resultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  resultLabel: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  primaryAction: {
    flex: 1,
    backgroundColor: colors.darkPrimary,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  secondaryAction: {
    flex: 1,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.darkPrimary,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryActionText: {
    color: '#fff',
    fontFamily: fonts.bold,
    fontSize: 15,
  },

  secondaryActionText: {
    color: colors.darkPrimary,
    fontFamily: fonts.bold,
    fontSize: 15,
  },

  rescheduleCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },

  rescheduleTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rescheduleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  rescheduleTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: '#0F172A',
  },

  rescheduleSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: '#64748B',
  },

  rescheduleDivider: {
    height: 1,
    backgroundColor: '#EEF2F7',
    marginVertical: 18,
  },

  slotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  slotOld: {
    flex: 1,
  },

  slotNew: {
    flex: 1,
    alignItems: 'flex-end',
  },

  slotLabel: {
    fontSize: 11,
    color: '#000000ff',
  },

  slotOldText: {
    marginTop: 6,
    fontSize: 14,
    color: '#000000ff',
    textDecorationLine: 'line-through',
  },

  slotNewText: {
    marginTop: 6,
    fontSize: 15,
    fontFamily: fonts.bold,
    color: '#2563EB',
  },

  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },

  acceptBtn: {
    height: 48,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    marginTop: 22,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  acceptText: {
    color: '#fff',
    fontFamily: fonts.bold,
    marginLeft: 8,
  },

  changeSlot: {
    marginTop: 16,
    textAlign: 'center',
    color: '#2563EB',
    fontFamily: fonts.bold,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6F8',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },

  reportLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 25,
  },

  reportLoadingText: {
    marginLeft: 8,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  emptyReports: {
    alignItems: 'center',
    paddingVertical: 28,
  },

  emptyReportsTitle: {
    marginTop: 10,
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },

  emptyReportsText: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  reportNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E6F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
});
