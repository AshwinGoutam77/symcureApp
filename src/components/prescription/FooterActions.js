import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import {colors, fonts} from '../../theme';

export default function FooterActions({onViewPdf, onDownload, onShare}) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.8}
          onPress={onDownload}>
          <Feather name="download" size={18} color="#fff" />

          <Text style={styles.primaryText}>Download</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.8}
          onPress={onShare}>
          <Feather name="share-2" size={18} color={colors.darkPrimary} />

          <Text style={styles.secondaryText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
    // position: 'sticky',
    // bottom: 0,
    // left: 20,
    // right: 20,
  },

  primaryButton: {
    backgroundColor: colors.darkPrimary,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '48%',
  },

  primaryText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: fonts.bold,
    marginLeft: 10,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  secondaryButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  secondaryText: {
    marginLeft: 8,
    color: '#111827',
    fontSize: 14,
    fontFamily: fonts.bold,
  },
});
