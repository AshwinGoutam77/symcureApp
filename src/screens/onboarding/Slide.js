import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, fonts } from '../../theme';

const { width } = Dimensions.get('window');

export default function Slide({ item }) {
  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.inner}>
        <View style={styles.iconWrapper}>{item.icon}</View>

        <Text style={styles.title}>
          {item.title}
          {'\n'}
          <Text style={styles.highlight}>{item.highlight}</Text>
        </Text>

        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },

  inner: {
    paddingHorizontal: 24,
  },

  icon: {
    fontSize: 60,
    marginBottom: 20,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 42,
    color: '#fff',
    fontWeight: '800',
    lineHeight: 40,
    marginTop: 30,
  },

  highlight: {
    fontFamily: fonts.bold,
    color: colors.textlightPrimary,
    fontStyle: 'italic',
  },

  subtitle: {
    fontFamily: fonts.medium,
    color: colors.white,
    fontSize: 16,
    marginTop: 12,
    lineHeight: 22,
  },
});
