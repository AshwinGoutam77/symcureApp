/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, fonts } from '../../theme';

function PolicyItem({ icon, color, text }) {
  return (
    <View style={styles.policyRow}>
      <View style={[styles.policyIconBox, { backgroundColor: color + '33', borderColor: color + '33' }]}>
        <Feather name={icon} size={16} color={color}  />
      </View>
      <Text style={styles.policyText}>{text}</Text>
    </View>
  );
}

function FaqItem({ title, open, onPress }) {
  return (
    <View style={styles.faqItem}>
      <TouchableOpacity onPress={onPress} style={styles.faqHeader}>
        <Text style={styles.faqTitle}>{title}</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={16} />
      </TouchableOpacity>

      {open && (
        <Text style={styles.faqContent}>
          A green Join button appears in your Appointments tab 15 minutes before your slot. Tap it to start the consultation.
        </Text>
      )}
    </View>
  );
}

export default function HelpSupportScreen({ navigation }) {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Feather name="arrow-left" size={18} color="#060D1F" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* CONTACT */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact Us</Text>

          {/* WhatsApp */}
          <View style={[styles.contactBox, styles.whatsapp]}>
            <View style={styles.iconBox}>
              <MIcon name="whatsapp" size={18} color="#25D366" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.contactTitle}>WhatsApp Support</Text>
              <Text style={styles.contactSub}>Usually replies within 30 min</Text>
              <Text style={styles.contactLink}>+91 98100 XXXXX</Text>
            </View>
          </View>

          {/* Email */}
          <View style={[styles.contactBox, styles.email]}>
            <View style={styles.iconBox}>
              <MIcon name="email-outline" size={18} color="#2E76FF" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.contactTitle}>Email Support</Text>
              <Text style={styles.contactSub}>Reply within 4–6 hours</Text>
              <Text style={styles.contactLink}>[email protected]</Text>
            </View>
          </View>
        </View>

        {/* REFUND POLICY */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.cardTitle}>Refund Policy</Text>
          </View>

          <PolicyItem
            icon="check"
            color="#22C55E"
            text="Cancelled before 15-min window: Full refund in 5–7 business days."
          />
          <PolicyItem
            icon="check"
            color="#22C55E"
            text="Doctor no-show: Full refund initiated within 24 hrs."
          />
          <PolicyItem
            icon="check"
            color="#22C55E"
            text="Technical failure: Full refund after investigation."
          />
          <PolicyItem
            icon="x"
            color="#EF4444"
            text="Within 15 min of slot: No cancellation or refund."
          />
        </View>

        {/* FAQ */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>FAQs</Text>

          <FaqItem
            title="How do I join my video consultation?"
            open={openFaq === 0}
            onPress={() => setOpenFaq(openFaq === 0 ? null : 0)}
          />

          <FaqItem
            title="How do I get my prescription?"
            open={openFaq === 1}
            onPress={() => setOpenFaq(openFaq === 1 ? null : 1)}
          />
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FD',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },

  back: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F4F7FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    fontWeight: '700',
  },

  card: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 10,
    borderRadius: 18,
    padding: 16,
  },

  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    marginBottom: 12,
    fontWeight: '700',
  },

  contactBox: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    alignItems: 'center',
  },

  whatsapp: {
    backgroundColor: '#E6F7EF',
    borderWidth: 1,
    borderColor: '#22C55E33',
  },

  email: {
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#2E76FF33',
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  contactTitle: {
    fontFamily: fonts.semiBold,
    fontWeight: '700',
    fontSize: 15,
  },

  contactSub: {
    fontSize: 13,
    color: '#7A879E',
    fontWeight: '700',
  },

  contactLink: {
    color: '#2E76FF',
    fontSize: 12,
    marginTop: 2,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  policyRow: {
    flexDirection: 'row',
    marginTop: 10,
  },

  policyIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
  },

  policyText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textPrimary,
    width: '80%',
    fontWeight: '700',
  },

  faqItem: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E6EBF5',
    paddingBottom: 20,
  },

  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  faqTitle: {
    fontFamily: fonts.medium,
    fontWeight: '700',
    fontSize: 16,
  },

  faqContent: {
    marginTop: 6,
    color: '#000000ff',
    fontSize: 13,
    lineHeight: 18,
  },
});