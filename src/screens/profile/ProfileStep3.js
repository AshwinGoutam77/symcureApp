import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fonts, spacing } from '../../theme';
import Button from '../../components/common/Button';
import FormCard from '../../components/common/FormCard';
import Input from '../../components/common/Input';

export default function ProfileStep3({ navigation }) {
  const [consent1, setConsent1] = useState(true);
  const [consent2, setConsent2] = useState(true);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Create Your Profile</Text>
        <Text style={styles.subtitle}>Step 3 of 3 — Identity & Consent</Text>

        <View style={styles.progress}>
          <View style={[styles.bar, styles.active]} />
          <View style={[styles.bar, styles.active]} />
          <View style={[styles.bar, styles.active]} />
        </View>
      </View>

      <FormCard>
        <Text style={styles.cardTitle}>
          Identity <Text style={styles.optional}>(Optional)</Text>
        </Text>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Locked after profile creation. Contact support to change.
          </Text>
        </View>

        <Input
          label="AADHAAR NUMBER *"
          placeholder="XXXX XXXX XXXX — masked after save"
        />

        <Input
          label="ABHA NUMBER *"
          placeholder="Ayushman Bharat Health Account"
        />
      </FormCard>

      <FormCard>
        <Text style={styles.cardTitle}>Consent</Text>

        {/* Checkbox 1 */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setConsent1(!consent1)}
        >
          <View style={[styles.checkbox, consent1 && styles.checked]}>
            {consent1 && <Text style={styles.tick}>✓</Text>}
          </View>

          <Text style={styles.checkboxText}>
            I consent to Symcure collecting my health data per the{' '}
            <Text style={styles.link}>Privacy Policy</Text> (DPDP Act 2023)
          </Text>
        </TouchableOpacity>

        {/* Checkbox 2 */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setConsent2(!consent2)}
        >
          <View style={[styles.checkbox, consent2 && styles.checked]}>
            {consent2 && <Text style={styles.tick}>✓</Text>}
          </View>

          <Text style={styles.checkboxText}>
            I agree to the <Text style={styles.link}>Terms of Service</Text> and
            confirm I am 18 or older
          </Text>
        </TouchableOpacity>
      </FormCard>

      {/* BUTTON */}
      <View style={styles.buttonWrap}>
        <Button
          title="Complete Profile"
          onPress={() => navigation.navigate('DataPrivacyScreen')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },

  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 4,
  },

  progress: {
    flexDirection: 'row',
    marginTop: 12,
  },

  bar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 10,
    marginRight: 6,
  },

  active: {
    backgroundColor: colors.primary,
  },

  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },

  phoneBox: {
    marginTop: 8,
  },

  label: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 6,
  },

  infoBox: {
    backgroundColor: '#E6EBF5',
    padding: 12,
    borderRadius: 10,
    marginVertical: 14,
  },

  inputRow: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFC',
  },

  prefix: {
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },

  divider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },

  placeholder: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
  },

  row: {
    flexDirection: 'row',
    marginTop: 8,
  },

  buttonWrap: {
    marginTop: 20,
    paddingHorizontal: 16,
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  tick: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  checkboxText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    lineHeight: 18,
  },

  link: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
  },
});
