/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {fonts} from '../../theme';

export default function PatientCard({patient}) {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Patient Details</Text>

      {/* Name */}
      <View style={styles.row}>
        <Info label="Patient Name" value={patient?.full_name || '-'} />
        <Info
          icon="calendar"
          label="Age"
          value={patient?.age ? `${patient.age} Years` : '-'}
        />
      </View>

      {/* Age + Gender */}
      <View style={styles.row}>
        <Info icon="" label="Gender" value={patient?.gender || '-'} />
        <Info
          icon="phone"
          label="Mobile"
          value={patient?.mobile || patient?.mobile_mask || '-'}
        />
      </View>

      {/* Mobile + Blood */}
      <View style={styles.row}>
        <Info
          icon="phone"
          label="Prescription Date"
          value={patient?.prescription_date || '-'}
        />
        <Info icon="phone" label="Address" value={patient?.address || '-'} />
      </View>
    </View>
  );
}

function Info({icon, label, value}) {
  return (
    <View style={styles.info}>
      <View style={styles.infoHeader}>
        <Text style={styles.label}>{label}</Text>
      </View>

      <Text style={styles.value}>{value || '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  heading: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
  },

  row: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
  },

  info: {
    flex: 1,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },

  icon: {
    marginTop: 2,
    marginRight: 10,
  },

  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },

  label: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: fonts.medium,
  },

  value: {
    fontSize: 14,
    color: '#111827',
    fontFamily: fonts.semiBold,
    marginTop: 2,
  },

  address: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 19,
    marginTop: 2,
    fontFamily: fonts.medium,
  },
});
