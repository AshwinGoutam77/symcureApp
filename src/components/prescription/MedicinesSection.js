import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import { colors, fonts } from '../../theme';

export default function MedicinesSection({ medicines }) {
  if (!medicines?.length) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Medicines</Text>

      {medicines.map((medicine, index) => (
        <View key={index} style={styles.medicineCard}>
          <View style={styles.topRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {medicine.medicine_name_snapshot || medicine?.custom_medicine_name}
                {medicine.strength ? ` ${medicine.strength}` : ''} mg
              </Text>

              <Text style={styles.meta}>
                {medicine.food_timing_label || '-'} • {medicine.route_label || '-'}
              </Text>
            </View>
          </View>

          <View style={styles.scheduleRow}>
           <Text style={styles.schedule}>
  M: {medicine?.dose_morning || '-'}{' '}
  A: {medicine?.dose_afternoon || '-'}{' '}
  N: {medicine?.dose_night || '-'}
</Text>

            <Text style={styles.schedule}>
              {medicine?.frequency_label || '-'}
            </Text>

            <Text style={styles.schedule}>
              {medicine?.duration_value && medicine?.duration_unit_label
                ? `${medicine.duration_value} ${medicine.duration_unit_label}`
                : '-'}
            </Text>

            {/* <Text style={styles.schedule}>
              Qty: {medicine?.quantity || '-'}
            </Text> */}
          </View>

          {!!medicine.instruction && (
            <Text style={styles.instructions}>{medicine.instruction}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

const Info = ({ title, value }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoTitle}>{title}</Text>

    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const Dose = ({ title, value }) => (
  <View style={styles.doseBox}>
    <Text style={styles.doseTitle}>{title}</Text>

    <Text style={styles.doseValue}>{value || '-'}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },

  heading: {
    fontSize: 16,
    fontFamily: fonts.bold,
    marginBottom: 16,
    color: '#111827',
  },

  medicineCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF4',
  },

  topRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },

  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EEF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  strength: {
    marginTop: 3,
    color: '#6B7280',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  infoItem: {
    width: '48%',
    marginBottom: 12,
  },

  infoTitle: {
    color: '#6B7280',
    fontSize: 11,
  },

  infoValue: {
    marginTop: 3,
    fontFamily: fonts.semiBold,
  },

  doseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  doseBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 3,
    alignItems: 'center',
  },

  doseTitle: {
    fontSize: 11,
    color: '#6B7280',
  },

  doseValue: {
    marginTop: 5,
    fontFamily: fonts.bold,
    fontSize: 16,
  },

  note: {
    marginTop: 14,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 10,
  },

  noteTitle: {
    fontFamily: fonts.bold,
    marginBottom: 6,
  },

  noteText: {
    color: '#4B5563',
    lineHeight: 22,
  },

  name: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: '#111827',
  },

  meta: {
    // marginTop: 3,
    fontSize: 12,
    color: '#6B7280',
  },

  scheduleRow: {
    flexDirection: 'row',
    // marginTop: 8,
    gap: 20,
  },

  schedule: {
    fontSize: 12,
    color: '#2563EB',
    fontFamily: fonts.semiBold,
  },

  instructions: {
    marginTop: 8,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
});
