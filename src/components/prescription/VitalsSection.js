import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

import {colors, fonts} from '../../theme';

export default function VitalsSection({vitals, settings}) {
  if (!vitals || !settings?.enabled) return null;

  const DATA = [
    {
      enabled: settings?.bp,
      label: 'Blood Pressure',
      value: vitals.bp_mm_hg ? `${vitals.bp_mm_hg} mmHg` : null,
    },
    {
      enabled: settings?.pulse,
      label: 'Pulse',
      value: vitals.pulse_bpm ? `${vitals.pulse_bpm} bpm` : null,
    },
    {
      enabled: settings?.temperature,
      label: 'Temperature',
      value: vitals.temperature_f ? `${vitals.temperature_f} °F` : null,
    },
    {
      enabled: settings?.spo2,
      label: 'SpO₂',
      value: vitals.spo2 ? `${vitals.spo2}%` : null,
    },
    {
      enabled: settings?.weight,
      label: 'Weight',
      value: vitals.weight_kg ? `${vitals.weight_kg} kg` : null,
    },
    {
      enabled: settings?.height,
      label: 'Height',
      value: vitals.height_cm ? `${vitals.height_cm} cm` : null,
    },
    {
      enabled: settings?.bmi,
      label: 'BMI',
      value: vitals.bmi,
    },
    {
      enabled: settings?.respiratoryRate,
      label: 'Respiratory',
      value: vitals.respiratory_rate
        ? `${vitals.respiratory_rate}/min`
        : null,
    },
    {
      enabled: settings?.bsa,
      label: 'BSA',
      value: vitals.bsa,
    },
  ].filter(item => item.enabled && item.value);

  if (!DATA.length) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Vitals</Text>

      <View style={styles.grid}>
        {DATA.map((item, index) => (
          <View key={index} style={styles.item}>
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