import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import {colors, fonts} from '../../theme';

export default function DoctorHeader({prescription}) {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>DR</Text>
      </View>

      <View style={{flex: 1}}>
        <Text style={styles.name}>{prescription?.digital_signature_text}</Text>

        <Text style={styles.sub}>Prescription No.</Text>

        <Text style={styles.rx}>{prescription?.prescription_no}</Text>
      </View>
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
    // marginTop: 2,
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
});
