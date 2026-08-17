import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {colors, fonts} from '../../theme';

export default function Button({
  title,
  onPress,
  icon,
  loading = false,
  disabled = false,
  containerStyle,
}) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled, containerStyle]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color={colors.textWhite} />
      ) : (
        <View style={styles.inner}>
          <Text style={styles.text}>{title}</Text>

          {icon && (
            <Feather
              name={icon}
              size={16}
              color={colors.textWhite}
              style={styles.icon}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.darkPrimary,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  disabled: {
    opacity: 0.6,
  },

  inner: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  text: {
    color: colors.textWhite,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },

  icon: {
    marginLeft: 6,
  },
});
