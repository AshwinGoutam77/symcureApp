/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {colors, fonts, spacing} from '../../theme';

import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';

export default function Input({
  label,
  value,
  placeholder,
  onChangeText,
  disabled,
  type = 'text',
  required
}) {
  const [open, setOpen] = useState(false);

  const handleConfirm = date => {
    setOpen(false);
    onChangeText && onChangeText(moment(date).format('DD/MM/YYYY'));
  };

  return (
    <View style={{marginBottom: 12}}>
      <View style={styles.row}>
        <Text style={styles.label}>{label} </Text> 
          {required && <Text style={styles.required}>*</Text>}
      </View>

      {type === 'date' ? (
        <>
          <TouchableOpacity
            onPress={() => !disabled && setOpen(true)}
            style={[styles.inputBox, disabled && styles.disabledInput]}>
            <Text
              style={[styles.input, !value && {color: colors.textSecondary}]}>
              {value || placeholder || 'Select date'}
            </Text>
          </TouchableOpacity>

          <DatePicker
            modal
            open={open}
            date={value ? moment(value, 'DD/MM/YYYY').toDate() : new Date()}
            mode="date"
            maximumDate={new Date()}
            onConfirm={handleConfirm}
            onCancel={() => setOpen(false)}
          />
        </>
      ) : (
        <View style={[styles.inputBox, disabled && styles.disabledInput]}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, disabled && styles.disabledInputText]}
            editable={!disabled}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row:{
    flexDirection: 'row',
    alignItems: 'center',
    gap: '2',
    marginBottom: 6,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.textSecondary,
  },

  required: {
    color: 'red',
    fontFamily: fonts.bold,
    fontSize: 12,
  },

  inputBox: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    height: 52,
    backgroundColor: colors.white,
    justifyContent: 'center',
    // marginBottom: 5
  },

  input: {
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    // height: '100%',
    textTransform: 'capitalize',
  },
  disabledInput: {
    backgroundColor: colors.background,
    color: colors.textSecondary,
  },

  disabledInputText: {
    color: colors.textSecondary,
  },
});
