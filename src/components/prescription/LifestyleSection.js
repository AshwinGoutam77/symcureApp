import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import {colors, fonts} from '../../theme';

export default function LifestyleSection({habits}) {
  if (!habits?.length) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Lifestyle Habits</Text>

      {habits.map((item, index) => (
        <View
          key={index}
          style={[styles.item, index !== habits.length - 1 && styles.divider]}>
          <View style={styles.topRow}>
            <View style={styles.left}>
              <Text style={styles.title}>{item.habit_type_label}</Text>
            </View>

            <View
              style={[
                styles.badge,
                item.is_quit ? styles.quitBadge : styles.activeBadge,
              ]}>
              <Text
                style={[
                  styles.badgeText,
                  item.is_quit ? styles.quitText : styles.activeText,
                ]}>
                {item.is_quit ? 'Quit' : 'Active'}
              </Text>
            </View>
          </View>

          <View style={styles.bottomRow}>
            {!!item.quantity && <Text style={styles.meta}>Quantity :{item.quantity}</Text>}

            {!!item.duration && (
              <Text style={styles.meta}>Duration: {item.duration}</Text>
            )}

            {!!item.age_started && (
              <Text style={styles.meta}>Started: {item.age_started} yrs</Text>
            )}

            {!!item.age_quit && (
              <Text style={styles.meta}>Quit: {item.age_quit} yrs</Text>
            )}
          </View>
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

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: '#111827',
  },

  value: {
    marginTop: 8,
    fontSize: 13,
    color: '#374151',
  },

  bottomRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // marginTop: 8,
  },

  meta: {
    fontSize: 12,
    marginRight: 16,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  badgeText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
  },

  activeBadge: {
    backgroundColor: '#DCFCE7',
  },

  activeText: {
    color: '#15803D',
  },

  quitBadge: {
    backgroundColor: '#F3F4F6',
  },

  quitText: {
    color: '#374151',
  },
});
