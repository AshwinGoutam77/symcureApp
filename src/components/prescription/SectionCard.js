import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {fonts} from '../../theme';

export default function SectionCard({title, value}) {
  if (!value) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.value}>{value}</Text>
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

  title: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: '#111827',
    marginBottom: 10,
  },

  value: {
    fontSize: 14,
    lineHeight: 24,
    color: '#4B5563',
  },
});
