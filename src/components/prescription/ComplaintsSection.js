/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, fonts} from '../../theme';

export default function ComplaintsSection({complaints}) {
  if (!complaints?.length) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Chief Complaints</Text>

      <View style={styles.row}>
        {complaints.map((item, index) => (
          <View key={index}>
            <View style={{flex: 1}}>
              <Text style={styles.name}>{item.symptom_name_snapshot}</Text>

            <View style={[styles.row, {alignItems: 'center'}]}>
                <Text style={styles.duration}>
                {item.duration_value} {item.duration_unit_label}
              </Text>

              {!!item.location_side_label && (
                <Text style={styles.side}>{item.location_side_label}</Text>
              )}
            </View>
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
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
  },

  title: {
    fontSize: 16,
    fontFamily: fonts.bold,
    marginBottom: 16,
    color: '#111827',
  },

  row: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 30,
    flexWrap: 'wrap',
  },

  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  name: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: '#111827',
  },

  duration: {
    fontSize: 13,
  },

  side: {
    fontSize: 12,
    color: colors.primary,
    fontFamily: fonts.semiBold,
  },
});
