import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import { colors, fonts } from '../../theme';
import { DoctorAvatar } from '../common/DoctorAvtar';

export default function DoctorHeader({ prescription }) {
  console.log('prescription', prescription);

  return (
    <View style={styles.card}>
      {/* <View style={styles.avatar}>
        <Text style={styles.avatarText}>DR</Text>
      </View> */}
      <DoctorAvatar doctor={prescription?.doctor} />

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{prescription?.digital_signature_text}</Text>

        <Text style={styles.rx}>
          {[
            prescription?.doctor?.qualification_specializations,
            prescription?.doctor?.specialization,
            prescription?.doctor?.qualifications,
          ]
            .filter(Boolean)
            .join(', ') || '-'}
        </Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    marginBottom: 16,
    // elevation: 2,
    // marginTop: 100,
  },

  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.bold,
  },

  name: {
    fontSize: 16,
    color: '#111827',
    fontFamily: fonts.bold,
  },

  sub: {
    // marginTop: 6,
    color: '#6B7280',
    fontSize: 13,
  },

  rx: {
    fontFamily: fonts.medium,
    fontSize: 12,
  },
});
