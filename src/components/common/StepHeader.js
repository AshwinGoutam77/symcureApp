import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../../theme';

export default function StepHeader({ title, step }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.step}>Step {step} of 3</Text>

      <View style={styles.progress}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.bar,
              step >= i && styles.activeBar,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.textPrimary,
  },

  step: {
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginTop: 4,
  },

  progress: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },

  bar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E6EBF5',
    marginRight: 6,
    borderRadius: 10,
  },

  activeBar: {
    backgroundColor: colors.primary,
  },
});