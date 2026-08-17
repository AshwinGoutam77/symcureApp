/* eslint-disable curly */
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {fonts} from '../../theme';

export default function AdviceSection({general}) {
  if (!general) return null;

  const sections = [
    {
      title: 'General Advice',
      icon: 'clipboard',
      value: general.general_advice,
    },
    {
      title: 'Next Treatment Plan',
      icon: 'activity',
      value: general.next_treatment_plan_notes,
    },
    {
      title: 'Follow-up',
      icon: 'calendar',
      value: general.follow_up_date,
    },
    {
      title: 'Next Review Plan',
      icon: 'refresh-cw',
      value: general.next_review_plan,
    },
    {
      title: 'Doctor Notes',
      icon: 'file-text',
      value: general.private_notes,
    },
  ].filter(item => item.value);

  if (!sections.length) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Advice & Follow-up</Text>

      {sections.map((item, index) => (
        <View
          key={index}
          style={[
            styles.item,
            index !== sections.length - 1 && styles.divider,
          ]}>
          <View style={styles.header}>
            <Text style={styles.title}>{item.title}</Text>
          </View>

          <Text style={styles.value}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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

  item: {
    paddingVertical: 12,
  },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },

  title: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: '#111827',
  },

  value: {
    fontSize: 13,
    // lineHeight: 20,
    color: '#4B5563',
  },
});
