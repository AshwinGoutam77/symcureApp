/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/self-closing-comp */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ImageBackground,
  Platform,
  KeyboardAvoidingView,
  ToastAndroid,
  Alert,
} from 'react-native';
import {colors, fonts, spacing} from '../../theme';
import Button from '../../components/common/Button';
import Feather from 'react-native-vector-icons/Feather';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {useSendOtpMutation} from '../../hooks/queries/useAuthMutations';

export default function LoginScreen({route, navigation}) {
  const {phone: previousPhone} = route?.params || {};
  const [phone, setPhone] = useState(previousPhone || '');
  const [error, setError] = useState('');

  const {mutateAsync: sendOtp, isPending} = useSendOtpMutation();

  const validatePhone = () => {
    if (!phone) {
      setError('Phone number is required');
      return false;
    }

    if (!/^\d+$/.test(phone)) {
      setError('Only numbers are allowed');
      return false;
    }

    if (phone.length !== 10) {
      setError('Enter valid 10-digit number');
      return false;
    }

    setError('');
    return true;
  };

  const handleSendOtp = async () => {
    if (!validatePhone()) {
      return;
    }

    try {
      setError('');

      const response = await sendOtp({
        mobile: phone,
      });

      console.log('SEND OTP RESPONSE:', response);

      if (Platform.OS === 'android') {
        ToastAndroid.show(
          response?.message || 'OTP Sent Successfully',
          ToastAndroid.SHORT,
        );
      } else {
        Alert.alert('Success', response?.message || 'OTP Sent Successfully');
      }

      navigation.navigate('Otp', {
        phone,
        otpRequestId:
          response?.data?.otp_request_id || response?.otp_request_id || null,
      });
    } catch (err) {
      console.log('SEND OTP ERROR:', err);

      setError(err?.message || 'Unable to send OTP. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* BACKGROUND */}
      <ImageBackground
        source={require('../../assets/images/login-bg.png')}
        style={styles.top}
        resizeMode="cover"
      />

      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
        }}>
        {/* YOUR EXISTING CONTENT */}

        <View style={styles.card}>
          <Text style={styles.title}>Welcome to <Text style={styles.highlightText}>Symcure</Text></Text>

          <Text style={styles.subtitle}>
            Enter your phone number to get started
          </Text>

          {/* INPUT */}
          <View style={styles.inputBox}>
            <Text style={styles.prefix}>+91</Text>

            <TextInput
              placeholder="10-digit number"
              placeholderTextColor="#A0AEC0"
              style={styles.input}
              keyboardType="number-pad"
              value={phone}
              maxLength={10}
              editable={!isPending}
              onChangeText={text => {
                setPhone(text.replace(/[^0-9]/g, ''));

                if (error) {
                  setError('');
                }
              }}
            />
          </View>

          {error ? (
            <Text
              style={{
                color: 'red',
                fontSize: 12,
                marginBottom: 8,
              }}>
              {error}
            </Text>
          ) : null}

          {/* SEND OTP */}
          <Button
            title={isPending ? 'Sending OTP...' : 'Send OTP'}
            onPress={handleSendOtp}
            disabled={phone.length !== 10 || isPending}
          />

          {/* TERMS */}
          <Text style={styles.or}>
            By continuing you confirm you are 18+ and agree to our
            <Text
              style={styles.highlightText}
              onPress={() =>
                navigation.navigate('WebViewScreen', {
                  url: 'https://symcure.com/',
                  title: 'Terms of Service'
                })
              }>
              {' '}
              Terms of Service
            </Text>
            {' & '}
            <Text
              style={styles.highlightText}
              onPress={() =>
                navigation.navigate('WebViewScreen', {
                  url: 'https://symcure.com/contact',
                  title: 'Privacy Policy'
                })
              }>
              Privacy Policy
            </Text>
          </Text>

          {/* TRUST */}
          <View style={styles.trustBox}>
            <View style={styles.trustItem}>
              <MIcon
                name="hospital-building"
                size={14}
                color={colors.textSecondary}
              />

              <Text style={styles.trustText}> MoHFW 2020</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.trustItem}>
              <Feather name="lock" size={14} color={colors.textSecondary} />

              <Text style={styles.trustText}> DPDP</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.trustItem}>
              <MIcon
                name="credit-card-outline"
                size={14}
                color={colors.textSecondary}
              />

              <Text style={styles.trustText}> Razorpay</Text>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  top: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 20,
    paddingTop: 48,
  },

  title: {
    fontSize: 24,
    fontFamily: fonts.bold,
    fontWeight: '700',
    textAlign: 'center',
    color: '#060D1F',
  },

  subtitle: {
    textAlign: 'center',
    marginTop: 6,
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: fonts.medium,
  },

  highlightText: {
    color: colors.darkPrimary,
    fontWeight: '700',
  },

  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 52,
    marginTop: 20,
    marginBottom: 16,
  },

  prefix: {
    fontWeight: '700',
    marginRight: 10,
    color: '#060D1F',
  },

  input: {
    flex: 1,
    fontFamily: fonts.medium,
    fontWeight: '700',
    color: '#060D1F',
  },

  or: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    fontFamily: fonts.medium,
  },

  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 16,
  },

  socialBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  trustBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.lg,
  },

  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  trustText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontWeight: '700',
  },

  divider: {
    width: 1,
    height: 14,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
});
