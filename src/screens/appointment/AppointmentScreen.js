/* eslint-disable no-catch-shadow */
/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { colors, fonts } from '../../theme';
import EmptyComponent from '../../components/EmptyComponent';
import { useTranslation } from 'react-i18next';
import {
  useAppointments,
  useCancelAppointment,
} from '../../hooks/queries/useAppoitmentQueries';
import CancelAppointmentModal from '../../components/CancelAppointmentModal';
import { useQueryClient } from '@tanstack/react-query';
import { DoctorAvatar } from '../../components/common/DoctorAvtar'

const TABS = ['Upcoming', 'Completed', 'Cancelled', 'All'];

function getStatusText(status) {
  switch (status) {
    case 'scheduled':
      return 'Scheduled';

    case 'reschedule_requested':
      return 'Reschedule';

    case 'completed':
      return 'Completed';

    case 'cancelled':
      return 'Cancelled';

    case 'no_show':
      return 'No Show';

    case 'no_show':
      return 'No Show';

    default:
      return 'Unknown';
  }
}

function getStatusStyle(status) {
  switch (status) {
    case 'scheduled':
      return {
        backgroundColor: '#EEF4FF',
        color: '#2563EB',
      };

    case 'reschedule_requested':
      return {
        backgroundColor: '#FFF4E5',
        color: '#D97706',
      };

    case 'completed':
      return {
        backgroundColor: '#E6F7EF',
        color: '#059669',
      };

    case 'cancelled':
      return {
        backgroundColor: '#FFE9E9',
        color: '#DC2626',
      };

    case 'no_show':
      return {
        backgroundColor: '#F3F0E0',
        color: '#8A7A24',
      };

    default:
      return {
        backgroundColor: '#EEF2F7',
        color: '#64748B',
      };
  }
}

function AppointmentCard({
  item,
  navigation,
  setSelectedAppointment,
  setShowCancelModal,
}) {
  const { t } = useTranslation();

  const doctor = item?.doctor;

  const isClinic = item?.consult_type === 'offline';
  const isOnline = item?.consult_type === 'online';

  const isUpcoming =
    item?.status === 'scheduled' || item?.status === 'reschedule_requested';

  const formatDate = date => {
    if (!date) {
      return '';
    }

    const d = new Date(`${date}T00:00:00`);

    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const initials =
    doctor?.name
      ?.split(' ')
      .filter(Boolean)
      .slice(-2)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase() || 'DR';

  const formatTime = (dateTime) => {
    if (!dateTime) return '';

    return new Date(dateTime.replace(' ', 'T')).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const startTime = formatTime(item?.start_at);
  const endTime = formatTime(item?.end_at);
  const timeRange = `${startTime} - ${endTime}`;

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('AppointmentDetailScreen', {
          appointmentId: item?.appointment_id,
        })
      }
      style={[
        styles.card,
        item?.status === 'scheduled' && styles.scheduledBorder,
        item?.status === 'reschedule_requested' &&
        styles.rescheduleBorder,
        item?.status === 'completed' &&
        styles.completedBorder,
        item?.status === 'cancelled' &&
        styles.cancelledBorder,
        item?.status === 'no_show' &&
        styles.noShowBorder,
      ]}
    >
      {/* HEADER */}
      <View style={styles.row}>
        {/* AVATAR */}
        {/* <View style={styles.avatar}>
          <Text style={styles.avatarText}><DoctorAvatar doctor={doctor}/></Text>
        </View> */}

        <DoctorAvatar doctor={doctor} />

        {/* DOCTOR INFO */}
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{doctor?.name || 'Doctor'}</Text>

          <View style={styles.row}>
            <Text style={styles.meta} numberOfLines={1}>
              {doctor?.qualification_specializations || doctor?.specialization || 'Specialist'},{' '}
              {doctor?.qualifications}
            </Text>
          </View>
        </View>


        {/* STATUS */}
        <View style={[styles.status, getStatusStyle(item?.status)]}>
          <Text style={styles.statusText}>{getStatusText(item?.status)}</Text>
        </View>
      </View>
      {/* DATE + TIME */}
      <View style={styles.timeRow}>
        <Feather name="clock" size={12} color="#000000ff" />

        <Text style={styles.time}>
          {formatDate(item?.date)}
          {timeRange ? ` · ${timeRange}` : ''}
        </Text>

        <View style={styles.dot} />

        <Feather
          name={isOnline ? 'video' : 'map-pin'}
          size={12}
          color={colors.darkPrimary}
        />

        <Text style={styles.type}>{isOnline ? 'Online' : 'Clinic'}</Text>
      </View>

      {/* UPCOMING */}
      {isUpcoming && (
        <>
          <View style={styles.actions}>
            {/* DETAILS */}
            <TouchableOpacity
              style={[styles.btnBase, styles.secondaryFull]}
              onPress={() =>
                navigation.navigate('AppointmentDetailScreen', {
                  appointmentId: item?.appointment_id,
                })
              }
            >
              <Text
                style={{
                  fontWeight: '700',
                  color: colors.textPrimary,
                }}
              >
                View Details
              </Text>
            </TouchableOpacity>

            {/* CANCEL */}
            {item?.can_cancel && (
              <TouchableOpacity
                style={[styles.btnBase, styles.cancelBtn]}
                onPress={() => {
                  setSelectedAppointment(item);
                  setShowCancelModal(true);
                }}
              >
                <Text
                  style={{
                    color: 'red',
                    fontWeight: '700',
                  }}
                >
                  {t('cancel')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* CLINIC TOKEN */}
          {isClinic && item?.token_number && (
            <View style={styles.clinicBox}>
              <Text style={styles.clinicText}>
                {item.token_number} Your token
              </Text>
            </View>
          )}
        </>
      )}

      {/* COMPLETED */}
      {item?.status === 'completed' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btnBase, styles.secondaryFull]}
            onPress={() =>
              navigation.navigate('AppointmentDetailScreen', {
                appointmentId: item?.appointment_id,
              })
            }
          >
            <Text
              style={{
                fontWeight: '700',
                color: colors.textPrimary,
              }}
            >
              View Details
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnBase, styles.primaryBtn, !item?.prescription_id && styles.disabledBtn]}
            disabled={!item?.prescription_id}
            onPress={() =>
              navigation.navigate('PrescriptionDetail', {
                prescriptionId: item?.prescription_id,
                doctorId: item.doctor.doctor_id
              })
            }
          >
            <Text
              style={[{
                color: !item?.prescription_id ? '#00000' : '#fff',
                fontWeight: '700',
              }]}
            >
              View Prescription
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* CANCELLED */}
      {(item?.status === 'cancelled' || item?.status === 'no_show') && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btnBase, styles.secondaryFull]}
            onPress={() =>
              navigation.navigate('AppointmentDetailScreen', {
                appointmentId: item?.appointment_id,
              })
            }
          >
            <Text
              style={{
                fontWeight: '700',
                color: colors.textPrimary,
              }}
            >
              View Details
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function AppointmentsScreen({ navigation }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [reason, setReason] = useState('');

  const reasons = [
    'Not available at this time',
    'Booked by mistake',
    'Doctor changed',
    'Feeling better',
    'Other',
  ];

  const statusParam =
    activeTab === 'Upcoming'
      ? 'upcoming'
      : activeTab === 'Completed'
        ? 'completed'
        : activeTab === 'Cancelled'
          ? 'cancelled'
          : 'all';

  const {
    data: appointmentsResponse,
    isLoading,
    isFetching,
    error,
  } = useAppointments({
    status: statusParam,
    page: 1,
    limit: 20,
  });

  const appointments = appointmentsResponse?.data || [];
  const cancelAppointment = useCancelAppointment();

  const handleCancelAppointment = async () => {
    if (!selectedAppointment?.appointment_id) {
      return;
    }

    try {
      await cancelAppointment.mutateAsync({
        appointmentId: selectedAppointment.appointment_id,
        reason: reason?.trim() || undefined,
      });

      await queryClient.invalidateQueries({
        queryKey: ['dashboard'],
      });

      setShowCancelModal(false);
      setSelectedAppointment(null);
      setReason('');
    } catch (error) {
      console.log('CANCEL ERROR:', error?.response?.data || error);

      // setCancelError(
      //   error?.response?.data?.message ||
      //     'Unable to cancel appointment. Please try again.',
      // );
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('MainTabs', {
              screen: 'Home',
            })
          }
          style={styles.back}
        >
          <Feather name="arrow-left" size={18} color="#060D1F" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Appointments</Text>
      </View>

      <View style={styles.content}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabs}>
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.tabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {isLoading || isFetching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.darkPrimary} />
            <Text style={styles.loadingText}>Loading appointments...</Text>
          </View>
        ) : appointments.length > 0 ? (
          <ScrollView
            contentContainerStyle={{ paddingBottom: 300 }}
            showsVerticalScrollIndicator={false}
          >
            {appointments.map(item => (
              <AppointmentCard
                key={item?.appointment_id}
                item={item}
                navigation={navigation}
                setSelectedAppointment={setSelectedAppointment}
                setShowCancelModal={setShowCancelModal}
                reason={reason}
                showCancelModal={showCancelModal}
                selectedAppointment={selectedAppointment}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={{ flex: 1, marginTop: 350 }}>
            <EmptyComponent
              text="No appointments found."
              btnText="Book an appointment"
              onBtnPress={() => navigation.navigate('BrowseByDoctors')}
            />
          </View>
        )}
      </View>

      <CancelAppointmentModal
        visible={showCancelModal}
        reason={reason}
        reasons={reasons}
        isPending={cancelAppointment.isPending}
        onClose={() => setShowCancelModal(false)}
        onSelectReason={setReason}
        onConfirm={handleCancelAppointment}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
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

  content: {
    padding: 16,
  },

  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  tab: {
    paddingHorizontal: 16,
    height: 36,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#EEF2F7',
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },

  tabActive: {
    backgroundColor: colors.darkPrimary,
  },

  tabText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },

  tabTextActive: {
    color: '#fff',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },

  liveBorder: {
    borderLeftWidth: 4,
    borderLeftColor: '#22C55E',
  },

  scheduledBorder: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },

  rescheduleBorder: {
    borderLeftWidth: 4,
    borderLeftColor: '#D97706',
  },

  completedBorder: {
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },

  cancelledBorder: {
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },

  noShowBorder: {
    borderLeftWidth: 4,
    borderLeftColor: '#8A7A24',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 2,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  avatarText: {
    color: '#fff',
    fontFamily: fonts.bold,
  },

  name: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },

  meta: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: fonts.semiBold,
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D0D5DD',
    marginHorizontal: 8,
  },

  type: {
    marginLeft: 5,
    fontSize: 12,
    color: colors.darkPrimary,
    fontFamily: fonts.semiBold,
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 2,
    marginTop: 10,
    marginLeft: 53,
    paddingRight: 10,
  },

  time: {
    marginLeft: 4,
    fontSize: 12,
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
  },

  statusText: {
    fontSize: 10,
    color: colors.textPrimary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontWeight: '600',
    borderRadius: 12,
  },

  actions: {
    flexDirection: 'row',
    marginTop: 12,
    fontFamily: fonts.semiBold,
    gap: 10,
  },

  btnBase: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  joinBtn: {
    flex: 1,
    backgroundColor: '#22C55E',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    fontFamily: fonts.semiBold,
  },

  joinText: {
    color: '#fff',
    fontFamily: fonts.semiBold,
  },

  secondaryBtn: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#EEF2F7',
    fontFamily: fonts.semiBold,
  },

  secondaryFull: {
    flex: 1,
    backgroundColor: '#EEF2F7',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    fontFamily: fonts.semiBold,
  },

  cancelBtn: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    fontFamily: fonts.semiBold,
  },

  primaryBtn: {
    marginLeft: 10,
    backgroundColor: colors.darkPrimary,
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    fontFamily: fonts.semiBold,
  },

  disabledBtn: {
    backgroundColor: '#E5E7EB',
    borderColor: '#E5E7EB',
    opacity: 0.7,
  },

  refundBox: {
    marginTop: 14,
    padding: 10,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
  },

  refundText: {
    color: '#B45309',
    fontSize: 14,
    fontWeight: '600',
  },

  status: {
    borderRadius: 8,
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 2,
    paddingVertical: 2,
  },

  clinicBox: {
    marginTop: 15,
    padding: 8,
    backgroundColor: '#d1fae58b',
    borderRadius: 8,
  },

  clinicText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    minHeight: 600,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
