import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {fonts} from '../../theme';

export default function InvestigationsSection({investigations}) {
  if (!investigations?.length) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Investigations</Text>

      <View style={styles.chipContainer}>
        {investigations.map((item, index) => (
          <View key={index} style={styles.chip}>
            <Text style={styles.chipText}>{item.test_name_snapshot}</Text>
          </View>
        ))}
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },

  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chip: {
    backgroundColor: '#F3F6FB',
    borderWidth: 1,
    borderColor: '#E5EAF2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },

  chipText: {
    fontSize: 13,
    fontFamily: fonts.medium,
  },
});
