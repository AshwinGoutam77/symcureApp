import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '../../theme';

export default function FormCard({ children }) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 20,
    padding: 16,
    elevation: 1,
  },
});