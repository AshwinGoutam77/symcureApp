import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {fonts} from '../../theme';

export default function ExaminationSection({examination}) {
  if (!examination) return null;

  const DATA = [
    {
      label: 'General Condition',
      value: examination.general_condition_label,
    },

    {
      label: 'Pallor',
      value: examination.pallor_label,
    },

    {
      label: 'Icterus',
      value: examination.icterus_label,
    },

    {
      label: 'Cyanosis',
      value: examination.cyanosis_label,
    },

    {
      label: 'Oedema',
      value: examination.oedema_label,
    },

    {
      label: 'Lymph Nodes',
      value: examination.lymph_nodes_label,
    },

    {
      label: 'Nutrition',
      value: examination.nutrition,
    },

    {
      label: 'Hydration',
      value: examination.hydration,
    },

    {
      label: 'Local Examination',
      value: examination.local_examination,
    },

    {
      label: 'Systemic Examination',
      value: examination.systemic_examination,
    },
  ].filter(i => i.value);

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Examination</Text>

      {DATA.map((item, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.label}>{item.label}</Text>

          <Text style={styles.value}>{item.value}</Text>
        </View>
      ))}
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
    fontFamily: fonts.bold,
    fontSize: 16,
    marginBottom: 15,
    color: '#111827',
  },

  row: {
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
    paddingBottom: 12,
  },

  label: {
    color: '#6B7280',
    fontSize: 12,
  },

  value: {
    marginTop: 4,
    fontFamily: fonts.semiBold,
    color: '#111827',
    fontSize: 15,
  },
});
