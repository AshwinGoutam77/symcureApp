/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { colors, fonts } from '../../theme';
import Button from '../../components/common/Button';
import { useTranslation } from 'react-i18next';
import { Modal } from 'react-native';
import { useAvailableSlots } from '../../hooks/queries/useAppoitmentQueries';

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

export default function SelectSlotScreen({ navigation, route }) {
  const { selected = 'clinic', doctorId, doctorDetail } = route?.params || {};
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState('');
  const [mode, setMode] = useState(selected || 'video');

  const getNext7Days = () => {
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

        // API format
        apiDate: `${year}-${month}-${date}`,
      });
    }

    return result;
  };

  const dates = getNext7Days();

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
  const clinicFee = slotsData?.data?.clinic_fee ?? null;

  const morningSlots = [
    '9:00 AM',
    '9:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
  ];

  const afternoonSlots = [
    '2:00 PM',
    '2:30 PM',
    '3:00 PM',
    '3:30 PM',
    '4:00 PM',
    '4:30 PM',
  ];

  const [selectedClinicSlot, setSelectedClinicSlot] = useState(null);
  const [showConsentModal, setShowConsentModal] = useState(false);

  const clinicFeeValue =
    doctorDetail?.clinic_fee ??
    doctorDetail?.consultation_options?.clinic?.fee ??
    clinicFee;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.back}
          >
            <Feather name="arrow-left" size={18} />
          </TouchableOpacity>

          <View>
            <Text style={styles.title}>{t('selectSlot')}</Text>
            <Text style={styles.sub}>
              {doctorDetail?.name} · {doctorDetail?.qualification_specializations || doctorDetail?.specialization} · {doctorDetail?.qualifications}
            </Text>
          </View>
        </View>

        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[
              styles.modeBtn,
              mode === 'video' && styles.activeMode,
              !doctorDetail?.onlineFee && styles.disabled,
            ]}
            onPress={() => setMode('video')}
            disabled={!doctorDetail?.onlineFee}
          >
            <Text
              style={[
                styles.modeText,
                mode === 'video' && styles.activeText,
                !doctorDetail?.onlineFee && styles.disabledText,
              ]}
            >
              {doctorDetail?.onlineFee
                ? t('videoMode', { price: doctorDetail?.onlineFee })
                : 'Video - Coming Soon'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeBtn, mode === 'clinic' && styles.activeMode]}
            onPress={() => setMode('clinic')}
          >
            <Text
              style={[styles.modeText, mode === 'clinic' && styles.activeText]}
            >
              {t('clinicMode', {
                price:
                  clinicFeeValue !== null &&
                    clinicFeeValue !== undefined &&
                    clinicFeeValue !== ''
                    ? `₹${clinicFeeValue}`
                    : '',
              })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.slotContainer}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <Text style={styles.section}>{t('selectDate')}</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {dates.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.dateBox,
                selectedDate === i && styles.activeDateBox,
              ]}
              onPress={() => { setSelectedDate(i); setSelectedClinicSlot(null); setSelectedTime('') }}
            >
              <Text
                style={[styles.day, selectedDate === i && styles.activeDay]}
              >
                {item.day}
              </Text>
              <Text
                style={[styles.date, selectedDate === i && styles.activeDate]}
              >
                {item.date}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {mode === 'video' && (
          <>
            <Text style={styles.section}>{t('morning')}</Text>
            <View style={styles.grid}>
              {morningSlots.map((time, i) => (
                <Slot
                  key={i}
                  time={time}
                  selected={selectedTime === time}
                  onPress={() => setSelectedTime(time)}
                  disabled={time === '10:30 AM' || time === '11:30 AM'}
                />
              ))}
            </View>

            <Text style={styles.section}>{t('afternoon')}</Text>
            <View style={styles.grid}>
              {afternoonSlots.map((time, i) => (
                <Slot
                  key={i}
                  time={time}
                  selected={selectedTime === time}
                  onPress={() => setSelectedTime(time)}
                  disabled={time === '2:30 PM' || time === '4:30 PM'}
                />
              ))}
            </View>

            <View style={styles.note}>
              {/* <Feather name="lock" size={14} color="#7A879E" /> */}
              <Text style={styles.noteText}>{t('videoNote')}</Text>
            </View>
          </>
        )}

        {mode === 'clinic' && (
          <>
            <Text style={[styles.section, { marginBottom: 5, marginTop: 30 }]}>
              Available Slots
            </Text>

            {slotsLoading || slotsFetching ? (
              <View style={[styles.note, { marginTop: 20 }]}>
                <Text style={styles.noteText}>Loading available slots...</Text>
              </View>
            ) : slotsError ? (
              <View style={[styles.note, { marginTop: 20 }]}>
                <Text style={styles.noteText}>
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
                        selectedClinicSlot?.session_id === slot.session_id
                      }
                      disabled={!slot.bookable}
                      alreadyBooked={alreadyBooked}
                      onPress={() => {
                        if (!slot.bookable || alreadyBooked) {
                          return;
                        }

                        setSelectedClinicSlot(slot);
                        setSelectedTime(slot.label);
                      }}
                      clinicSlots
                    />
                  );
                })}
              </View>
            )}

            {selectedClinicSlot && (
              <View style={styles.selectedCard}>
                <View style={styles.selectedIcon}>
                  <Feather name="check" size={17} color="#16A34A" />
                </View>

                <View style={styles.selectedContent}>
                  <Text style={styles.selectedCardLabel}>
                    Selected Appointment
                  </Text>

                  <Text style={styles.selectedCardValue}>
                    {dates[selectedDate]?.day} {dates[selectedDate]?.date}
                    {' • '}
                    {selectedClinicSlot.label}
                  </Text>
                  <Text style={styles.selectedSeats}>
                    {selectedClinicSlot.seats_left} seats remaining
                  </Text>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {selectedTime && (
        <View style={styles.footer}>
          <View
            style={[
              styles.row,
              { justifyContent: 'space-between', marginBottom: 20 },
            ]}
          >
            <View>
              <Text style={styles.selectedLabel}>{t('selected')}</Text>
              <Text style={styles.selectedValue}>
                {t('selectedSlot', {
                  day: dates[selectedDate]?.day,
                  date: dates[selectedDate]?.date,
                  time: selectedTime,
                  mode: t(mode),
                })}
              </Text>
            </View>

            <Text style={styles.price}>
              {mode === 'video'
                ? '₹499'
                : clinicFee !== null
                  ? `₹${clinicFee}`
                  : ''}
            </Text>
          </View>

          <Button
            title={t('proceedPayment')}
            onPress={() => {
              navigation.navigate('PaymentScreen', {
                doctorId,
                doctorDetail,
                consultType: 'offline',
                date: dates[selectedDate]?.apiDate,
                time: dates[selectedDate]?.apiDate,
                selectedSlot: selectedClinicSlot,
                reasonForVisit: '',
                notes: '',
                shareRecords: true,
                mode: 'offline',
              });
            }}
          />
        </View>
      )}

      <Modal
        transparent
        visible={showConsentModal}
        animationType="slide"
        statusBarTranslucent
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowConsentModal(false)}
        >
          <View>
            <TouchableOpacity activeOpacity={1} style={styles.sheet}>
              <View style={styles.handle} />

              <Text style={styles.heading}>Share Medical Records?</Text>

              <Text style={styles.description}>
                Help your doctor understand your medical history by securely
                sharing your previous consultation records.
              </Text>

              <View style={styles.securityRow}>
                <View style={styles.lockCircle}>
                  <Feather name="lock" size={18} color="#2563EB" />
                </View>

                <Text style={styles.securityText}>
                  Only the doctor for this appointment will be able to access
                  the records you choose to share.
                </Text>
              </View>

              <Button
                title="Continue"
                onPress={() => {
                  setShowConsentModal(false);
                  navigation.navigate('PaymentScreen', {
                    doctorId,
                    doctorDetail,
                    consultType: 'offline',
                    date: dates[selectedDate]?.apiDate,
                    time: dates[selectedDate]?.apiDate,
                    selectedSlot: selectedClinicSlot,
                    reasonForVisit: '',
                    notes: '',
                    shareRecords: true,
                    mode: 'offline',
                  });
                }}
              />

              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => {
                  setShowConsentModal(false);
                  navigation.navigate('PaymentScreen', {
                    doctorId,
                    consultType: 'offline',
                    date: dates[selectedDate]?.apiDate,
                    selectedSlot: selectedClinicSlot,
                    reasonForVisit: '',
                    notes: '',
                    shareRecords: false,
                    mode: 'offline',
                  });
                }}
              >
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FD' },

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
  },

  slotContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    marginBottom: 30,
  },

  back: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
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
    color: '#7A879E',
    paddingRight: 60
  },

  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 14
  },

  modeBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#E6EBF5',
    // marginRight: 10,
    alignItems: 'center',
  },

  activeMode: {
    backgroundColor: colors.darkPrimary,
  },

  disabled: {
    backgroundColor: '#e7e8e9ff',
    borderColor: '#E1E5EA',
    opacity: 0.6,
  },

  disabledText: { color: '#8A94A6' },

  modeText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
  },

  activeText: {
    color: '#fff',
  },

  section: {
    marginTop: 16,
    marginBottom: 10,
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
    color: colors.textSecondary,
    fontFamily: fonts.bold,
  },

  date: {
    fontSize: 18,
    fontFamily: fonts.bold,
    marginTop: 4,
  },

  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },

  slot: {
    width: '50%',
    margin: '2%',
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

  slotText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: '#000000',
  },

  slotTextActive: {
    color: '#fff',
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

  noteText: {
    marginLeft: 6,
    fontSize: 13,
    color: colors.textPrimary + 'CC',
    fontFamily: fonts.semiBold,
  },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#E6EBF5',
    backgroundColor: '#fff',
    marginBottom: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  selectedLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: fonts.semiBold,
    // color: '#000000',
  },

  selectedValue: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#000000',
  },

  price: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.darkPrimary,
  },

  tokenLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: fonts.semiBold,
  },

  tokenValue: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    marginTop: 2,
    color: '#000',
  },

  note: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    // paddingHorizontal: 16,
    marginBottom: 20,
    // backgroundColor: colors.textSecondary + '33',
    borderRadius: 12,
    // marginVertical: 20,
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

  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },

  tokenItem: {
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,.45)',
    justifyContent: 'flex-end',
  },

  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    padding: 22,
  },

  handle: {
    width: 60,
    height: 5,
    borderRadius: 20,
    backgroundColor: '#D8DEE8',
    alignSelf: 'center',
    marginBottom: 22,
  },

  heading: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: '#111827',
  },

  description: {
    marginTop: 5,
    fontSize: 13,
    marginBottom: 14,
  },

  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 22,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E6EDF7',
    marginBottom: 14,
  },

  recordItemSelected: {
    backgroundColor: '#F5F9FF',
  },

  recordLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  recordTitle: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: '#111827',
  },

  recordSubtitle: {
    fontSize: 13,
  },

  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 26,
  },

  lockCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAF3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  securityText: {
    flex: 1,
    fontSize: 13,
  },

  skipButton: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.darkPrimary,
    marginTop: 14,
    marginBottom: 14,
  },

  skipText: {
    color: colors.darkPrimary,
    fontSize: 15,
    fontFamily: fonts.semiBold,
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

  selectedContent: {
    flex: 1,
  },

  selectedCardLabel: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: fonts.semiBold,
  },

  selectedCardValue: {
    marginTop: 3,
    fontSize: 15,
    color: '#166534',
    fontFamily: fonts.bold,
  },

  selectedSeats: {
    marginTop: 3,
    fontSize: 11,
    color: '#16A34A',
    fontFamily: fonts.semiBold,
  },
});
