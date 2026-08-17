import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {colors, fonts} from '../../theme';
import Button from '../../components/common/Button';
import Feather from 'react-native-vector-icons/Feather';

export default function DataPrivacyScreen({navigation, route}) {
  const fromLogin = route?.params?.fromLogin;
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.gradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            navigation.goBack();
          }}>
          <Feather name="arrow-left" size={22} color="#ffffffff" />
        </TouchableOpacity>

        <Text style={styles.title}>Your Data,{'\n'}Your Rights.</Text>

        <Text style={styles.subtitle}>
          Under the <Text style={styles.bold}>DPDP Act 2023</Text>, you have
          full control over your health data.
        </Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* CONTENT */}
        <View style={styles.content}>
          {/* Card 1 */}
          <View style={[styles.card, styles.grey]}>
            <Text style={styles.cardTitle}>What we collect</Text>
            <Text style={styles.cardText}>
              Name, phone, DOB, address, consultation history, uploaded reports.
            </Text>
          </View>

          {/* Card 2 */}
          <View style={[styles.card, styles.green]}>
            <Text style={styles.cardTitle}>How we protect it</Text>
            <Text style={styles.cardText}>
              AWS Mumbai (India). AES-256 encryption. Reports via 60-min
              expiring signed URLs.
            </Text>
          </View>

          {/* Card 3 */}
          <View style={[styles.card, styles.beige]}>
            <Text style={styles.cardTitle}>Retention period</Text>
            <Text style={styles.cardText}>
              Medical records kept 3 years minimum by law. Deletion anonymises
              your identity.
            </Text>
          </View>

          {/* Card 4 */}
          <View style={[styles.card, styles.grey]}>
            <Text style={styles.cardTitle}>Your rights</Text>
            <Text style={styles.cardText}>
              Access, correct, or request deletion anytime from Profile → Data &
              Privacy.
            </Text>
          </View>

          {/* WARNING */}
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              Medical Emergency? Do NOT use Symcure for emergencies. Call 112 or
              go to the nearest hospital immediately. Symcure is for
              non-emergency consultations only.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={() => {
            if (fromLogin) {
              navigation.replace('Login'); // go back to login
            } else {
              navigation.replace('MainTabs'); // normal flow
            }
          }}
        />
      </View> */}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FD',
  },

  backBtn: {
    marginRight: 12,
    padding: 6,
    backgroundColor: 'rgba(251, 251, 251, 0.1)',
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  header: {
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  icon: {
    fontSize: 28,
    marginBottom: 10,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: '#fff',
    lineHeight: 34,
    fontWeight: '700',
  },

  subtitle: {
    fontFamily: fonts.regular,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },

  bold: {
    fontFamily: fonts.semiBold,
    color: '#fff',
  },

  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },

  grey: {
    backgroundColor: '#EEF2F7',
  },

  green: {
    backgroundColor: '#DFF3EA',
  },

  beige: {
    backgroundColor: '#F5EBDD',
  },

  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#454545ff',
    marginBottom: 6,
    fontWeight: '700',
  },

  cardText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    fontWeight: '600',
  },

  warning: {
    backgroundColor: '#FFE9E9',
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
  },

  warningText: {
    color: '#E53935',
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#F4F7FD',
    borderTopWidth: 1,
    borderTopColor: '#E6EBF5',
    paddingBottom: 40,
  },

  scrollContent: {
    paddingBottom: 120,
  },

  content: {
    padding: 16,
    marginTop: 20,
  },
});
