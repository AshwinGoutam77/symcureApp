import React, {useState} from 'react';
import {Text, View, TouchableOpacity, Animated} from 'react-native';
import {colors, fonts} from '../theme';

export default function ToggleItem({title, subtitle}) {
  const [enabled, setEnabled] = useState(true);
  const translateX = new Animated.Value(enabled ? 20 : 2);

  const toggleSwitch = () => {
    Animated.timing(translateX, {
      toValue: enabled ? 2 : 20,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setEnabled(!enabled);
  };

  return (
    <View style={styles.toggleRow}>
      <View>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleSub}>{subtitle}</Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggleSwitch}
        style={[
          styles.switchContainer,
          {
            backgroundColor: enabled
              ? colors.secondary
              : colors.secondary + '33',
          },
        ]}>
        <Animated.View style={[styles.circle, {transform: [{translateX}]}]} />
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E6EBF5',
    paddingVertical: 16,
  },

  toggleTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  toggleSub: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  switchContainer: {
    width: 42,
    height: 24,
    borderRadius: 20,
    justifyContent: 'center',
    padding: 2,
  },

  circle: {
    width: 16,
    height: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 2, // Android shadow
  },
};
