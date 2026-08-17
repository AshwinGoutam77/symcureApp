import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import {colors, fonts} from '../../theme';

export default function FamilyHistorySection({family}) {
  if (!family?.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Family History</Text>

      {family.map((item, index) => (
        <View
          key={index}
          style={[styles.item, index !== family.length - 1 && styles.divider]}>
          {/* Header */}
          <View style={styles.topRow}>
            <View style={styles.left}>
              <Text style={styles.name}>
                {item.relationship_label || 'Family Member'}
              </Text>
            </View>

            {!!item.status_label && (
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{item.status_label}</Text>
              </View>
            )}
          </View>

          {/* Disease */}
          {!!item.disease && <Text style={styles.disease}>{item.disease}</Text>}

          {/* Meta */}
          <View style={styles.metaRow}>
            {!!item.age_at_onset && (
              <Text style={styles.meta}>Onset: {item.age_at_onset} yrs</Text>
            )}

            {!!item.duration && (
              <Text style={styles.meta}>Duration: {item.duration}</Text>
            )}

            {!!item.cancer_site && (
              <Text style={styles.meta}>Site: {item.cancer_site}</Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

function Info({label, value}) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoLabel}>{label}</Text>

      <Text style={styles.infoValue}>{value}</Text>
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

  card: {
    borderWidth: 1,
    borderColor: '#EEF2F7',
    borderRadius: 14,
    padding: 15,
    marginBottom: 14,
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

  name: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: '#111827',
  },

  disease: {
    marginTop: 8,
    fontSize: 13,
    color: '#374151',
  },

  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },

  meta: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 16,
  },

  statusBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  statusText: {
    color: '#15803D',
    fontSize: 11,
    fontFamily: fonts.semiBold,
  },
});
