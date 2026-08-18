/* eslint-disable react-native/no-inline-styles */
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { colors, fonts } from '../../theme';
import Button from '../../components/common/Button';
import { useTranslation } from 'react-i18next';
import {
  useAvailableSlots,
  useRescheduleAppointment,
} from '../../hooks/queries/useAppoitmentQueries';
import { useQueryClient } from '@tanstack/react-query';

function Slot({
  time,
  selected,
  onPress,
  clinicSlots,
  disabled,
  alreadyBooked,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || alreadyBooked}
      style={[
        styles.slot,
        selected && styles.slotActive,

        disabled && !alreadyBooked && {
          backgroundColor: '#cecece49',
          borderStyle: 'dashed',
          borderColor: '#cececec3',
        },

        alreadyBooked && {
          backgroundColor: '#FEF2F2',
          borderColor: '#FECACA',
        },

        {
          width: clinicSlots ? '45%' : '30%',
        },
      ]}>

      <Text
        style={[
          styles.slotText,
          selected && styles.slotTextActive,
          alreadyBooked && {
            color: '#DC2626',
          },
        ]}>
        {time}
      </Text>

      {alreadyBooked && (
        <Text style={styles.bookedText}>
          Already booked
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default function RescheduleAppointmentScreen({ navigation, route }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const {
    appointmentId,
    doctorId,
    doctor,
    currentDate,
    currentStart,
    currentEnd,
  } = route?.params || {};

  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [rescheduleError, setRescheduleError] = useState('');

  const dates = useMemo(() => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    const result = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(today);

      nextDate.setDate(today.getDate() + i);

      const year = nextDate.getFullYear();

      const month = String(nextDate.getMonth() + 1).padStart(2, '0');

      const date = String(nextDate.getDate()).padStart(2, '0');

      result.push({
        day: days[nextDate.getDay()],
        date: nextDate.getDate(),
        apiDate: `${year}-${month}-${date}`,
      });
    }

    return result;
  }, []);

  const {
    data: slotsData,
    isLoading: slotsLoading,
    isFetching: slotsFetching,
    error: slotsError,
  } = useAvailableSlots({
    doctorId,
    date: dates[selectedDate]?.apiDate,
    consultType: 'offline',
  });

  const clinicSlots = slotsData?.data?.slots || [];

  const rescheduleAppointment = useRescheduleAppointment();

  const handleDateChange = index => {
    setSelectedDate(index);
    setSelectedSlot(null);
  };

  const handleSlotSelect = slot => {
    if (!slot?.bookable) {
      return;
    }
    setSelectedSlot(slot);
  };

  const handleReschedule = async () => {
    if (!appointmentId || !selectedSlot) {
      return;
    }
    const date = dates[selectedDate]?.apiDate;
    if (!date) {
      return;
    }
    setRescheduleError('');
    try {
      await rescheduleAppointment.mutateAsync({
        appointmentId,
        date,
        slot_start: selectedSlot.start,
        slot_end: selectedSlot.end,
      });

      await queryClient.invalidateQueries({
        queryKey: ['appointments'],
      });

      // dashboard
      await queryClient.invalidateQueries({
        queryKey: ['dashboard'],
      });

      // available-slots
      await queryClient.invalidateQueries({
        queryKey: ['available-slots'],
      });
      
      navigation.replace('AppointmentDetailScreen', {
        appointmentId,
      });
    } catch (error) {
      const errorData = error?.error;

      console.log('RESCHEDULE ERROR:', errorData);

      if (errorData?.code === 'DUPLICATE_BOOKING') {
        setRescheduleError(
          errorData?.message ||
          'You already have a booking with this doctor for this session.',
        );
        return;
      }
      setRescheduleError(
        errorData?.message ||
        'Unable to reschedule appointment. Please try again.',
      );
    }
  };

  const formatCurrentAppointment = () => {
    if (!currentDate) {
      return '';
    }

    if (currentStart && currentEnd) {
      return `${currentDate} · ${currentStart} - ${currentEnd}`;
    }

    return currentDate;
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.back}
          >
            <Feather name="arrow-left" size={18} color="#060D1F" />
          </TouchableOpacity>

          <View>
            <Text style={styles.title}>Reschedule Appointment</Text>

            <Text style={styles.sub}>
              {doctor?.name || 'Doctor'}
              {doctor?.qualification_specializations ? ` · ${doctor.qualification_specializations}` : ''}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.slotContainer}
        contentContainerStyle={{
          paddingBottom: 160,
        }}
      >
        {/* CURRENT APPOINTMENT */}

        {currentDate && (
          <View style={styles.currentAppointment}>
            <View style={styles.currentIcon}>
              <Feather name="calendar" size={18} color={colors.darkPrimary} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.currentLabel}>Current Appointment</Text>

              <Text style={styles.currentValue}>
                {formatCurrentAppointment()}
              </Text>
            </View>
          </View>
        )}

        {/* DATE */}

        <Text style={styles.section}>Select New Date</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {dates.map((item, index) => (
            <TouchableOpacity
              key={item.apiDate}
              style={[
                styles.dateBox,
                selectedDate === index && styles.activeDateBox,
              ]}
              onPress={() => handleDateChange(index)}
            >
              <Text
                style={[styles.day, selectedDate === index && styles.activeDay]}
              >
                {item.day}
              </Text>

              <Text
                style={[
                  styles.date,
                  selectedDate === index && styles.activeDate,
                ]}
              >
                {item.date}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* AVAILABLE SLOTS */}

        <Text style={styles.section}>Available Slots</Text>

        {slotsLoading || slotsFetching ? (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>Loading available slots...</Text>
          </View>
        ) : slotsError ? (
          <View style={styles.messageBox}>
            <Feather name="alert-circle" size={22} color="#EF4444" />

            <Text style={[styles.messageText, { color: '#EF4444' }]}>
              Unable to load available slots.
            </Text>
          </View>
        ) : clinicSlots.length === 0 ? (
          <View style={styles.messageBox}>
            <Feather name="calendar" size={22} color="#94A3B8" />

            <Text style={styles.messageText}>
              No slots available for this date.
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {clinicSlots.map(slot => {
              const alreadyBooked = slot.is_already_booked;

              return (
                <Slot
                  key={slot.session_id}
                  time={slot.label}
                  selected={
                    selectedSlot?.session_id === slot.session_id
                  }
                  disabled={!slot.bookable}
                  alreadyBooked={alreadyBooked}
                  onPress={() => {
                    if (!slot.bookable || alreadyBooked) {
                      return;
                    }

                    setSelectedSlot(slot);
                  }}
                  clinicSlots
                />
              );
            })}
          </View>
        )}

        {/* SELECTED SLOT */}

        {selectedSlot && (
          <View style={styles.selectedCard}>
            <View style={styles.selectedIcon}>
              <Feather name="check" size={18} color="#16A34A" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.selectedCardLabel}>New Appointment</Text>

              <Text style={styles.selectedCardValue}>
                {dates[selectedDate]?.day} {dates[selectedDate]?.date}
                {' · '}
                {selectedSlot.label}
              </Text>

              <Text style={styles.selectedSeats}>
                {selectedSlot.seats_left} seats remaining
              </Text>
            </View>
          </View>
        )}

        {/* INFO */}

        <View style={styles.note}>
          <Feather name="info" size={15} color={colors.darkPrimary} />

          <Text style={styles.noteText}>
            Select any available clinic session to reschedule your appointment.
          </Text>
        </View>
      </ScrollView>

      {/* FOOTER */}

      {selectedSlot && (
        <View style={styles.footer}>
          <View
            style={[
              styles.row,
              {
                justifyContent: 'space-between',
                marginBottom: 20,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.selectedLabel}>New Slot</Text>

              <Text style={styles.selectedValue} numberOfLines={1}>
                {dates[selectedDate]?.day} {dates[selectedDate]?.date}
                {' · '}
                {selectedSlot.label}
              </Text>
            </View>
          </View>

          <Button
            title={
              rescheduleAppointment.isPending
                ? 'Rescheduling...'
                : 'Confirm Reschedule'
            }
            disabled={rescheduleAppointment.isPending || !selectedSlot}
            onPress={handleReschedule}
          />
        </View>
      )}

      <Modal
        visible={!!rescheduleError}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setRescheduleError('')}
      >
        <View style={styles.errorModalOverlay}>
          <View style={styles.errorModal}>
            <View style={styles.errorIcon}>
              <Feather name="alert-circle" size={28} color="#DC2626" />
            </View>

            <Text style={styles.errorModalTitle}>Unable to Reschedule</Text>

            <Text style={styles.errorModalMessage}>{rescheduleError}</Text>

            <TouchableOpacity
              style={styles.errorModalButton}
              onPress={() => setRescheduleError('')}
            >
              <Text style={styles.errorModalButtonText}>OK</Text>
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

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E6EBF5',
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

  title: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: '#000000',
  },

  sub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    paddingRight: 60
  },

  slotContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    marginBottom: 30,
  },

  currentAppointment: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#DCE8FF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  currentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  currentLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },

  currentValue: {
    marginTop: 3,
    fontSize: 14,
    color: '#0F172A',
    fontFamily: fonts.semiBold,
  },

  section: {
    marginTop: 16,
    marginBottom: 20,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },

  dateBox: {
    width: 64,
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E6EBF5',
    paddingVertical: 16,
  },

  activeDateBox: {
    backgroundColor: colors.darkPrimary,
    borderColor: colors.darkPrimary,
  },

  activeDay: {
    color: '#fff',
  },

  activeDate: {
    color: '#fff',
  },

  day: {
    fontSize: 12,
    fontFamily: fonts.medium,
  },

  date: {
    fontSize: 18,
    fontFamily: fonts.bold,
    marginTop: 4,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  slot: {
    width: '40%',
    margin: '1.5%',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  slotActive: {
    backgroundColor: colors.darkPrimary,
    borderColor: colors.darkPrimary,
  },

  slotDisabled: {
    backgroundColor: '#cecece49',
    borderStyle: 'dashed',
    borderColor: '#cececec3',
  },

  slotText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: '#000000',
    textAlign: 'center',
  },

  slotTextActive: {
    color: '#fff',
  },

  slotTextDisabled: {
    color: '#9CA3AF',
  },

  bookedText: {
    marginTop: 2,
    fontSize: 10,
    color: '#ffffffff',
    fontFamily: fonts.bold,
    position: 'absolute',
    top: '-12',
    backgroundColor: '#DC2626',
    padding: 1,
    paddingHorizontal: 10,
    borderRadius: 10
  },

  seatsText: {
    marginTop: 4,
    fontSize: 10,
    color: '#16A34A',
    fontWeight: '600',
  },

  seatsTextActive: {
    color: '#DFF5E8',
  },

  seatsTextDisabled: {
    color: '#9CA3AF',
  },

  messageBox: {
    minHeight: 90,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
  },

  messageText: {
    marginTop: 8,
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: fonts.semiBold,
    textAlign: 'center',
  },

  selectedCard: {
    marginTop: 18,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#E8F7EE',
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  selectedCardLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },

  selectedCardValue: {
    marginTop: 3,
    fontSize: 15,
    color: '#166534',
    fontWeight: '800',
  },

  selectedSeats: {
    marginTop: 3,
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '600',
  },

  note: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },

  noteText: {
    marginLeft: 7,
    flex: 1,
    fontSize: 12,
    color: colors.textPrimary + 'CC',
    fontWeight: '600',
  },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#E6EBF5',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 34,
  },

  selectedLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: fonts.semiBold,
  },

  selectedValue: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#000000',
    marginTop: 2,
  },

  errorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  errorModalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },

  errorModalMessage: {
    fontSize: 14,
    // color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },

  errorModalButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.darkPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },

  errorModalButtonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: fonts.bold,
  },
});
