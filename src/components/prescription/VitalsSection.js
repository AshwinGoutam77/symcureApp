import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import {colors, fonts} from '../../theme';

export default function VitalsSection({vitals}) {
  if (!vitals) return null;

  const DATA = [
    {
      icon: 'activity',
      label: 'Blood Pressure',
      value: vitals.bp_mm_hg ? `${vitals.bp_mm_hg} mmHg` : null,
    },
    {
      icon: 'heart',
      label: 'Pulse',
      value: vitals.pulse_bpm ? `${vitals.pulse_bpm} bpm` : null,
    },
    {
      icon: 'thermometer',
      label: 'Temperature',
      value: vitals.temperature_f ? `${vitals.temperature_f} °F` : null,
    },
    {
      icon: 'wind',
      label: 'SpO₂',
      value: vitals.spo2 ? `${vitals.spo2}%` : null,
    },
    {
      icon: 'user',
      label: 'Weight',
      value: vitals.weight_kg ? `${vitals.weight_kg} kg` : null,
    },
    {
      icon: 'maximize',
      label: 'Height',
      value: vitals.height_cm ? `${vitals.height_cm} cm` : null,
    },
    {
      icon: 'grid',
      label: 'BMI',
      value: vitals.bmi,
    },
    {
      icon: 'loader',
      label: 'Respiratory',
      value: vitals.respiratory_rate ? `${vitals.respiratory_rate}/min` : null,
    },
    {
      icon: 'square',
      label: 'BSA',
      value: vitals.bsa,
    },
  ].filter(item => item.value);

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Vitals</Text>

      <View style={styles.grid}>
        {DATA.map((item, index) => (
          <View key={index} style={styles.item}>
            {/* <View style={styles.iconBox}>
              <Feather name={item.icon} size={18} color={colors.primary} />
            </View> */}

            <View style={{flex: 1}}>
              <Text style={styles.label}>{item.label}</Text>

              <Text style={styles.value}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },

  heading: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: '#111827',
    marginBottom: 16,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  item: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EEF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  label: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 3,
  },

  value: {
    fontSize: 14,
    color: '#111827',
    fontFamily: fonts.semiBold,
    marginTop: 2,
  },
});
